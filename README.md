# GraphQL OpenSearch API

A GraphQL API that provides a search interface for financial data stored in OpenSearch.

## Project Overview

This project demonstrates how to build a GraphQL API that interfaces with OpenSearch to provide search capabilities. It includes:

- A GraphQL API built with Ariadne and Starlette
- A FastAPI microservice for portfolio aggregations
- OpenSearch integration for full-text search
- Docker containerization for easy deployment
- Sample data seeding for demonstration purposes

## Architecture

The project consists of five main services:

1. **OpenSearch**: A search engine that stores and indexes the data
2. **OpenSearch Dashboard**: A web-based UI for interacting with OpenSearch
3. **GraphQL API**: A Python-based API that provides a GraphQL interface to search the data
4. **Portfolio Aggregate Service**: A FastAPI microservice for portfolio aggregations and calculations
5. **React Frontend**: A web application that provides a user-friendly interface for searching financial instruments and partners

## Installation

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd graphql-opensearch
   ```

2. Start the services:
   ```
   docker-compose up -d
   ```

3. The API will be available at http://localhost:8000
4. The OpenSearch Dashboard will be available at http://localhost:5601
5. The frontend will be available at http://localhost:3000

   Note: All services, including the frontend, are now containerized and will start with `docker-compose up -d`. If you prefer to run the frontend locally for development:
   ```
   cd frontend
   npm install
   npm start
   ```

## Usage

### GraphQL API

You can interact with the GraphQL API using any GraphQL client (like GraphiQL, Insomnia, or Postman).

### Portfolio Aggregate Service

The project includes a FastAPI microservice for portfolio aggregations and calculations. This service is independent of the GraphQL server and can be deployed separately.

#### Features
- Convert all positions in a portfolio to a reference currency
- Group positions by instrument type
- Calculate total value for each instrument type group
- Calculate currency exposure (sum of position values per currency)
- Calculate instrument type exposure (sum of position values per instrument type)

#### Running the Service
1. Start the service directly:
   ```
   cd portfolio-aggregate-service
   uvicorn app:app --reload
   ```

2. Or build and run the Docker container:
   ```
   cd portfolio-aggregate-service
   docker build -t portfolio-aggregate-service .
   docker run -p 8000:8000 portfolio-aggregate-service
   ```

3. The service will be available at http://localhost:8000 when running directly, or at http://localhost:8001 when running with Docker Compose

#### API Endpoints

**GET /portfolio/{portfolio_id}**

Retrieves a portfolio with all positions converted to the specified reference currency and grouped by instrument type.

Query Parameters:
- `reference_currency` (required): The currency to convert all position values to (e.g., USD, EUR, CHF)

Example Request:
```
GET http://localhost:8001/portfolio/portfolio_1?reference_currency=USD
```

Note: Use port 8000 if running the service directly, or port 8001 if running with Docker Compose.

Example Response:
```json
{
  "portfolio_id": "portfolio_1",
  "reference_currency": "USD",
  "positions": [
    {
      "instrument_id": "AAPL",
      "quantity": 100,
      "market_value": 15000,
      "currency": "USD",
      "instrument_type": "Share",
      "converted_value": 15000
    },
    {
      "instrument_id": "BOND1",
      "quantity": 10,
      "market_value": 10000,
      "currency": "EUR",
      "instrument_type": "Bond",
      "converted_value": 11200
    }
  ],
  "position_groups": [
    {
      "instrument_type": "Bond",
      "positions": [...],
      "total_value": 11200
    },
    {
      "instrument_type": "Share",
      "positions": [...],
      "total_value": 15000
    }
  ]
}
```

**GET /portfolio-aggregates/{portfolio_id}**

Retrieves aggregated data for a portfolio, including currency exposure and instrument type exposure.

Query Parameters:
- `reference_currency` (required): The currency to convert all position values to (e.g., USD, EUR, CHF)

Example Request:
```
GET http://localhost:8001/portfolio-aggregates/portfolio_1?reference_currency=USD
```

Example Response:
```json
{
  "portfolio_id": "portfolio_1",
  "valuation_currency": "USD",
  "value_in_valuation_currency": 26200,
  "currency_exposure": [
    {
      "currency": "USD",
      "value": 15000
    },
    {
      "currency": "EUR",
      "value": 11200
    }
  ],
  "instrument_type_exposure": [
    {
      "instrument_type": "Share",
      "value": 15000
    },
    {
      "instrument_type": "Bond",
      "value": 11200
    }
  ]
}
```

#### Testing the Service

A test script is provided to demonstrate the portfolio aggregate service:

```
cd portfolio-aggregate-service
python test_client.py <portfolio_id> <reference_currency> [<port>] [--aggregates]
```

Examples:
```
# For direct service (default port 8000)
python test_client.py portfolio_1 USD

# For Docker Compose service (port 8001)
python test_client.py portfolio_1 USD 8001

# Test the aggregates endpoint
python test_client.py portfolio_1 USD --aggregates

# Test the aggregates endpoint with custom port
python test_client.py portfolio_1 USD 8001 --aggregates
```

### Frontend Application

The frontend application provides several features:

#### Portfolio Overview
- Enter a partner ID to view their details and portfolios
- Partner details are displayed on the left
- Portfolios are displayed on the right
- Click on a portfolio to expand and view its positions with instrument data

#### Financial Instruments Search
- Search for financial instruments by term or ID

#### Partners Search
- Search for partners by term or ID

To use the frontend application:

1. Open your browser and navigate to http://localhost:3000
2. Enter a partner ID in the "Portfolio Overview" section to view their details and portfolios
3. Use the search box in the "Search Financial Instruments" section to find financial instruments
4. Use the search box in the "Search Partners" section to find partners
5. View the search results displayed below each search box

### OpenSearch Dashboard

You can use the OpenSearch Dashboard to:
- Explore your data
- Create visualizations
- Monitor your OpenSearch cluster
- Perform direct queries against your indices

### Example Queries


#### Search Partners

```graphql
query {
  searchPartners(query: "corporation") {
    id
    name
    partner_type
    residency_country
    kyc_status
    risk_level
  }
}
```

#### Get Partner by ID

```graphql
query {
  getPartner(id: "partner-0") {
    id
    name
    partner_type
    birth_date
    residency_country
    nationality
    kyc_status
    risk_level
    account_type
    pep_flag
  }
}
```

#### Get Partner with Portfolios and Instruments

```graphql
query {
  getPartner(id: "partner-0") {
    id
    name
    partner_type
    portfolios {
      id
      name
      currency
      created_at
      positions {
        instrument_id
        quantity
        market_value
        currency
        instrument {
          id
          name
          isin
          type
          issuer
          currency
          rating
        }
      }
    }
  }
}
```

#### Search Financial Instruments

##### Basic Search
```graphql
query {
  searchFinancialInstruments(query: "bond") {
    id
    isin
    name
    issuer
    currency
    type
    rating
  }
}
```

##### Advanced Search
The API supports advanced search with field-specific queries and logical operators (AND, OR, NOT).

```graphql
query {
  searchFinancialInstruments(query: "type:bond AND currency:USD AND rating:AAA") {
    id
    isin
    name
    issuer
    currency
    type
    rating
    coupon
    face_value
  }
}
```

You can use wildcards in your search:

```graphql
query {
  searchFinancialInstruments(query: "name:* AND issuer:Goldman*") {
    id
    isin
    name
    issuer
    type
    currency
  }
}
```

Search for ETFs with specific index:

```graphql
query {
  searchFinancialInstruments(query: "type:etf AND index_tracked:S&P 500") {
    id
    name
    isin
    type
    index_tracked
    total_expense_ratio
  }
}
```

Search for structured products with specific characteristics:

```graphql
query {
  searchFinancialInstruments(query: "type:structured_product AND capital_protection:false") {
    id
    name
    type
    barrier_level
    capital_protection
    underlyings
  }
}
```

#### Get Financial Instrument by ID

```graphql
query {
  getFinancialInstrument(id: "inst-1") {
    id
    isin
    name
    issuer
    currency
    country
    issue_date
    maturity_date
    rating
    type
    coupon
    face_value
  }
}
```

#### Search Portfolios

```graphql
query {
  searchPortfolios(query: "USD") {
    id
    name
    owner_id
    currency
    created_at
  }
}
```

#### Get Portfolio by ID

```graphql
query {
  getPortfolio(id: "portfolio-0") {
    id
    name
    owner_id
    currency
    created_at
    positions {
      instrument_id
      quantity
      market_value
      currency
    }
  }
}
```

#### Get Portfolios Containing a Specific Instrument

This query allows you to find all portfolios that contain a specific financial instrument. You can use the instrument's ID directly, or the API will attempt to find the instrument by ISIN or name if you provide a non-ID value.

```graphql
query {
  getPortfoliosByInstrument(instrument_id: "inst-34") {
    id
    name
    currency
    created_at
    positions {
      instrument_id
      quantity
      market_value
      currency
      instrument {
        id
        name
        isin
        type
      }
    }
    partner {
      id
      name
      partner_type
      residency_country
    }
  }
}
```

## API Reference

### Types


#### Partner

- `id`: ID! - Unique identifier
- `partner_type`: String! - Type of partner (individual or entity)
- `name`: String! - Partner name
- `birth_date`: String - Date of birth (for individuals)
- `incorporation_date`: String - Date of incorporation (for entities)
- `residency_country`: String - Country of residency
- `tax_id`: String - Tax identification number
- `nationality`: String - Nationality (for individuals)
- `legal_entity_type`: String - Type of legal entity (for entities)
- `kyc_status`: String - Know Your Customer status
- `risk_level`: String - Risk level assessment
- `account_type`: String - Type of account
- `pep_flag`: Boolean - Politically Exposed Person flag
- `sanctions_screened`: Boolean - Whether sanctions screening was performed
- `created_at`: String - Creation date
- `portfolios`: [Portfolio!]! - List of portfolios owned by the partner

#### Position

- `instrument_id`: String! - ID of the financial instrument
- `quantity`: Float! - Quantity of the instrument
- `market_value`: Float! - Market value of the position
- `currency`: String! - Currency of the market value
- `instrument`: FinancialInstrument - The financial instrument details

#### Portfolio

- `id`: ID! - Unique identifier
- `owner_id`: String! - ID of the partner who owns the portfolio
- `name`: String! - Portfolio name
- `currency`: String! - Base currency of the portfolio
- `created_at`: String! - Creation date
- `positions`: [Position!]! - List of positions in the portfolio

#### FinancialInstrument

- `id`: ID! - Unique identifier
- `isin`: String! - International Securities Identification Number
- `name`: String! - Instrument name
- `issuer`: String! - Issuer of the instrument
- `currency`: String! - Currency of the instrument
- `country`: String! - Country of issuance
- `issue_date`: String! - Date of issuance
- `maturity_date`: String - Maturity date (for bonds)
- `rating`: String! - Credit rating
- `type`: String! - Type of instrument (share, bond, etf, structured_product)
- `exchange`: String - Exchange where traded (for shares)
- `sector`: String - Industry sector (for shares)
- `coupon`: Float - Coupon rate (for bonds)
- `face_value`: Int - Face value (for bonds)
- `index_tracked`: String - Index being tracked (for ETFs)
- `total_expense_ratio`: Float - Total expense ratio (for ETFs)
- `underlyings`: [String!] - Underlying assets (for structured products)
- `barrier_level`: Float - Barrier level (for structured products)
- `capital_protection`: Boolean - Whether capital is protected (for structured products)

### Queries

- `searchPartners(query: String!)`: [Partner!]! - Search for partners matching the query
- `searchPortfolios(query: String!)`: [Portfolio!]! - Search for portfolios matching the query
- `searchFinancialInstruments(query: String!)`: [FinancialInstrument!]! - Search for financial instruments matching the query
- `getPartner(id: ID!)`: Partner - Get a specific partner by ID
- `getPortfolio(id: ID!)`: Portfolio - Get a specific portfolio by ID
- `getFinancialInstrument(id: ID!)`: FinancialInstrument - Get a specific financial instrument by ID

## Development

### Project Structure

- `docker-compose.yml`: Defines the services (OpenSearch and API)
- `server/`: Contains the API code
  - `server.py`: Main API code with GraphQL schema and resolvers
  - `requirements.txt`: Python dependencies
  - `Dockerfile`: Builds the API container
- `frontend/`: Contains the React frontend application
  - `package.json`: Frontend dependencies and scripts
  - `public/`: Static files
  - `src/`: React components and application logic
    - `App.js`: Main application component with search functionality
    - `index.js`: Entry point for the React application
- `seed_data/`: Directory containing scripts to populate OpenSearch with sample data
  - `main.py`: Main script to seed all data
  - `seed_partners.py`: Script to seed partners data
  - `seed_portfolios.py`: Script to seed portfolios data
  - `seed_instruments.py`: Script to seed financial instruments data
- `data/`: Contains the sample data files in NDJSON format
  - `partners.ndjson`: Sample partners data
  - `portfolios.ndjson`: Sample portfolios data
  - `financial_instruments.ndjson`: Sample financial instruments data

### Adding More Data

You can modify the files in the `seed_data` directory to add more sample data or create a more sophisticated data loading mechanism.

### Controlling Data Loading

By default, the seed scripts will not load data into OpenSearch. You can control when data is loaded using one of the following methods:

1. Set the `SEED_DATA` environment variable to `true` before running the seed script:
   ```bash
   SEED_DATA=true python -m seed_data.main
   ```

2. Use the `--force` flag when running the seed script:
   ```bash
   python -m seed_data.main --force
   ```

This allows you to avoid loading data every time you start the services, which can be useful in development and production environments where you want to preserve existing data.

### Extending the Schema

To add more types or queries, modify the GraphQL schema in `server.py` and add corresponding resolvers.

### Pushing to a Remote Repository

To push this repository to a remote Git repository (like GitHub, GitLab, or Bitbucket), you can use the provided script or follow the manual steps:

#### Using the Setup Script

1. Create a new repository on GitHub (do not initialize it with any files)
2. Run the provided setup script:
   ```bash
   ./setup_github_remote.sh
   ```
3. Follow the prompts to enter your GitHub username, repository name, and authentication method
4. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```

For detailed instructions, see the `instructions.md` file in this repository.

#### Manual Setup

1. Create a new repository on your Git hosting service (GitHub, GitLab, Bitbucket, etc.)
   - Do not initialize it with a README, .gitignore, or license

2. Add the remote repository URL to your local repository:
   ```bash
   git remote add origin <remote_repository_url>
   ```
   Replace `<remote_repository_url>` with the URL of your remote repository, for example:
   - HTTPS: `https://github.com/username/graphql-opensearch.git`
   - SSH: `git@github.com:username/graphql-opensearch.git`

3. Push your local repository to the remote repository:
   ```bash
   git push -u origin main
   ```
   This sets up tracking between your local `main` branch and the remote `main` branch.

4. Verify that your repository has been pushed successfully by visiting the URL of your remote repository.

## Frontend Application

The project includes a React-based frontend application for searching financial instruments and partners.

### Frontend Features

- Search interface for financial instruments
- Search interface for partners
- Real-time search results display
- Responsive design for desktop and mobile

### Running the Frontend

#### Using Docker (Recommended)

The frontend is included in the Docker Compose setup and will start automatically when you run:
```bash
docker-compose up -d
```

The frontend will be available at http://localhost:3000

#### Local Development

If you prefer to run the frontend locally for development:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will be available at http://localhost:3000

### Frontend Architecture

The frontend application uses:

- React for UI components
- Apollo Client for GraphQL integration
- CSS for styling

The main components are:

- `App.js`: The main application component that sets up Apollo Client and renders the search components
- `InstrumentsSearch`: Component for searching financial instruments
- `PartnersSearch`: Component for searching partners

#### Docker Integration

The frontend is containerized using a multi-stage Docker build:
1. First stage: Uses Node.js to build the React application
2. Second stage: Uses Nginx to serve the static files

The Nginx configuration includes:
- Serving the static React application
- Handling client-side routing
- Proxying API requests to the backend service

The Apollo Client is configured to use a relative URL (`/graphql`) for the GraphQL API endpoint, which works both when running in Docker and when running locally.

### Extending the Frontend

To add more features to the frontend:

1. Add new GraphQL queries in `App.js`
2. Create new React components in the `src` directory
3. Update the UI to include the new components
