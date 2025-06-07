import unittest
import os
import sys
from opensearchpy import OpenSearch

# Add the parent directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestPortfoliosIndex(unittest.TestCase):
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

        # Verify that the portfolios index exists
        cls.index_exists = cls.client.indices.exists(index="portfolios")

    def test_index_exists(self):
        """Test that the portfolios index exists"""
        self.assertTrue(self.index_exists, "Portfolios index does not exist")

    def test_index_mapping(self):
        """Test that the portfolios index has the correct mapping"""
        if not self.index_exists:
            self.skipTest("Portfolios index does not exist")

        # Get the mapping for the portfolios index
        mapping = self.client.indices.get_mapping(index="portfolios")

        # Verify that the positions field exists and is of type nested
        self.assertIn("portfolios", mapping)
        properties = mapping["portfolios"]["mappings"]["properties"]
        self.assertIn("positions", properties)
        self.assertEqual(properties["positions"]["type"], "nested")

        # Verify that the positions field has the expected properties
        position_properties = properties["positions"]["properties"]
        self.assertIn("instrument_id", position_properties)
        self.assertEqual(position_properties["instrument_id"]["type"], "keyword")
        self.assertIn("quantity", position_properties)
        self.assertEqual(position_properties["quantity"]["type"], "float")
        self.assertIn("market_value", position_properties)
        self.assertEqual(position_properties["market_value"]["type"], "float")
        self.assertIn("currency", position_properties)
        self.assertEqual(position_properties["currency"]["type"], "keyword")

    def test_basic_search(self):
        """Test basic search functionality"""
        if not self.index_exists:
            self.skipTest("Portfolios index does not exist")

        # Search for portfolios with a simple query
        search_query = {"match_all": {}}
        res = self.client.search(index="portfolios", body={"query": search_query, "size": 10})

        # Verify that we got some results
        self.assertGreater(res["hits"]["total"]["value"], 0, "No portfolios found in the index")

        # Verify that the results have the expected fields
        hit = res["hits"]["hits"][0]
        self.assertIn("_id", hit)
        self.assertIn("_source", hit)
        self.assertIn("name", hit["_source"])
        self.assertIn("owner_id", hit["_source"])
        self.assertIn("currency", hit["_source"])
        self.assertIn("positions", hit["_source"])

    def test_query_by_name(self):
        """Test querying portfolios by name"""
        if not self.index_exists:
            self.skipTest("Portfolios index does not exist")

        # Get a portfolio name from the index to use for testing
        res = self.client.search(index="portfolios", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No portfolios found in the index")

        portfolio_name = res["hits"]["hits"][0]["_source"]["name"]

        # Search for portfolios with the name
        search_query = {"match": {"name": portfolio_name}}
        res = self.client.search(index="portfolios", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No portfolios found with name '{portfolio_name}'")

        # Verify that all results have the expected name
        for hit in res["hits"]["hits"]:
            self.assertEqual(hit["_source"]["name"], portfolio_name)

    def test_nested_query(self):
        """Test querying nested positions"""
        if not self.index_exists:
            self.skipTest("Portfolios index does not exist")

        # Get a portfolio with positions from the index to use for testing
        res = self.client.search(index="portfolios", body={"query": {"match_all": {}}, "size": 10})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No portfolios found in the index")

        # Find a portfolio with positions
        portfolio_with_positions = None
        for hit in res["hits"]["hits"]:
            if hit["_source"].get("positions") and len(hit["_source"]["positions"]) > 0:
                portfolio_with_positions = hit["_source"]
                break

        if not portfolio_with_positions:
            self.skipTest("No portfolios with positions found in the index")

        # Get an instrument_id from the positions
        instrument_id = portfolio_with_positions["positions"][0]["instrument_id"]

        # Search for portfolios with the instrument_id in positions
        nested_query = {
            "nested": {
                "path": "positions",
                "query": {
                    "term": {
                        "positions.instrument_id": instrument_id
                    }
                }
            }
        }

        res = self.client.search(index="portfolios", body={"query": nested_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No portfolios found with instrument_id '{instrument_id}' in positions")

        # Verify that all results have the expected instrument_id in positions
        for hit in res["hits"]["hits"]:
            positions = hit["_source"]["positions"]
            instrument_ids = [position["instrument_id"] for position in positions]
            self.assertIn(instrument_id, instrument_ids)

    def test_nested_query_with_inner_hits(self):
        """Test querying nested positions with inner_hits to return matching positions"""
        if not self.index_exists:
            self.skipTest("Portfolios index does not exist")

        # Get a portfolio with positions from the index to use for testing
        res = self.client.search(index="portfolios", body={"query": {"match_all": {}}, "size": 10})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No portfolios found in the index")

        # Find a portfolio with positions
        portfolio_with_positions = None
        for hit in res["hits"]["hits"]:
            if hit["_source"].get("positions") and len(hit["_source"]["positions"]) > 0:
                portfolio_with_positions = hit["_source"]
                break

        if not portfolio_with_positions:
            self.skipTest("No portfolios with positions found in the index")

        # Get an instrument_id from the positions
        instrument_id = portfolio_with_positions["positions"][0]["instrument_id"]

        # Search for portfolios with the instrument_id in positions, and return the matching positions
        nested_query = {
            "nested": {
                "path": "positions",
                "query": {
                    "term": {
                        "positions.instrument_id": instrument_id
                    }
                },
                "inner_hits": {}
            }
        }

        res = self.client.search(index="portfolios", body={"query": nested_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No portfolios found with instrument_id '{instrument_id}' in positions")

        # Verify that inner_hits contains the matching positions
        for hit in res["hits"]["hits"]:
            self.assertIn("inner_hits", hit)
            self.assertIn("positions", hit["inner_hits"])
            inner_hits = hit["inner_hits"]["positions"]["hits"]["hits"]
            self.assertGreater(len(inner_hits), 0, "No matching positions found in inner_hits")

            # Verify that all inner_hits have the expected instrument_id
            for inner_hit in inner_hits:
                self.assertEqual(inner_hit["_source"]["instrument_id"], instrument_id)

    def test_nested_query_with_filter(self):
        """Test querying nested positions with a filter on quantity"""
        if not self.index_exists:
            self.skipTest("Portfolios index does not exist")

        # Get a portfolio with positions from the index to use for testing
        res = self.client.search(index="portfolios", body={"query": {"match_all": {}}, "size": 10})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No portfolios found in the index")

        # Find a portfolio with positions
        portfolio_with_positions = None
        for hit in res["hits"]["hits"]:
            if hit["_source"].get("positions") and len(hit["_source"]["positions"]) > 0:
                portfolio_with_positions = hit["_source"]
                break

        if not portfolio_with_positions:
            self.skipTest("No portfolios with positions found in the index")

        # Search for portfolios with positions where quantity > 0
        nested_query = {
            "nested": {
                "path": "positions",
                "query": {
                    "range": {
                        "positions.quantity": {
                            "gt": 0
                        }
                    }
                }
            }
        }

        res = self.client.search(index="portfolios", body={"query": nested_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, "No portfolios found with positions where quantity > 0")

        # Verify that all results have at least one position with quantity > 0
        for hit in res["hits"]["hits"]:
            positions = hit["_source"]["positions"]
            quantities = [position["quantity"] for position in positions]
            self.assertTrue(any(quantity > 0 for quantity in quantities))

if __name__ == '__main__':
    unittest.main()
