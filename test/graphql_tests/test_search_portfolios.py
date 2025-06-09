import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the project root directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from server.server import resolve_search_portfolios

class TestSearchPortfolios(unittest.TestCase):
    @patch('server.server.client')
    def test_search_by_query(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "portfolio-1",
                        "_source": {
                            "name": "Test Portfolio",
                            "currency": "USD",
                            "owner_id": "partner-1",
                            "created_at": "2023-01-01T00:00:00Z",
                            "positions": []
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response

        # Call the resolver
        result = resolve_search_portfolios(None, None, query="Test Portfolio")

        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="portfolios", 
            body={
                "query": {
                    "multi_match": {
                        "query": "Test Portfolio", 
                        "fields": ["name", "currency", "owner_id"]
                    }
                }
            }
        )

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "portfolio-1")
        self.assertEqual(result[0]["name"], "Test Portfolio")
        self.assertEqual(result[0]["currency"], "USD")
        self.assertEqual(result[0]["owner_id"], "partner-1")
        self.assertEqual(result[0]["created_at"], "2023-01-01T00:00:00Z")
        self.assertEqual(result[0]["positions"], [])

    @patch('server.server.client')
    def test_search_by_id(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "portfolio-2",
                        "_source": {
                            "name": "Another Portfolio",
                            "currency": "EUR",
                            "owner_id": "partner-2",
                            "created_at": "2023-02-01T00:00:00Z",
                            "positions": [
                                {
                                    "instrument_id": "inst-1",
                                    "quantity": 100.0,
                                    "market_value": 10000.0,
                                    "currency": "EUR"
                                }
                            ]
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response

        # Call the resolver
        result = resolve_search_portfolios(None, None, id="portfolio-2")

        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="portfolios", 
            body={
                "query": {
                    "term": {
                        "id": "portfolio-2"
                    }
                }
            }
        )

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "portfolio-2")
        self.assertEqual(result[0]["name"], "Another Portfolio")
        self.assertEqual(result[0]["currency"], "EUR")
        self.assertEqual(result[0]["owner_id"], "partner-2")
        self.assertEqual(result[0]["created_at"], "2023-02-01T00:00:00Z")
        self.assertEqual(len(result[0]["positions"]), 1)
        self.assertEqual(result[0]["positions"][0]["instrument_id"], "inst-1")
        self.assertEqual(result[0]["positions"][0]["quantity"], 100.0)
        self.assertEqual(result[0]["positions"][0]["market_value"], 10000.0)
        self.assertEqual(result[0]["positions"][0]["currency"], "EUR")

    def test_missing_parameters(self):
        # Test that an error is raised when both query and id are None
        with self.assertRaises(ValueError):
            resolve_search_portfolios(None, None)

if __name__ == '__main__':
    unittest.main()
