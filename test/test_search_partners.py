import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the server directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from server.server import resolve_search_partners

class TestSearchPartners(unittest.TestCase):
    @patch('server.server.client')
    def test_search_by_query(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "partner-1",
                        "_source": {
                            "name": "Test Partner",
                            "partner_type": "individual",
                            "residency_country": "US",
                            "nationality": "US"
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response
        
        # Call the resolver
        result = resolve_search_partners(None, None, query="Test Partner")
        
        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="partners", 
            body={
                "query": {
                    "multi_match": {
                        "query": "Test Partner", 
                        "fields": ["name", "partner_type", "residency_country", "nationality"]
                    }
                }
            }
        )
        
        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "partner-1")
        self.assertEqual(result[0]["name"], "Test Partner")
        self.assertEqual(result[0]["partner_type"], "individual")
        self.assertEqual(result[0]["residency_country"], "US")
        self.assertEqual(result[0]["nationality"], "US")
    
    @patch('server.server.client')
    def test_search_by_id(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "partner-2",
                        "_source": {
                            "name": "Another Partner",
                            "partner_type": "corporate",
                            "residency_country": "UK",
                            "nationality": None
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response
        
        # Call the resolver
        result = resolve_search_partners(None, None, id="partner-2")
        
        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="partners", 
            body={
                "query": {
                    "term": {
                        "id": "partner-2"
                    }
                }
            }
        )
        
        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "partner-2")
        self.assertEqual(result[0]["name"], "Another Partner")
        self.assertEqual(result[0]["partner_type"], "corporate")
        self.assertEqual(result[0]["residency_country"], "UK")
        self.assertEqual(result[0]["nationality"], None)
    
    def test_missing_parameters(self):
        # Test that an error is raised when both query and id are None
        with self.assertRaises(ValueError):
            resolve_search_partners(None, None)

if __name__ == '__main__':
    unittest.main()