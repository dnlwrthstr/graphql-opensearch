import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the project root directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from server.server import resolve_autocomplete_partner_name

class TestAutocompletePartnerName(unittest.TestCase):
    @patch('server.server.client')
    def test_autocomplete_partner_name(self, mock_client):
        # Setup mock response for the suggestion query
        mock_suggest_response = {
            "suggest": {
                "name_completion": [
                    {
                        "options": [
                            {
                                "_id": "partner-1",
                                "text": "Acme Corporation"
                            }
                        ]
                    }
                ]
            }
        }

        # Setup mock response for the get query (to fetch full partner details)
        mock_get_response = {
            "_id": "partner-1",
            "_source": {
                "name": "Acme Corporation",
                "residency_country": "US",
                "nationality": "US",
                "partner_type": "corporate"
            }
        }

        # Configure the mock client to return the appropriate responses
        mock_client.search.return_value = mock_suggest_response
        mock_client.get.return_value = mock_get_response

        # Call the resolver
        result = resolve_autocomplete_partner_name(None, None, query="Acme")

        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="partners", 
            body={
                "suggest": {
                    "name_completion": {
                        "prefix": "Acme",
                        "completion": {
                            "field": "name_suggest",
                            "size": 10
                        }
                    }
                }
            }
        )

        # Assert the get client was called with the correct parameters
        mock_client.get.assert_called_once_with(
            index="partners", 
            id="partner-1"
        )

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "partner-1")
        self.assertEqual(result[0]["name"], "Acme Corporation")
        self.assertEqual(result[0]["residency_country"], "US")
        self.assertEqual(result[0]["nationality"], "US")

    @patch('server.server.client')
    def test_autocomplete_partner_name_no_results(self, mock_client):
        # Setup mock response with no suggestions
        mock_suggest_response = {
            "suggest": {
                "name_completion": [
                    {
                        "options": []
                    }
                ]
            }
        }

        mock_client.search.return_value = mock_suggest_response

        # Call the resolver
        result = resolve_autocomplete_partner_name(None, None, query="NonExistentPartner")

        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="partners", 
            body={
                "suggest": {
                    "name_completion": {
                        "prefix": "NonExistentPartner",
                        "completion": {
                            "field": "name_suggest",
                            "size": 10
                        }
                    }
                }
            }
        )

        # Assert the get client was not called
        mock_client.get.assert_not_called()

        # Assert the result is an empty list
        self.assertEqual(result, [])

    @patch('server.server.client')
    def test_autocomplete_partner_name_error_handling(self, mock_client):
        # Setup mock client to raise an exception
        mock_client.search.side_effect = Exception("Test exception")

        # Call the resolver
        result = resolve_autocomplete_partner_name(None, None, query="Acme")

        # Assert the search client was called with the correct parameters
        mock_client.search.assert_called_once_with(
            index="partners", 
            body={
                "suggest": {
                    "name_completion": {
                        "prefix": "Acme",
                        "completion": {
                            "field": "name_suggest",
                            "size": 10
                        }
                    }
                }
            }
        )

        # Assert the result is an empty list (error handling)
        self.assertEqual(result, [])

if __name__ == '__main__':
    unittest.main()
