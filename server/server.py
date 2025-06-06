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
    }

    type Position {
        instrument_id: String!
        quantity: Float!
        market_value: Float!
        currency: String!
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

    type Query {
        getPartner(id: ID!): Partner
        getPortfolio(id: ID!): Portfolio
        getFinancialInstrument(id: ID!): FinancialInstrument
        searchPartners(query: String!): [Partner!]!
        searchPortfolios(query: String!): [Portfolio!]!
        searchFinancialInstruments(query: String!): [FinancialInstrument!]!
    }
""")

# Define resolvers
query = QueryType()

@query.field("searchPartners")
def resolve_search_partners(_, info, query):
    res = client.search(index="partners", body={
        "query": {"multi_match": {"query": query, "fields": ["name", "partner_type", "residency_country", "nationality"]}}
    })
    return [hit["_source"] for hit in res["hits"]["hits"]]

@query.field("searchPortfolios")
def resolve_search_portfolios(_, info, query):
    res = client.search(index="portfolios", body={
        "query": {"multi_match": {"query": query, "fields": ["name", "currency", "owner_id"]}}
    })
    return [hit["_source"] for hit in res["hits"]["hits"]]

@query.field("searchFinancialInstruments")
def resolve_search_financial_instruments(_, info, query):
    res = client.search(index="financial_instruments", body={
        "query": {"multi_match": {"query": query, "fields": ["name", "issuer", "type", "isin", "currency", "country"]}}
    })
    return [hit["_source"] for hit in res["hits"]["hits"]]

# Define the resolver function
def resolve_get_partner(_, info, id):
    try:
        res = client.get(index="partners", id=id)
        return res["_source"]
    except Exception as e:
        print(f"Error retrieving partner: {e}")
        return None

# Register the resolver using set_field method
query.set_field("getPartner", resolve_get_partner)

# Define the resolver function for getPortfolio
def resolve_get_portfolio(_, info, id):
    try:
        res = client.get(index="portfolios", id=id)
        return res["_source"]
    except Exception as e:
        print(f"Error retrieving portfolio: {e}")
        return None

# Register the resolver using set_field method
query.set_field("getPortfolio", resolve_get_portfolio)

# Define the resolver function for getFinancialInstrument
def resolve_get_financial_instrument(_, info, id):
    try:
        res = client.get(index="financial_instruments", id=id)
        return res["_source"]
    except Exception as e:
        print(f"Error retrieving financial instrument: {e}")
        return None

# Register the resolver using set_field method
query.set_field("getFinancialInstrument", resolve_get_financial_instrument)

print("Building schema...")
schema = make_executable_schema(type_defs, query)

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
