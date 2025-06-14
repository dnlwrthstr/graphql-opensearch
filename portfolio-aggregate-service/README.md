# Portfolio Aggregate Service

## Overview

The Portfolio Aggregate Service is a FastAPI microservice that provides portfolio aggregations and calculations for financial data. It retrieves portfolio data from OpenSearch, performs currency conversions, groups financial positions by instrument type, and calculates currency and instrument type exposures.

## Features

- Retrieves portfolio data from OpenSearch
- Converts currency values using exchange rates stored in OpenSearch
- Groups positions by instrument type
- Calculates total portfolio value in a reference currency
- Provides detailed information about each position in the portfolio
- Calculates currency exposure (sum of position values per currency)
- Calculates instrument type exposure (sum of position values per instrument type)

## Installation

### Prerequisites

- Python 3.11 or higher
- OpenSearch instance
- Docker (optional, for containerized deployment)

### Local Setup

1. Clone the repository
2. Navigate to the portfolio-aggregate-service directory
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the service:
   ```
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

### Docker Setup

The service can be run as a Docker container:

```bash
# Build the Docker image
docker build -t portfolio-aggregate-service .

# Run the container
docker run -p 8000:8000 -e OPENSEARCH_HOST=<opensearch_host> -e OPENSEARCH_PORT=<opensearch_port> portfolio-aggregate-service
```

## API Endpoints

### GET /portfolio/{portfolio_id}

Retrieves a portfolio with the specified ID and calculates values in the specified reference currency.

**Parameters:**
- `portfolio_id` (path parameter): The ID of the portfolio to retrieve
- `reference_currency` (query parameter): The currency to convert all position values to

**Response:**
```json
{
  "portfolio_id": "string",
  "reference_currency": "string",
  "total_portfolio_value": 0.0,
  "portfolio_data": {
    "id": "string",
    "owner_id": "string",
    "name": "string",
    "currency": "string",
    "created_at": "string",
    "positions": []
  },
  "instrument_groups": [
    {
      "instrument_type": "string",
      "total_value": 0.0,
      "positions": [
        {
          "instrument_id": "string",
          "quantity": 0.0,
          "market_value": 0.0,
          "currency": "string",
          "instrument_type": "string",
          "ref_currency": "string",
          "value_in_ref_currency": 0.0,
          "instrument": {}
        }
      ]
    }
  ]
}
```

### GET /portfolio-aggregates/{portfolio_id}

Retrieves aggregated data for a portfolio, including currency exposure and instrument type exposure.

**Parameters:**
- `portfolio_id` (path parameter): The ID of the portfolio to retrieve
- `reference_currency` (query parameter): The currency to convert all position values to

**Response:**
```json
{
  "portfolio_id": "string",
  "valuation_currency": "string",
  "value_in_valuation_currency": 0.0,
  "currency_exposure": [
    {
      "currency": "string",
      "value": 0.0
    }
  ],
  "instrument_type_exposure": [
    {
      "instrument_type": "string",
      "value": 0.0
    }
  ]
}
```

## Usage Examples

### Using the Test Client

The service includes a test client that can be used to test the API:

```bash
python test_client.py <portfolio_id> <reference_currency> [<port>] [--aggregates]
```

Examples:
```bash
# Test the portfolio endpoint
python test_client.py portfolio_1 USD

# Test with custom port
python test_client.py portfolio_1 USD 8001

# Test the aggregates endpoint
python test_client.py portfolio_1 USD --aggregates

# Test the aggregates endpoint with custom port
python test_client.py portfolio_1 USD 8001 --aggregates
```

### Using cURL

```bash
# Get full portfolio data
curl "http://localhost:8000/portfolio/portfolio_1?reference_currency=USD"

# Get portfolio aggregates
curl "http://localhost:8000/portfolio-aggregates/portfolio_1?reference_currency=USD"
```

### Using Python Requests

```python
import requests
import json

# Get full portfolio data
response = requests.get("http://localhost:8000/portfolio/portfolio_1?reference_currency=USD")
data = response.json()
print(json.dumps(data, indent=2))

# Get portfolio aggregates
response = requests.get("http://localhost:8000/portfolio-aggregates/portfolio_1?reference_currency=USD")
data = response.json()
print(json.dumps(data, indent=2))
```

## Configuration

The service can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| OPENSEARCH_HOST | OpenSearch host | localhost |
| OPENSEARCH_PORT | OpenSearch port | 9200 |
| OPENSEARCH_USERNAME | OpenSearch username | admin |
| OPENSEARCH_INITIAL_ADMIN_PASSWORD | OpenSearch password | StrongP@ssw0rd!123 |

## Dependencies

- fastapi==0.110.0: Web framework for building APIs
- pydantic==2.6.1: Data validation and settings management
- uvicorn==0.29.0: ASGI server for running the FastAPI application
- opensearch-py==2.5.0: Python client for OpenSearch
- requests==2.31.0: HTTP library for making requests
- tabulate==0.9.0: Used for formatting tabular data in the test client

## Integration with Other Services

The Portfolio Aggregate Service is designed to work with:

1. OpenSearch: Stores portfolio data, financial instruments, and exchange rates
2. GraphQL API: May call the Portfolio Aggregate Service to include portfolio data in GraphQL responses
3. Frontend: Consumes the Portfolio Aggregate Service API to display portfolio information and aggregates

When deployed with Docker Compose, the service is available at http://localhost:8001.
