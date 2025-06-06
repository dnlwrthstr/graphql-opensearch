from seed_data.common import get_opensearch_client, load_ndjson
import os

def seed_partners():
    # Get OpenSearch client
    client = get_opensearch_client()

    # Determine the correct path to the data file
    # Now that seed_data is at the root level, we only need to go up one directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'partners.ndjson')

    # Load partners data
    partners = load_ndjson(data_path)
    print(f"Loaded {len(partners)} partners")

    # Index partners
    for doc in partners:
        client.index(index="partners", id=doc["id"], body=doc)

    # Refresh index
    client.indices.refresh(index="partners")
    print("Partners data seeded.")

if __name__ == "__main__":
    seed_partners()
