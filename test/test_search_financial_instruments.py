import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the server directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from server.server import resolve_search_financial_instruments

class TestSearchFinancialInstruments(unittest.TestCase):
    @patch('server.server.client')
    def test_search_by_query(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-1",
                        "_source": {
                            "isin": "US0378331005",
                            "name": "Apple Inc.",
                            "issuer": "Apple",
                            "currency": "USD",
                            "country": "US",
                            "issue_date": "2022-01-01",
                            "maturity_date": None,
                            "rating": "AAA",
                            "type": "equity",
                            "exchange": "NASDAQ",
                            "sector": "Technology"
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response
        
        # Call the resolver
        result = resolve_search_financial_instruments(None, None, query="Apple")
        
        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="financial_instruments", 
            body={
                "query": {
                    "multi_match": {
                        "query": "Apple", 
                        "fields": ["name", "issuer", "type", "isin", "currency", "country"]
                    }
                }
            }
        )
        
        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-1")
        self.assertEqual(result[0]["isin"], "US0378331005")
        self.assertEqual(result[0]["name"], "Apple Inc.")
        self.assertEqual(result[0]["issuer"], "Apple")
        self.assertEqual(result[0]["currency"], "USD")
        self.assertEqual(result[0]["country"], "US")
        self.assertEqual(result[0]["issue_date"], "2022-01-01")
        self.assertEqual(result[0]["maturity_date"], None)
        self.assertEqual(result[0]["rating"], "AAA")
        self.assertEqual(result[0]["type"], "equity")
        self.assertEqual(result[0]["exchange"], "NASDAQ")
        self.assertEqual(result[0]["sector"], "Technology")
    
    @patch('server.server.client')
    def test_search_by_id(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-2",
                        "_source": {
                            "isin": "US912810TW33",
                            "name": "US Treasury Bond",
                            "issuer": "US Treasury",
                            "currency": "USD",
                            "country": "US",
                            "issue_date": "2022-02-01",
                            "maturity_date": "2052-02-01",
                            "rating": "AAA",
                            "type": "bond",
                            "coupon": 2.25,
                            "face_value": 1000
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response
        
        # Call the resolver
        result = resolve_search_financial_instruments(None, None, id="inst-2")
        
        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="financial_instruments", 
            body={
                "query": {
                    "term": {
                        "id": "inst-2"
                    }
                }
            }
        )
        
        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-2")
        self.assertEqual(result[0]["isin"], "US912810TW33")
        self.assertEqual(result[0]["name"], "US Treasury Bond")
        self.assertEqual(result[0]["issuer"], "US Treasury")
        self.assertEqual(result[0]["currency"], "USD")
        self.assertEqual(result[0]["country"], "US")
        self.assertEqual(result[0]["issue_date"], "2022-02-01")
        self.assertEqual(result[0]["maturity_date"], "2052-02-01")
        self.assertEqual(result[0]["rating"], "AAA")
        self.assertEqual(result[0]["type"], "bond")
        self.assertEqual(result[0]["coupon"], 2.25)
        self.assertEqual(result[0]["face_value"], 1000)
    
    def test_missing_parameters(self):
        # Test that an error is raised when both query and id are None
        with self.assertRaises(ValueError):
            resolve_search_financial_instruments(None, None)

if __name__ == '__main__':
    unittest.main()