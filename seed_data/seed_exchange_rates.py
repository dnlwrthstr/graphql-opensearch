import os
import json
from datetime import datetime
from seed_data.common import get_opensearch_client

def seed_exchange_rates():
    """
    Generate exchange rates and save them to both a JSON file and OpenSearch.
    The base currency is always CHF, so we don't build the cross product.
    """
    # Define the currencies we want to include
    currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "NZD"]

    # Define exchange rates with CHF as the base currency
    # These are example rates - in a real application, these would be fetched from an API
    exchange_rates = {
        "base_currency": "CHF",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "rates": {
            "USD": 1.12,  # 1 CHF = 1.12 USD
            "EUR": 1.03,  # 1 CHF = 1.03 EUR
            "GBP": 0.88,  # 1 CHF = 0.88 GBP
            "JPY": 167.25,  # 1 CHF = 167.25 JPY
            "CAD": 1.52,  # 1 CHF = 1.52 CAD
            "AUD": 1.68,  # 1 CHF = 1.68 AUD
            "NZD": 1.82   # 1 CHF = 1.82 NZD
        }
    }

    # Determine the correct path to the data file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'exchange_rates.json')

    # Write the exchange rates to a JSON file
    with open(data_path, 'w') as f:
        json.dump(exchange_rates, f, indent=2)

    print(f"Exchange rates data saved to {data_path}")

    # Also save to OpenSearch
    client = get_opensearch_client()

    # Check if index exists and create it if it doesn't
    if not client.indices.exists(index="exchange_rates"):
        # Create mapping for exchange_rates index
        mapping = {
            "mappings": {
                "properties": {
                    "base_currency": {"type": "keyword"},
                    "date": {"type": "date"},
                    "rates": {
                        "properties": {
                            "USD": {"type": "float"},
                            "EUR": {"type": "float"},
                            "GBP": {"type": "float"},
                            "JPY": {"type": "float"},
                            "CAD": {"type": "float"},
                            "AUD": {"type": "float"},
                            "NZD": {"type": "float"}
                        }
                    }
                }
            }
        }
        client.indices.create(index="exchange_rates", body=mapping)
        print("Created exchange_rates index with mapping")

    # Index the exchange rates
    client.index(index="exchange_rates", body=exchange_rates)

    # Refresh the index
    client.indices.refresh(index="exchange_rates")
    print("Exchange rates data seeded to OpenSearch")

if __name__ == "__main__":
    seed_exchange_rates()
