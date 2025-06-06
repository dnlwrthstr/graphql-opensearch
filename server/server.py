from ariadne import QueryType, make_executable_schema, gql
from ariadne.asgi import GraphQL
from opensearchpy import OpenSearch, AuthenticationException
from starlette.applications import Starlette
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
    type Paper {
        id: ID!
        title: String!
        authors: [String!]!
    }

    type Dataset {
        id: ID!
        name: String!
        domain: String
    }

    type Query {
        searchPapers(query: String!): [Paper!]!
        searchDatasets(query: String!): [Dataset!]!
    }
""")

# Define resolvers
query = QueryType()

@query.field("searchPapers")
def resolve_search_papers(_, info, query):
    res = client.search(index="papers", body={
        "query": {"match": {"content": query}}
    })
    return [
        {
            "id": hit["_id"],
            "title": hit["_source"].get("title", ""),
            "authors": hit["_source"].get("authors", [])
        } for hit in res["hits"]["hits"]
    ]

@query.field("searchDatasets")
def resolve_search_datasets(_, info, query):
    res = client.search(index="datasets", body={
        "query": {"match": {"description": query}}
    })
    return [
        {
            "id": hit["_id"],
            "name": hit["_source"].get("name", ""),
            "domain": hit["_source"].get("domain", "")
        } for hit in res["hits"]["hits"]
    ]

schema = make_executable_schema(type_defs, query)

# ASGI app
app = Starlette()
app.mount("/", GraphQL(schema, debug=True))
