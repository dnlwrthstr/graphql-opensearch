from seed_data.common import get_opensearch_client, load_ndjson
import os

def seed_partners():
    # Get OpenSearch client
    client = get_opensearch_client()

    # Determine the correct path to the data file
    # Now that seed_data is at the root level, we only need to go up one directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'partners.ndjson')

    # Check if index exists and delete it if it does
    if client.indices.exists(index="partners"):
        client.indices.delete(index="partners")
        print("Deleted existing partners index")

    # Create mapping with name_suggest field for autocomplete, name field for full-text search, and keyword fields for dropdowns
    mapping = {
        "mappings": {
            "properties": {
                "name_suggest": {
                    "type": "completion"
                },
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
                "nationality": {
                    "type": "keyword"
                },
                "residency_country": {
                    "type": "keyword"
                },
                "partner_type": {
                    "type": "keyword"
                },
                "legal_entity_type": {
                    "type": "keyword"
                },
                "pep_flag": {
                    "type": "boolean"
                },
                "kyc_status": {
                    "type": "keyword"
                },
                "sanctions_screened": {
                    "type": "boolean"
                },
                "risk_level": {
                    "type": "keyword"
                },
                "account_type": {
                    "type": "keyword"
                }
            }
        }
    }

    # Create index with mapping
    client.indices.create(index="partners", body=mapping)
    print("Created partners index with completion suggester mapping")

    # Load partners data
    partners = load_ndjson(data_path)
    print(f"Loaded {len(partners)} partners")

    # Index partners with name_suggest field
    for doc in partners:
        # Add name_suggest field for autocomplete
        doc["name_suggest"] = {
            "input": doc["name"]
        }
        client.index(index="partners", id=doc["id"], body=doc)

    # Refresh index
    client.indices.refresh(index="partners")
    print("Partners data seeded with name_suggest field for autocomplete.")

if __name__ == "__main__":
    seed_partners()
