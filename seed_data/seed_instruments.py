from seed_data.common import get_opensearch_client, load_ndjson
import os

def seed_instruments():
    # Get OpenSearch client
    client = get_opensearch_client()

    # Determine the correct path to the data file
    # Now that seed_data is at the root level, we only need to go up one directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'financial_instruments.ndjson')

    # Check if index exists and delete it if it does
    if client.indices.exists(index="financial_instruments"):
        client.indices.delete(index="financial_instruments")
        print("Deleted existing financial_instruments index")

    # Create mapping with specific field types for all instrument types
    mapping = {
        "mappings": {
            "properties": {
                # Common fields for all instruments
                "id": {"type": "keyword"},
                "isin": {"type": "keyword"},
                "name": {
                    "type": "text",
                    "analyzer": "standard",
                    "fields": {
                        "keyword": {
                            "type": "keyword",
                            "ignore_above": 256
                        }
                    }
                },
                "issuer": {"type": "keyword"},
                "currency": {"type": "keyword"},
                "country": {"type": "keyword"},
                "issue_date": {"type": "date"},
                "maturity_date": {"type": "date"},
                "rating": {"type": "keyword"},
                "type": {"type": "keyword"},

                # Share-specific fields
                "exchange": {"type": "keyword"},
                "sector": {"type": "keyword"},

                # Bond-specific fields
                "coupon": {"type": "float"},
                "face_value": {"type": "integer"},

                # ETF-specific fields
                "index_tracked": {"type": "keyword"},
                "total_expense_ratio": {"type": "float"},

                # Structured Product-specific fields
                "underlyings": {"type": "keyword"},
                "barrier_level": {"type": "float"},
                "capital_protection": {"type": "boolean"}
            }
        }
    }

    # Create index with mapping
    client.indices.create(index="financial_instruments", body=mapping)
    print("Created financial_instruments index with type-specific field mappings")

    # Load financial instruments data
    financial_instruments = load_ndjson(data_path)
    print(f"Loaded {len(financial_instruments)} financial instruments")

    # Index financial instruments
    for doc in financial_instruments:
        client.index(index="financial_instruments", id=doc["id"], body=doc)

    # Refresh index
    client.indices.refresh(index="financial_instruments")
    print("Financial instruments data seeded.")

if __name__ == "__main__":
    seed_instruments()
