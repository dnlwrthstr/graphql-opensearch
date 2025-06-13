from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import os
from opensearchpy import OpenSearch

# Create FastAPI app
app = FastAPI(title="Portfolio Service", description="Service for portfolio calculations and aggregations")

# Define models
class Position(BaseModel):
    instrument_id: str
    quantity: float
    market_value: float
    currency: str
    instrument_type: str
    ref_currency: str
    value_in_ref_currency: float

class InstrumentGroup(BaseModel):
    instrument_type: str
    positions: List[Position]
    total_value: float

class PortfolioResponse(BaseModel):
    portfolio_id: str
    reference_currency: str
    total_portfolio_value: float
    instrument_groups: List[InstrumentGroup]

# Get OpenSearch client
def get_opensearch_client():
    # Get connection details from environment variables or use defaults
    host = os.environ.get("OPENSEARCH_HOST", "localhost")
    port = int(os.environ.get("OPENSEARCH_PORT", 9200))
    username = os.environ.get("OPENSEARCH_USERNAME", "admin")
    password = os.environ.get("OPENSEARCH_INITIAL_ADMIN_PASSWORD", "StrongP@ssw0rd!123")

    # Create the client instance
    client = OpenSearch(
        hosts=[{"host": host, "port": port}],
        http_auth=(username, password),
        http_compress=True,
        use_ssl=False,
        verify_certs=False,
        ssl_show_warn=False,
    )
    return client

# Load exchange rates from OpenSearch
def load_exchange_rates(client=None):
    if client is None:
        client = get_opensearch_client()

    try:
        # Get the latest exchange rates from OpenSearch
        result = client.search(
            index="exchange_rates",
            body={
                "size": 1,
                "sort": [{"date": {"order": "desc"}}]
            }
        )

        if result["hits"]["total"]["value"] > 0:
            return result["hits"]["hits"][0]["_source"]
        else:
            raise ValueError("No exchange rates found in OpenSearch")
    except Exception as e:
        # Re-raise the exception with a more descriptive message
        raise Exception(f"Error loading exchange rates from OpenSearch: {e}")

# Convert value from one currency to another
def convert_currency(value, from_currency, to_currency, exchange_rates):
    # If currencies are the same, no conversion needed
    if from_currency == to_currency:
        return value

    base_currency = exchange_rates["base_currency"]
    rates = exchange_rates["rates"]

    # Add base currency to rates with rate 1.0
    all_rates = {**rates, base_currency: 1.0}

    # Check if currencies are supported
    if from_currency not in all_rates and from_currency != base_currency:
        raise ValueError(f"Unsupported currency: {from_currency}")
    if to_currency not in all_rates and to_currency != base_currency:
        raise ValueError(f"Unsupported currency: {to_currency}")

    # Convert from source currency to base currency (CHF)
    if from_currency != base_currency:
        # The rate is how many units of currency per 1 CHF
        # So to convert to CHF, divide by the rate
        value_in_base = value / all_rates[from_currency]
    else:
        value_in_base = value

    # Convert from base currency to target currency
    if to_currency != base_currency:
        # Multiply by the rate to get the value in target currency
        return value_in_base * all_rates[to_currency]
    else:
        return value_in_base

@app.get("/portfolio/{portfolio_id}")
async def get_portfolio(portfolio_id: str, reference_currency: str):
    client = get_opensearch_client()
    exchange_rates = load_exchange_rates(client)

    try:
        # Get portfolio
        portfolio_result = client.get(index="portfolios", id=portfolio_id)
        portfolio = {"id": portfolio_result["_id"], **portfolio_result["_source"]}

        # Get positions
        positions = portfolio.get("positions", [])

        # Get instrument details for each position
        enriched_positions = []
        for position in positions:
            try:
                # Get instrument
                instrument_result = client.get(index="financial_instruments", id=position["instrument_id"])
                instrument = {"id": instrument_result["_id"], **instrument_result["_source"]}

                # Convert market value to reference currency
                value_in_ref_currency = convert_currency(
                    position["market_value"],
                    position["currency"],
                    reference_currency,
                    exchange_rates
                )

                # Create enriched position
                enriched_position = Position(
                    instrument_id=position["instrument_id"],
                    quantity=position["quantity"],
                    market_value=position["market_value"],
                    currency=position["currency"],
                    instrument_type=instrument.get("type", "Unknown"),
                    ref_currency=reference_currency,
                    value_in_ref_currency=value_in_ref_currency
                )

                enriched_positions.append(enriched_position)
            except Exception as e:
                # Log error but continue processing other positions
                print(f"Error processing position {position['instrument_id']}: {e}")

        # Group positions by instrument type
        instrument_groups = {}
        total_portfolio_value = 0.0

        for position in enriched_positions:
            instrument_type = position.instrument_type
            if instrument_type not in instrument_groups:
                instrument_groups[instrument_type] = {
                    "instrument_type": instrument_type,
                    "positions": [],
                    "total_value": 0.0
                }

            instrument_groups[instrument_type]["positions"].append(position)
            instrument_groups[instrument_type]["total_value"] += position.value_in_ref_currency
            total_portfolio_value += position.value_in_ref_currency

        # Convert to list and sort by instrument type
        instrument_groups_list = list(instrument_groups.values())
        instrument_groups_list.sort(key=lambda x: x["instrument_type"])

        # Create response
        response = PortfolioResponse(
            portfolio_id=portfolio_id,
            reference_currency=reference_currency,
            total_portfolio_value=total_portfolio_value,
            instrument_groups=[InstrumentGroup(**group) for group in instrument_groups_list]
        )

        # Format response to match exactly the required JSON structure
        formatted_response = {
            "portfolio_id": response.portfolio_id,
            "reference_currency": response.reference_currency,
            "total_portfolio_value": response.total_portfolio_value,
            "instrument_groups": []
        }

        for group in response.instrument_groups:
            formatted_group = {
                "instrument_type": group.instrument_type,
                "total_value": group.total_value,
                "positions": []
            }

            for position in group.positions:
                formatted_position = {
                    "instrument_id": position.instrument_id,
                    "quantity": position.quantity,
                    "market_value": position.market_value,
                    "currency": position.currency,
                    "instrument_type": position.instrument_type,
                    "ref_currency": position.ref_currency,
                    "value_in_ref_currency": position.value_in_ref_currency
                }
                formatted_group["positions"].append(formatted_position)

            formatted_response["instrument_groups"].append(formatted_group)

        return formatted_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing portfolio: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
