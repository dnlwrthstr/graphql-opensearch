# GraphQL OpenSearch Tests

This directory contains tests for the GraphQL OpenSearch API endpoints.

## Test Structure

The tests are organized by endpoint:

- `test_search_partners.py`: Tests for the `searchPartners` endpoint
- `test_search_portfolios.py`: Tests for the `searchPortfolios` endpoint
- `test_search_financial_instruments.py`: Tests for the `searchFinancialInstruments` endpoint
- `test_autocomplete_partner_name.py`: Tests for the `autocompletePartnerName` endpoint
- `test_autocomplete_instrument_name.py`: Tests for the `autocompleteInstrumentName` endpoint
- `test_get_portfolios_by_instrument.py`: Tests for the `getPortfoliosByInstrument` endpoint

## Running Tests

You can run all tests using the provided runner script:

```bash
python -m test.run_tests
```

Or run individual test files:

```bash
python -m unittest test.test_search_partners
```

## Test Coverage

The tests cover the following scenarios for each endpoint:

### Search Endpoints
- Search by query string
- Search by ID
- Error handling for missing parameters

### Autocomplete Endpoints
- Successful autocomplete with results
- Autocomplete with no results
- Error handling

### getPortfoliosByInstrument Endpoint
- Search by instrument ID
- Search by ISIN
- Search by instrument name
- Search with no results

## Mocking

The tests use `unittest.mock` to mock the OpenSearch client and file operations, allowing the tests to run without requiring a connection to OpenSearch or access to the actual data files.