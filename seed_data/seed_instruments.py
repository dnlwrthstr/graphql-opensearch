from seed_data.common import get_opensearch_client, load_ndjson
import os

def seed_instruments():
    # Get OpenSearch client
    client = get_opensearch_client()

    # Determine the correct path to the data file
    # Now that seed_data is at the root level, we only need to go up one directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'financial_instruments.ndjson')

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
