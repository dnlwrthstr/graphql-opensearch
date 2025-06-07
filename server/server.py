from ariadne import QueryType, make_executable_schema, gql
from ariadne.asgi import GraphQL
from opensearchpy import OpenSearch, AuthenticationException
from starlette.applications import Starlette
from starlette.responses import JSONResponse
import os
import sys

# Get authentication credentials from environment variables or use defaults
username = os.environ.get("OPENSEARCH_USERNAME", "admin")
password = os.environ.get("OPENSEARCH_INITIAL_ADMIN_PASSWORD", "admin")

# OpenSearch client
try:
    client = OpenSearch(
        hosts=[{"host": os.environ.get("OPENSEARCH_HOST", "localhost"), "port": 9200}],
        http_auth=(username, password),
        use_ssl=False,
        verify_certs=False,
        http_compress=True
    )
except AuthenticationException as e:
    print(f"Authentication failed: {e}")
    print("Please check your OpenSearch credentials and try again.")
    sys.exit(1)
except Exception as e:
    print(f"Failed to connect to OpenSearch: {e}")
    sys.exit(1)

# GraphQL schema
type_defs = gql("""
    type Partner {
        id: ID!
        partner_type: String!
        name: String!
        birth_date: String
        incorporation_date: String
        residency_country: String
        tax_id: String
        nationality: String
        legal_entity_type: String
        kyc_status: String
        risk_level: String
        account_type: String
        pep_flag: Boolean
        sanctions_screened: Boolean
        created_at: String
        portfolios: [Portfolio!]!
    }

    type Position {
        instrument_id: String!
        quantity: Float!
        market_value: Float!
        currency: String!
        instrument: FinancialInstrument
    }

    type Portfolio {
        id: ID!
        owner_id: String!
        name: String!
        currency: String!
        created_at: String!
        positions: [Position!]!
    }

    type FinancialInstrument {
        id: ID!
        isin: String!
        name: String!
        issuer: String!
        currency: String!
        country: String!
        issue_date: String!
        maturity_date: String
        rating: String!
        type: String!
        exchange: String
        sector: String
        coupon: Float
        face_value: Int
        index_tracked: String
        total_expense_ratio: Float
        underlyings: [String!]
        barrier_level: Float
        capital_protection: Boolean
    }

    type PartnerSuggestion {
        id: ID!
        name: String!
        residency_country: String
        nationality: String
    }

    type InstrumentSuggestion {
        id: ID!
        name: String!
        isin: String!
        type: String
        currency: String
    }

    type Query {
        getPartner(id: ID!): Partner
        getPortfolio(id: ID!): Portfolio
        getFinancialInstrument(id: ID!): FinancialInstrument
        searchPartners(query: String, id: ID): [Partner!]!
        searchPortfolios(query: String, id: ID): [Portfolio!]!
        searchFinancialInstruments(query: String, id: ID): [FinancialInstrument!]!
        autocompletePartnerName(query: String!): [PartnerSuggestion!]!
        autocompleteInstrumentName(query: String!): [InstrumentSuggestion!]!
    }
""")

# Define resolvers
query = QueryType()

@query.field("searchPartners")
def resolve_search_partners(_, info, query=None, id=None):
    if query is None and id is None:
        raise ValueError("Either query or id must be provided")

    if id is not None:
        # Search by ID
        search_query = {"term": {"id": id}}
    else:
        # Search by query string
        search_query = {"multi_match": {"query": query, "fields": ["name", "partner_type", "residency_country", "nationality"]}}

    res = client.search(index="partners", body={"query": search_query})

    # Return results with _id included
    return [{"id": hit["_id"], **hit["_source"]} for hit in res["hits"]["hits"]]

@query.field("searchPortfolios")
def resolve_search_portfolios(_, info, query=None, id=None):
    if query is None and id is None:
        raise ValueError("Either query or id must be provided")

    if id is not None:
        # Search by ID
        search_query = {"term": {"id": id}}
    else:
        # Search by query string
        search_query = {"multi_match": {"query": query, "fields": ["name", "currency", "owner_id"]}}

    res = client.search(index="portfolios", body={"query": search_query})

    # Return results with _id included
    return [{"id": hit["_id"], **hit["_source"]} for hit in res["hits"]["hits"]]

@query.field("searchFinancialInstruments")
def resolve_search_financial_instruments(_, info, query=None, id=None):
    if query is None and id is None:
        raise ValueError("Either query or id must be provided")

    if id is not None:
        # Search by ID
        search_query = {"term": {"id": id}}
    else:
        # Search by query string
        search_query = {"multi_match": {"query": query, "fields": ["name", "issuer", "type", "isin", "currency", "country"]}}

    res = client.search(index="financial_instruments", body={"query": search_query})

    # Return results with _id included
    return [{"id": hit["_id"], **hit["_source"]} for hit in res["hits"]["hits"]]

# Define the resolver function
def resolve_get_partner(_, info, id):
    try:
        res = client.get(index="partners", id=id)
        # Include the ID in the response
        return {"id": res["_id"], **res["_source"]}
    except Exception as e:
        print(f"Error retrieving partner: {e}")
        return None

# Register the resolver using set_field method
query.set_field("getPartner", resolve_get_partner)

# Define the resolver function for getPortfolio
def resolve_get_portfolio(_, info, id):
    try:
        res = client.get(index="portfolios", id=id)
        # Include the ID in the response
        return {"id": res["_id"], **res["_source"]}
    except Exception as e:
        print(f"Error retrieving portfolio: {e}")
        return None

# Register the resolver using set_field method
query.set_field("getPortfolio", resolve_get_portfolio)

# Define the resolver function for getFinancialInstrument
def resolve_get_financial_instrument(_, info, id):
    try:
        res = client.get(index="financial_instruments", id=id)
        # Include the ID in the response
        return {"id": res["_id"], **res["_source"]}
    except Exception as e:
        print(f"Error retrieving financial instrument: {e}")
        return None

# Register the resolver using set_field method
query.set_field("getFinancialInstrument", resolve_get_financial_instrument)

# Define the resolver function for autocompletePartnerName
def resolve_autocomplete_partner_name(_, info, query):
    try:
        # Use OpenSearch's completion suggester for autocomplete
        suggest_query = {
            "suggest": {
                "name_completion": {
                    "prefix": query,
                    "completion": {
                        "field": "name_suggest",
                        "size": 10
                    }
                }
            }
        }

        res = client.search(index="partners", body=suggest_query)

        # Extract suggestions from the response
        suggestions = []
        if "suggest" in res and "name_completion" in res["suggest"]:
            for suggestion_group in res["suggest"]["name_completion"]:
                for option in suggestion_group["options"]:
                    # Get the full partner document to access additional fields
                    partner_id = option["_id"]
                    try:
                        partner_doc = client.get(index="partners", id=partner_id)
                        partner_source = partner_doc["_source"]

                        # Create a suggestion object with id, name, residency_country, and nationality
                        suggestion = {
                            "id": partner_id,
                            "name": option["text"],
                            "residency_country": partner_source.get("residency_country"),
                            "nationality": partner_source.get("nationality")
                        }
                        suggestions.append(suggestion)
                    except Exception as e:
                        print(f"Error retrieving partner details: {e}")
                        # Fall back to just the name if we can't get the full document
                        suggestions.append({"id": option["_id"], "name": option["text"], "residency_country": None, "nationality": None})

        return suggestions
    except Exception as e:
        print(f"Error getting partner name suggestions: {e}")
        return []

# Register the resolver for autocompletePartnerName
query.set_field("autocompletePartnerName", resolve_autocomplete_partner_name)

# Define the resolver function for autocompleteInstrumentName
def resolve_autocomplete_instrument_name(_, info, query):
    try:
        # Use a multi-match query to search in both name and ISIN fields
        search_query = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["name", "isin"],
                    "type": "phrase_prefix"
                }
            },
            "size": 10
        }

        res = client.search(index="financial_instruments", body=search_query)

        # Extract suggestions from the response
        suggestions = []
        for hit in res["hits"]["hits"]:
            instrument = hit["_source"]
            suggestion = {
                "id": hit["_id"],
                "name": instrument.get("name", ""),
                "isin": instrument.get("isin", ""),
                "type": instrument.get("type", ""),
                "currency": instrument.get("currency", "")
            }
            suggestions.append(suggestion)

        return suggestions
    except Exception as e:
        print(f"Error getting instrument suggestions: {e}")
        return []

# Register the resolver for autocompleteInstrumentName
query.set_field("autocompleteInstrumentName", resolve_autocomplete_instrument_name)

# Define resolvers for the new fields
from ariadne import ObjectType

partner_type = ObjectType("Partner")
position_type = ObjectType("Position")
portfolio_type = ObjectType("Portfolio")

@partner_type.field("portfolios")
def resolve_partner_portfolios(partner, info):
    # Get all portfolios for this partner
    search_query = {"match": {"owner_id": partner["id"]}}
    res = client.search(index="portfolios", body={"query": search_query})

    # Return results with _id included
    return [{"id": hit["_id"], **hit["_source"]} for hit in res["hits"]["hits"]]

@portfolio_type.field("positions")
def resolve_portfolio_positions(portfolio, info):
    # Return the positions array from the portfolio
    return portfolio.get("positions", [])

@position_type.field("instrument")
def resolve_position_instrument(position, info):
    try:
        # Get the instrument for this position
        res = client.get(index="financial_instruments", id=position["instrument_id"])
        # Include the ID in the response
        return {"id": res["_id"], **res["_source"]}
    except Exception as e:
        print(f"Error retrieving financial instrument: {e}")
        return None

print("Building schema...")
schema = make_executable_schema(type_defs, query, partner_type, position_type, portfolio_type)

# ASGI app
app = Starlette()

# Health check endpoint
@app.route("/health")
async def health_check(request):
    return JSONResponse({"status": "ok"})

print("Mounting GraphQL app with schema...")
graphql_app = GraphQL(schema, debug=True)
app.mount("/", graphql_app)

# Expose app at module level for Uvicorn
app = app
