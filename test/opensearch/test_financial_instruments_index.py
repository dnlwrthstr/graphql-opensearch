import unittest
import os
import sys
from opensearchpy import OpenSearch

# Add the parent directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestFinancialInstrumentsIndex(unittest.TestCase):
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

        # Verify that the financial_instruments index exists
        cls.index_exists = cls.client.indices.exists(index="financial_instruments")

    def test_index_exists(self):
        """Test that the financial_instruments index exists"""
        self.assertTrue(self.index_exists, "Financial instruments index does not exist")

    def test_index_mapping(self):
        """Test that the financial_instruments index has the expected fields"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Get the mapping for the financial_instruments index
        mapping = self.client.indices.get_mapping(index="financial_instruments")

        # Verify that the index exists in the mapping
        self.assertIn("financial_instruments", mapping)

        # Get a sample document to check its fields
        res = self.client.search(index="financial_instruments", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No financial instruments found in the index")

        # Check that the sample document has the expected fields
        sample = res["hits"]["hits"][0]["_source"]
        expected_fields = ["id", "isin", "name", "issuer", "currency", "country", "issue_date", "rating", "type"]
        for field in expected_fields:
            self.assertIn(field, sample, f"Field '{field}' not found in financial instrument document")

    def test_basic_search(self):
        """Test basic search functionality"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Search for financial instruments with a simple query
        search_query = {"match_all": {}}
        res = self.client.search(index="financial_instruments", body={"query": search_query, "size": 10})

        # Verify that we got some results
        self.assertGreater(res["hits"]["total"]["value"], 0, "No financial instruments found in the index")

        # Verify that the results have the expected fields
        hit = res["hits"]["hits"][0]
        self.assertIn("_id", hit)
        self.assertIn("_source", hit)
        self.assertIn("name", hit["_source"])
        self.assertIn("isin", hit["_source"])
        self.assertIn("type", hit["_source"])

    def test_query_by_isin(self):
        """Test querying financial instruments by ISIN"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Get a financial instrument ISIN from the index to use for testing
        res = self.client.search(index="financial_instruments", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No financial instruments found in the index")

        isin = res["hits"]["hits"][0]["_source"]["isin"]

        # Search for financial instruments with the ISIN
        # Use isin.keyword for exact matching since isin is now a text field with a keyword subfield
        search_query = {"term": {"isin.keyword": isin}}
        res = self.client.search(index="financial_instruments", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No financial instruments found with ISIN '{isin}'")

        # Verify that all results have the expected ISIN
        for hit in res["hits"]["hits"]:
            self.assertEqual(hit["_source"]["isin"], isin)

    def test_query_by_name(self):
        """Test querying financial instruments by name"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Get a financial instrument name from the index to use for testing
        res = self.client.search(index="financial_instruments", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No financial instruments found in the index")

        name = res["hits"]["hits"][0]["_source"]["name"]

        # Search for financial instruments with the name
        search_query = {"match": {"name": name}}
        res = self.client.search(index="financial_instruments", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No financial instruments found with name '{name}'")

        # Verify that all results have the expected name
        for hit in res["hits"]["hits"]:
            self.assertEqual(hit["_source"]["name"], name)

    def test_query_by_type(self):
        """Test querying financial instruments by type"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Get a financial instrument type from the index to use for testing
        res = self.client.search(index="financial_instruments", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No financial instruments found in the index")

        instrument_type = res["hits"]["hits"][0]["_source"]["type"]

        # Search for financial instruments with the type
        search_query = {"term": {"type": instrument_type}}
        res = self.client.search(index="financial_instruments", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No financial instruments found with type '{instrument_type}'")

        # Verify that all results have the expected type
        for hit in res["hits"]["hits"]:
            self.assertEqual(hit["_source"]["type"], instrument_type)

    def test_multi_match_query(self):
        """Test multi-match query across multiple fields"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Get a financial instrument from the index to use for testing
        res = self.client.search(index="financial_instruments", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No financial instruments found in the index")

        # Use the issuer as the query term
        issuer = res["hits"]["hits"][0]["_source"]["issuer"]

        # Search for financial instruments with the issuer in multiple fields
        search_query = {
            "multi_match": {
                "query": issuer,
                "fields": ["name", "issuer", "type"]
            }
        }

        res = self.client.search(index="financial_instruments", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No financial instruments found matching '{issuer}' in multiple fields")

    def test_query_with_filter(self):
        """Test querying financial instruments with a filter"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Get a financial instrument currency from the index to use for testing
        res = self.client.search(index="financial_instruments", body={"query": {"match_all": {}}, "size": 1})
        if res["hits"]["total"]["value"] == 0:
            self.skipTest("No financial instruments found in the index")

        currency = res["hits"]["hits"][0]["_source"]["currency"]

        # Search for financial instruments with the currency
        search_query = {
            "bool": {
                "filter": {
                    "term": {
                        "currency": currency
                    }
                }
            }
        }

        res = self.client.search(index="financial_instruments", body={"query": search_query})

        # Verify that we got at least one result
        self.assertGreater(res["hits"]["total"]["value"], 0, f"No financial instruments found with currency '{currency}'")

        # Verify that all results have the expected currency
        for hit in res["hits"]["hits"]:
            self.assertEqual(hit["_source"]["currency"], currency)

    def test_query_with_aggregation(self):
        """Test querying financial instruments with an aggregation"""
        if not self.index_exists:
            self.skipTest("Financial instruments index does not exist")

        # Search for financial instruments with an aggregation on type
        agg_query = {
            "query": {"match_all": {}},
            "aggs": {
                "types": {
                    "terms": {
                        "field": "type"
                    }
                }
            },
            "size": 0  # We don't need the actual documents, just the aggregation
        }

        res = self.client.search(index="financial_instruments", body=agg_query)

        # Verify that we got the aggregation results
        self.assertIn("aggregations", res)
        self.assertIn("types", res["aggregations"])
        self.assertIn("buckets", res["aggregations"]["types"])

        # Verify that we got at least one bucket
        buckets = res["aggregations"]["types"]["buckets"]
        self.assertGreater(len(buckets), 0, "No type buckets found in aggregation")

        # Verify that each bucket has a key and doc_count
        for bucket in buckets:
            self.assertIn("key", bucket)
            self.assertIn("doc_count", bucket)
            self.assertGreater(bucket["doc_count"], 0)

if __name__ == '__main__':
    unittest.main()
