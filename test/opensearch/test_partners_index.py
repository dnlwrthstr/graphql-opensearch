import unittest
import os
import sys
from opensearchpy import OpenSearch

# Add the parent directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestPartnersIndex(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up OpenSearch client for all tests"""
        # Get authentication credentials from environment variables or use defaults
        username = os.environ.get("OPENSEARCH_USERNAME", "admin")
        password = os.environ.get("OPENSEARCH_INITIAL_ADMIN_PASSWORD", "StrongP@ssw0rd!123")

        # OpenSearch client
        cls.client = OpenSearch(
            hosts=[{"host": os.environ.get("OPENSEARCH_HOST", "localhost"), "port": 9200}],
            http_auth=(username, password),
            use_ssl=False,
            verify_certs=False,
            http_compress=True
        )

        # Verify that the partners index exists
        cls.index_exists = cls.client.indices.exists(index="partners")

    def test_index_exists(self):
        """Test that the partners index exists"""
        self.assertTrue(self.index_exists, "Partners index does not exist")

    def test_index_mapping(self):
        """Test that the partners index has the correct mapping"""
        if not self.index_exists:
            self.skipTest("Partners index does not exist")

        # Get the mapping for the partners index
        mapping = self.client.indices.get_mapping(index="partners")

        # Verify that the name_suggest field exists and is of type completion
        self.assertIn("partners", mapping)
        properties = mapping["partners"]["mappings"]["properties"]
        self.assertIn("name_suggest", properties)
        self.assertEqual(properties["name_suggest"]["type"], "completion")

    def test_basic_search(self):
        """Test basic search functionality"""
        if not self.index_exists:
            self.skipTest("Partners index does not exist")

        # Search for partners with a simple query
        search_query = {"match_all": {}}
        res = self.client.search(index="partners", body={"query": search_query, "size": 10})

        # Verify that we got some results
        self.assertGreater(res["hits"]["total"]["value"], 0, "No partners found in the index")

        # Verify that the results have the expected fields
        hit = res["hits"]["hits"][0]
        self.assertIn("_id", hit)
        self.assertIn("_source", hit)
        self.assertIn("name", hit["_source"])
        self.assertIn("partner_type", hit["_source"])

    def test_query_by_name(self):
        """Test querying partners by name"""
        if not self.index_exists:
            self.skipTest("Partners index does not exist")

        # Get a partner name from the index to use for testing
        res = self.client.search(index="partners", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No partners found in the index")

        partner_name = res["hits"]["hits"][0]["_source"]["name"]

        # Search for partners with the name
        search_query = {"match": {"name": partner_name}}
        res = self.client.search(index="partners", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No partners found with name '{partner_name}'")

        # Verify that all results have the expected name
        for hit in res["hits"]["hits"]:
            self.assertEqual(hit["_source"]["name"], partner_name)

    def test_autocomplete(self):
        """Test autocomplete functionality using the name_suggest field"""
        if not self.index_exists:
            self.skipTest("Partners index does not exist")

        # Get a partner name from the index to use for testing
        res = self.client.search(index="partners", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No partners found in the index")

        partner_name = res["hits"]["hits"][0]["_source"]["name"]
        prefix = partner_name[:3]  # Use the first 3 characters as the prefix

        # Use the completion suggester to get autocomplete suggestions
        suggest_query = {
            "suggest": {
                "name_completion": {
                    "prefix": prefix,
                    "completion": {
                        "field": "name_suggest",
                        "size": 10
                    }
                }
            }
        }

        res = self.client.search(index="partners", body=suggest_query)

        # Verify that we got some suggestions
        self.assertIn("suggest", res)
        self.assertIn("name_completion", res["suggest"])
        suggestions = res["suggest"]["name_completion"][0]["options"]
        self.assertGreater(len(suggestions), 0, f"No autocomplete suggestions found for prefix '{prefix}'")

        # Verify that all suggestions start with the prefix
        for suggestion in suggestions:
            self.assertTrue(suggestion["text"].lower().startswith(prefix.lower()))

if __name__ == '__main__':
    unittest.main()
