import unittest
import os
import sys

# Add the parent directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import all test modules
from graphql_tests.test_search_partners import TestSearchPartners
from graphql_tests.test_search_portfolios import TestSearchPortfolios
from graphql_tests.test_search_financial_instruments import TestSearchFinancialInstruments
from graphql_tests.test_autocomplete_partner_name import TestAutocompletePartnerName
from graphql_tests.test_autocomplete_instrument_name import TestAutocompleteInstrumentName
from graphql_tests.test_get_portfolios_by_instrument import TestGetPortfoliosByInstrument

# Import OpenSearch test modules
from opensearch.test_partners_index import TestPartnersIndex
from opensearch.test_portfolios_index import TestPortfoliosIndex
from opensearch.test_financial_instruments_index import TestFinancialInstrumentsIndex

def run_tests():
    # Create a test suite
    test_suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    # Add GraphQL test cases to the suite
    test_suite.addTest(loader.loadTestsFromTestCase(TestSearchPartners))
    test_suite.addTest(loader.loadTestsFromTestCase(TestSearchPortfolios))
    test_suite.addTest(loader.loadTestsFromTestCase(TestSearchFinancialInstruments))
    test_suite.addTest(loader.loadTestsFromTestCase(TestAutocompletePartnerName))
    test_suite.addTest(loader.loadTestsFromTestCase(TestAutocompleteInstrumentName))
    test_suite.addTest(loader.loadTestsFromTestCase(TestGetPortfoliosByInstrument))

    # Add OpenSearch test cases to the suite
    test_suite.addTest(loader.loadTestsFromTestCase(TestPartnersIndex))
    test_suite.addTest(loader.loadTestsFromTestCase(TestPortfoliosIndex))
    test_suite.addTest(loader.loadTestsFromTestCase(TestFinancialInstrumentsIndex))

    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)

    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
