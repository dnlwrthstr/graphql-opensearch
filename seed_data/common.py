from opensearchpy import OpenSearch, AuthenticationException
import time
import os
import sys
import json

def get_opensearch_client():
    # Get authentication credentials from environment variables or use defaults
    username = os.environ.get("OPENSEARCH_USERNAME", "admin")
    password = os.environ.get("OPENSEARCH_INITIAL_ADMIN_PASSWORD", "StrongP@ssw0rd!123")

    print(f"Connecting to OpenSearch at {os.environ.get('OPENSEARCH_HOST', 'localhost')}:9200")
    print(f"Using username: {username}")

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

    # Wait for OpenSearch to be ready
    for _ in range(10):
        try:
            if client.ping():
                break
        except Exception:
            time.sleep(1)
    
    return client

# Function to load data from NDJSON files
def load_ndjson(file_path):
    data = []
    with open(file_path, 'r') as f:
        for line in f:
            data.append(json.loads(line))
    return data