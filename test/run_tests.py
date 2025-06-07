import unittest
import os
import sys

# Add the parent directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import all test modules
from test.test_search_partners import TestSearchPartners
from test.test_search_portfolios import TestSearchPortfolios
from test.test_search_financial_instruments import TestSearchFinancialInstruments
from test.test_autocomplete_partner_name import TestAutocompletePartnerName
from test.test_autocomplete_instrument_name import TestAutocompleteInstrumentName
from test.test_get_portfolios_by_instrument import TestGetPortfoliosByInstrument

def run_tests():
    # Create a test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases to the suite
    test_suite.addTest(unittest.makeSuite(TestSearchPartners))
    test_suite.addTest(unittest.makeSuite(TestSearchPortfolios))
    test_suite.addTest(unittest.makeSuite(TestSearchFinancialInstruments))
    test_suite.addTest(unittest.makeSuite(TestAutocompletePartnerName))
    test_suite.addTest(unittest.makeSuite(TestAutocompleteInstrumentName))
    test_suite.addTest(unittest.makeSuite(TestGetPortfoliosByInstrument))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)