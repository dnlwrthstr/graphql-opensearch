import unittest
from unittest.mock import patch, mock_open, MagicMock
import sys
import os
import json

# Add the project root directory to the path so we can import the server module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from server.server import resolve_portfolios_by_instrument

class TestGetPortfoliosByInstrument(unittest.TestCase):
    @patch('builtins.open', new_callable=mock_open)
    @patch('os.path.exists')
    @patch('os.path.dirname')
    @patch('os.path.join')
    def test_get_portfolios_by_instrument_id(self, mock_join, mock_dirname, mock_exists, mock_file):
        # Setup mock for os.path.exists to return True
        mock_exists.return_value = True

        # Setup mock for os.path.dirname to return a fixed path
        mock_dirname.return_value = "/mock/path"

        # Setup mock for os.path.join to return fixed paths for each file
        mock_join.side_effect = [
            "/mock/path/data/financial_instruments.ndjson",
            "/mock/path/data/portfolios.ndjson",
            "/mock/path/data/partners.ndjson"
        ]

        # Setup mock file data
        instruments_data = '{"id": "inst-1", "isin": "US0378331005", "name": "Apple Inc."}\n'
        portfolios_data = (
            '{"id": "portfolio-1", "owner_id": "partner-1", "name": "Portfolio 1", "positions": [{"instrument_id": "inst-1", "quantity": 100, "market_value": 15000, "currency": "USD"}]}\n'
            '{"id": "portfolio-2", "owner_id": "partner-2", "name": "Portfolio 2", "positions": [{"instrument_id": "inst-2", "quantity": 200, "market_value": 20000, "currency": "EUR"}]}\n'
            '{"id": "portfolio-3", "owner_id": "partner-1", "name": "Portfolio 3", "positions": [{"instrument_id": "inst-1", "quantity": 50, "market_value": 7500, "currency": "USD"}]}\n'
        )
        partners_data = (
            '{"id": "partner-1", "name": "Partner 1", "residency_country": "US"}\n'
            '{"id": "partner-2", "name": "Partner 2", "residency_country": "UK"}\n'
        )

        # Configure the mock_file to return different data for different files
        mock_file.side_effect = [
            mock_open(read_data=instruments_data).return_value,
            mock_open(read_data=portfolios_data).return_value,
            mock_open(read_data=partners_data).return_value
        ]

        # Call the resolver with an instrument ID
        result = resolve_portfolios_by_instrument(None, None, instrument_id="inst-1")

        # Assert the result contains the expected portfolios
        self.assertEqual(len(result), 2)

        # Check first portfolio
        self.assertEqual(result[0]["id"], "portfolio-1")
        self.assertEqual(result[0]["owner_id"], "partner-1")
        self.assertEqual(result[0]["name"], "Portfolio 1")
        self.assertEqual(len(result[0]["positions"]), 1)
        self.assertEqual(result[0]["positions"][0]["instrument_id"], "inst-1")
        self.assertEqual(result[0]["positions"][0]["quantity"], 100)
        self.assertEqual(result[0]["positions"][0]["market_value"], 15000)
        self.assertEqual(result[0]["positions"][0]["currency"], "USD")
        self.assertEqual(result[0]["partner"]["id"], "partner-1")
        self.assertEqual(result[0]["partner"]["name"], "Partner 1")
        self.assertEqual(result[0]["partner"]["residency_country"], "US")

        # Check second portfolio
        self.assertEqual(result[1]["id"], "portfolio-3")
        self.assertEqual(result[1]["owner_id"], "partner-1")
        self.assertEqual(result[1]["name"], "Portfolio 3")
        self.assertEqual(len(result[1]["positions"]), 1)
        self.assertEqual(result[1]["positions"][0]["instrument_id"], "inst-1")
        self.assertEqual(result[1]["positions"][0]["quantity"], 50)
        self.assertEqual(result[1]["positions"][0]["market_value"], 7500)
        self.assertEqual(result[1]["positions"][0]["currency"], "USD")
        self.assertEqual(result[1]["partner"]["id"], "partner-1")
        self.assertEqual(result[1]["partner"]["name"], "Partner 1")
        self.assertEqual(result[1]["partner"]["residency_country"], "US")

    @patch('builtins.open', new_callable=mock_open)
    @patch('os.path.exists')
    @patch('os.path.dirname')
    @patch('os.path.join')
    def test_get_portfolios_by_isin(self, mock_join, mock_dirname, mock_exists, mock_file):
        # Setup mock for os.path.exists to return True
        mock_exists.return_value = True

        # Setup mock for os.path.dirname to return a fixed path
        mock_dirname.return_value = "/mock/path"

        # Setup mock for os.path.join to return fixed paths for each file
        mock_join.side_effect = [
            "/mock/path/data/financial_instruments.ndjson",
            "/mock/path/data/portfolios.ndjson",
            "/mock/path/data/partners.ndjson"
        ]

        # Setup mock file data
        instruments_data = '{"id": "inst-1", "isin": "US0378331005", "name": "Apple Inc."}\n'
        portfolios_data = (
            '{"id": "portfolio-1", "owner_id": "partner-1", "name": "Portfolio 1", "positions": [{"instrument_id": "inst-1", "quantity": 100, "market_value": 15000, "currency": "USD"}]}\n'
            '{"id": "portfolio-2", "owner_id": "partner-2", "name": "Portfolio 2", "positions": [{"instrument_id": "inst-2", "quantity": 200, "market_value": 20000, "currency": "EUR"}]}\n'
        )
        partners_data = (
            '{"id": "partner-1", "name": "Partner 1", "residency_country": "US"}\n'
            '{"id": "partner-2", "name": "Partner 2", "residency_country": "UK"}\n'
        )

        # Configure the mock_file to return different data for different files
        mock_file.side_effect = [
            mock_open(read_data=instruments_data).return_value,
            mock_open(read_data=portfolios_data).return_value,
            mock_open(read_data=partners_data).return_value
        ]

        # Call the resolver with an ISIN
        result = resolve_portfolios_by_instrument(None, None, instrument_id="US0378331005")

        # Assert the result contains the expected portfolio
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "portfolio-1")
        self.assertEqual(result[0]["owner_id"], "partner-1")
        self.assertEqual(result[0]["name"], "Portfolio 1")
        self.assertEqual(result[0]["partner"]["id"], "partner-1")
        self.assertEqual(result[0]["partner"]["name"], "Partner 1")

    @patch('builtins.open', new_callable=mock_open)
    @patch('os.path.exists')
    @patch('os.path.dirname')
    @patch('os.path.join')
    def test_get_portfolios_by_instrument_name(self, mock_join, mock_dirname, mock_exists, mock_file):
        # Setup mock for os.path.exists to return True
        mock_exists.return_value = True

        # Setup mock for os.path.dirname to return a fixed path
        mock_dirname.return_value = "/mock/path"

        # Setup mock for os.path.join to return fixed paths for each file
        mock_join.side_effect = [
            "/mock/path/data/financial_instruments.ndjson",
            "/mock/path/data/portfolios.ndjson",
            "/mock/path/data/partners.ndjson"
        ]

        # Setup mock file data
        instruments_data = '{"id": "inst-1", "isin": "US0378331005", "name": "Apple Inc."}\n'
        portfolios_data = (
            '{"id": "portfolio-1", "owner_id": "partner-1", "name": "Portfolio 1", "positions": [{"instrument_id": "inst-1", "quantity": 100, "market_value": 15000, "currency": "USD"}]}\n'
            '{"id": "portfolio-2", "owner_id": "partner-2", "name": "Portfolio 2", "positions": [{"instrument_id": "inst-2", "quantity": 200, "market_value": 20000, "currency": "EUR"}]}\n'
        )
        partners_data = (
            '{"id": "partner-1", "name": "Partner 1", "residency_country": "US"}\n'
            '{"id": "partner-2", "name": "Partner 2", "residency_country": "UK"}\n'
        )

        # Configure the mock_file to return different data for different files
        mock_file.side_effect = [
            mock_open(read_data=instruments_data).return_value,
            mock_open(read_data=portfolios_data).return_value,
            mock_open(read_data=partners_data).return_value
        ]

        # Call the resolver with a partial instrument name
        result = resolve_portfolios_by_instrument(None, None, instrument_id="Apple")

        # Assert the result contains the expected portfolio
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "portfolio-1")

    @patch('builtins.open', new_callable=mock_open)
    @patch('os.path.exists')
    @patch('os.path.dirname')
    @patch('os.path.join')
    def test_get_portfolios_by_instrument_no_results(self, mock_join, mock_dirname, mock_exists, mock_file):
        # Setup mock for os.path.exists to return True
        mock_exists.return_value = True

        # Setup mock for os.path.dirname to return a fixed path
        mock_dirname.return_value = "/mock/path"

        # Setup mock for os.path.join to return fixed paths for each file
        mock_join.side_effect = [
            "/mock/path/data/financial_instruments.ndjson",
            "/mock/path/data/portfolios.ndjson",
            "/mock/path/data/partners.ndjson"
        ]

        # Setup mock file data
        instruments_data = '{"id": "inst-1", "isin": "US0378331005", "name": "Apple Inc."}\n'
        portfolios_data = (
            '{"id": "portfolio-1", "owner_id": "partner-1", "name": "Portfolio 1", "positions": [{"instrument_id": "inst-1", "quantity": 100, "market_value": 15000, "currency": "USD"}]}\n'
            '{"id": "portfolio-2", "owner_id": "partner-2", "name": "Portfolio 2", "positions": [{"instrument_id": "inst-2", "quantity": 200, "market_value": 20000, "currency": "EUR"}]}\n'
        )
        partners_data = (
            '{"id": "partner-1", "name": "Partner 1", "residency_country": "US"}\n'
            '{"id": "partner-2", "name": "Partner 2", "residency_country": "UK"}\n'
        )

        # Configure the mock_file to return different data for different files
        mock_file.side_effect = [
            mock_open(read_data=instruments_data).return_value,
            mock_open(read_data=portfolios_data).return_value,
            mock_open(read_data=partners_data).return_value
        ]

        # Call the resolver with a non-existent instrument ID
        result = resolve_portfolios_by_instrument(None, None, instrument_id="non-existent")

        # Assert the result is an empty list
        self.assertEqual(result, [])

if __name__ == '__main__':
    unittest.main()
