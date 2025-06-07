from seed_data.common import get_opensearch_client, load_ndjson
import os

def seed_portfolios():
    # Get OpenSearch client
    client = get_opensearch_client()

    # Determine the correct path to the data file
    # Now that seed_data is at the root level, we only need to go up one directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'portfolios.ndjson')

    # Check if index exists and delete it if it does
    if client.indices.exists(index="portfolios"):
        client.indices.delete(index="portfolios")
        print("Deleted existing portfolios index")

    # Load portfolios data
    portfolios = load_ndjson(data_path)
    print(f"Loaded {len(portfolios)} portfolios")

    # Index portfolios
    for doc in portfolios:
        client.index(index="portfolios", id=doc["id"], body=doc)

    # Refresh index
    client.indices.refresh(index="portfolios")
    print("Portfolios data seeded.")

if __name__ == "__main__":
    seed_portfolios()