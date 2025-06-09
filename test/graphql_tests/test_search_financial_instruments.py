import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the project root directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from server.server import resolve_search_financial_instruments, process_clause

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

    @patch('server.server.client')
    def test_advanced_search_with_and(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-3",
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

        # Call the resolver with an advanced search query
        result = resolve_search_financial_instruments(None, None, query="type:bond AND currency:USD AND rating:AAA")

        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once()
        call_args = mock_client.search.call_args[1]
        self.assertEqual(call_args["index"], "financial_instruments")

        # Check that the query is a bool query with must clauses
        query = call_args["body"]["query"]
        self.assertIn("bool", query)
        self.assertIn("must", query["bool"])

        # Check that there are 3 must clauses (one for each field)
        must_clauses = query["bool"]["must"]
        self.assertEqual(len(must_clauses), 3)

        # Check that the clauses are for the correct fields
        field_queries = {
            "type": {"match": {"type": "bond"}},
            "currency": {"match": {"currency": "USD"}},
            "rating": {"match": {"rating": "AAA"}}
        }

        for clause in must_clauses:
            field = list(clause["match"].keys())[0]
            self.assertIn(field, field_queries)
            self.assertEqual(clause, field_queries[field])

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-3")
        self.assertEqual(result[0]["type"], "bond")
        self.assertEqual(result[0]["currency"], "USD")
        self.assertEqual(result[0]["rating"], "AAA")

    @patch('server.server.client')
    def test_advanced_search_with_wildcards(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-4",
                        "_source": {
                            "isin": "US0378331005",
                            "name": "Goldman Sachs Group Inc.",
                            "issuer": "Goldman Sachs",
                            "currency": "USD",
                            "country": "US",
                            "type": "share"
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response

        # Call the resolver with a wildcard search query
        result = resolve_search_financial_instruments(None, None, query="name:* AND issuer:Goldman*")

        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once()
        call_args = mock_client.search.call_args[1]
        self.assertEqual(call_args["index"], "financial_instruments")

        # Check that the query is a bool query with must clauses
        query = call_args["body"]["query"]
        self.assertIn("bool", query)
        self.assertIn("must", query["bool"])

        # Check that there are 2 must clauses (one for each field)
        must_clauses = query["bool"]["must"]
        self.assertEqual(len(must_clauses), 2)

        # Check that the clauses are for the correct fields and use wildcard for issuer
        name_clause = next((c for c in must_clauses if "wildcard" in c and "name" in c["wildcard"]), None)
        issuer_clause = next((c for c in must_clauses if "wildcard" in c and "issuer" in c["wildcard"]), None)

        self.assertIsNotNone(name_clause)
        self.assertIsNotNone(issuer_clause)
        self.assertEqual(name_clause["wildcard"]["name"], "*")
        self.assertEqual(issuer_clause["wildcard"]["issuer"], "Goldman*")

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-4")
        self.assertEqual(result[0]["name"], "Goldman Sachs Group Inc.")
        self.assertEqual(result[0]["issuer"], "Goldman Sachs")

    @patch('server.server.client')
    def test_advanced_search_with_numeric_and_boolean_fields(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-5",
                        "_source": {
                            "isin": "CH0012255151",
                            "name": "Structured Note XYZ",
                            "issuer": "Credit Suisse",
                            "currency": "CHF",
                            "country": "CH",
                            "type": "structured_product",
                            "barrier_level": 70.0,
                            "capital_protection": False,
                            "underlyings": ["AAPL", "MSFT", "GOOGL"]
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response

        # Call the resolver with numeric and boolean fields
        result = resolve_search_financial_instruments(None, None, query="type:structured_product AND barrier_level:70.0 AND capital_protection:false")

        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once()
        call_args = mock_client.search.call_args[1]
        self.assertEqual(call_args["index"], "financial_instruments")

        # Check that the query is a bool query with must clauses
        query = call_args["body"]["query"]
        self.assertIn("bool", query)
        self.assertIn("must", query["bool"])

        # Check that there are 3 must clauses (one for each field)
        must_clauses = query["bool"]["must"]
        self.assertEqual(len(must_clauses), 3)

        # Check that the clauses are for the correct fields with correct types
        type_clause = next((c for c in must_clauses if "match" in c and "type" in c["match"]), None)
        barrier_clause = next((c for c in must_clauses if "term" in c and "barrier_level" in c["term"]), None)
        protection_clause = next((c for c in must_clauses if "term" in c and "capital_protection" in c["term"]), None)

        self.assertIsNotNone(type_clause)
        self.assertIsNotNone(barrier_clause)
        self.assertIsNotNone(protection_clause)
        self.assertEqual(type_clause["match"]["type"], "structured_product")
        self.assertEqual(barrier_clause["term"]["barrier_level"], 70.0)
        self.assertEqual(protection_clause["term"]["capital_protection"], False)

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-5")
        self.assertEqual(result[0]["type"], "structured_product")
        self.assertEqual(result[0]["barrier_level"], 70.0)
        self.assertEqual(result[0]["capital_protection"], False)

    def test_process_clause_function(self):
        # Test the process_clause function with different types of clauses

        # Test with a wildcard clause
        bool_query = {"bool": {"must": [], "should": [], "must_not": []}}
        process_clause(["name:Test*"], "AND", bool_query)
        self.assertEqual(len(bool_query["bool"]["must"]), 1)
        self.assertIn("wildcard", bool_query["bool"]["must"][0])
        self.assertEqual(bool_query["bool"]["must"][0]["wildcard"]["name"], "Test*")

        # Test with a numeric clause
        bool_query = {"bool": {"must": [], "should": [], "must_not": []}}
        process_clause(["coupon:3.5"], "AND", bool_query)
        self.assertEqual(len(bool_query["bool"]["must"]), 1)
        self.assertIn("term", bool_query["bool"]["must"][0])
        self.assertEqual(bool_query["bool"]["must"][0]["term"]["coupon"], 3.5)

        # Test with a boolean clause
        bool_query = {"bool": {"must": [], "should": [], "must_not": []}}
        process_clause(["capital_protection:true"], "AND", bool_query)
        self.assertEqual(len(bool_query["bool"]["must"]), 1)
        self.assertIn("term", bool_query["bool"]["must"][0])
        self.assertEqual(bool_query["bool"]["must"][0]["term"]["capital_protection"], True)

        # Test with a regular text clause
        bool_query = {"bool": {"must": [], "should": [], "must_not": []}}
        process_clause(["issuer:BlackRock"], "AND", bool_query)
        self.assertEqual(len(bool_query["bool"]["must"]), 1)
        self.assertIn("match", bool_query["bool"]["must"][0])
        self.assertEqual(bool_query["bool"]["must"][0]["match"]["issuer"], "BlackRock")

        # Test with OR operator
        bool_query = {"bool": {"must": [], "should": [], "must_not": []}}
        process_clause(["type:bond"], "OR", bool_query)
        self.assertEqual(len(bool_query["bool"]["should"]), 1)
        self.assertIn("match", bool_query["bool"]["should"][0])
        self.assertEqual(bool_query["bool"]["should"][0]["match"]["type"], "bond")

        # Test with NOT operator
        bool_query = {"bool": {"must": [], "should": [], "must_not": []}}
        process_clause(["currency:JPY"], "NOT", bool_query)
        self.assertEqual(len(bool_query["bool"]["must_not"]), 1)
        self.assertIn("match", bool_query["bool"]["must_not"][0])
        self.assertEqual(bool_query["bool"]["must_not"][0]["match"]["currency"], "JPY")

    @patch('server.server.client')
    def test_advanced_search_with_spaces_in_values(self, mock_client):
        # Setup mock response
        mock_response = {
            "hits": {
                "hits": [
                    {
                        "_id": "inst-6",
                        "_source": {
                            "isin": "US78462F1030",
                            "name": "SPDR S&P 500 ETF Trust",
                            "issuer": "State Street Global Advisors",
                            "currency": "USD",
                            "country": "US",
                            "type": "etf",
                            "index_tracked": "S&P 500",
                            "total_expense_ratio": 0.09
                        }
                    }
                ]
            }
        }
        mock_client.search.return_value = mock_response

        # Call the resolver with a query containing spaces in values
        result = resolve_search_financial_instruments(None, None, query="type:etf AND index_tracked:S&P 500")

        # Assert the client was called with the correct parameters
        mock_client.search.assert_called_once()
        call_args = mock_client.search.call_args[1]
        self.assertEqual(call_args["index"], "financial_instruments")

        # Check that the query is a bool query with must clauses
        query = call_args["body"]["query"]
        self.assertIn("bool", query)
        self.assertIn("must", query["bool"])

        # Check that there are 2 must clauses (one for each field)
        must_clauses = query["bool"]["must"]
        self.assertEqual(len(must_clauses), 2)

        # Check that the clauses are for the correct fields
        type_clause = next((c for c in must_clauses if "match" in c and "type" in c["match"]), None)
        index_clause = next((c for c in must_clauses if "match" in c and "index_tracked" in c["match"]), None)

        self.assertIsNotNone(type_clause)
        self.assertIsNotNone(index_clause)
        self.assertEqual(type_clause["match"]["type"], "etf")
        self.assertEqual(index_clause["match"]["index_tracked"], "S&P 500")

        # Assert the result is as expected
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "inst-6")
        self.assertEqual(result[0]["type"], "etf")
        self.assertEqual(result[0]["index_tracked"], "S&P 500")
        self.assertEqual(result[0]["total_expense_ratio"], 0.09)

if __name__ == '__main__':
    unittest.main()
