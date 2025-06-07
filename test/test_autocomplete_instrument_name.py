import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the server directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from server.server import resolve_autocomplete_instrument_name

class TestAutocompleteInstrumentName(unittest.TestCase):
    @patch('server.server.client')
    def test_autocomplete_instrument_name(self, mock_client):
        # Setup mock response for the search query
        mock_search_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-1",
                        "_source": {
                            "name": "Apple Inc.",
                            "isin": "US0378331005",
                            "type": "equity",
                            "currency": "USD"
                        }
                    }
                ]
            }
        }
        
        # Configure the mock client to return the appropriate response
        mock_client.search.return_value = mock_search_response
        
        # Call the resolver
        result = resolve_autocomplete_instrument_name(None, None, query="Apple")
        
        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="financial_instruments", 
            body={
                "query": {
                    "multi_match": {
                        "query": "Apple",
                        "fields": ["name", "isin"],
                        "type": "phrase_prefix"
                    }
                },
                "size": 10
            }
        )
        
        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-1")
        self.assertEqual(result[0]["name"], "Apple Inc.")
        self.assertEqual(result[0]["isin"], "US0378331005")
        self.assertEqual(result[0]["type"], "equity")
        self.assertEqual(result[0]["currency"], "USD")
    
    @patch('server.server.client')
    def test_autocomplete_instrument_name_multiple_results(self, mock_client):
        # Setup mock response with multiple suggestions
        mock_search_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-1",
                        "_source": {
                            "name": "Apple Inc.",
                            "isin": "US0378331005",
                            "type": "equity",
                            "currency": "USD"
                        }
                    },
                    {
                        "_id": "inst-2",
                        "_source": {
                            "name": "Apple Bond 2025",
                            "isin": "US0378331099",
                            "type": "bond",
                            "currency": "USD"
                        }
                    }
                ]
            }
        }
        
        mock_client.search.return_value = mock_search_response
        
        # Call the resolver
        result = resolve_autocomplete_instrument_name(None, None, query="Apple")
        
        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="financial_instruments", 
            body={
                "query": {
                    "multi_match": {
                        "query": "Apple",
                        "fields": ["name", "isin"],
                        "type": "phrase_prefix"
                    }
                },
                "size": 10
            }
        )
        
        # Assert the result is as expected
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["id"], "inst-1")
        self.assertEqual(result[0]["name"], "Apple Inc.")
        self.assertEqual(result[0]["isin"], "US0378331005")
        self.assertEqual(result[0]["type"], "equity")
        self.assertEqual(result[0]["currency"], "USD")
        
        self.assertEqual(result[1]["id"], "inst-2")
        self.assertEqual(result[1]["name"], "Apple Bond 2025")
        self.assertEqual(result[1]["isin"], "US0378331099")
        self.assertEqual(result[1]["type"], "bond")
        self.assertEqual(result[1]["currency"], "USD")
    
    @patch('server.server.client')
    def test_autocomplete_instrument_name_no_results(self, mock_client):
        # Setup mock response with no hits
        mock_search_response = {
            "hits": {
                "hits": []
            }
        }
        
        mock_client.search.return_value = mock_search_response
        
        # Call the resolver
        result = resolve_autocomplete_instrument_name(None, None, query="NonExistentInstrument")
        
        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="financial_instruments", 
            body={
                "query": {
                    "multi_match": {
                        "query": "NonExistentInstrument",
                        "fields": ["name", "isin"],
                        "type": "phrase_prefix"
                    }
                },
                "size": 10
            }
        )
        
        # Assert the result is an empty list
        self.assertEqual(result, [])
    
    @patch('server.server.client')
    def test_autocomplete_instrument_name_error_handling(self, mock_client):
        # Setup mock client to raise an exception
        mock_client.search.side_effect = Exception("Test exception")
        
        # Call the resolver
        result = resolve_autocomplete_instrument_name(None, None, query="Apple")
        
        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="financial_instruments", 
            body={
                "query": {
                    "multi_match": {
                        "query": "Apple",
                        "fields": ["name", "isin"],
                        "type": "phrase_prefix"
                    }
                },
                "size": 10
            }
        )
        
        # Assert the result is an empty list (error handling)
        self.assertEqual(result, [])

if __name__ == '__main__':
    unittest.main()