# GraphQL OpenSearch API

A GraphQL API that provides a search interface for papers and datasets stored in OpenSearch.

## Project Overview

This project demonstrates how to build a GraphQL API that interfaces with OpenSearch to provide search capabilities. It includes:

- A GraphQL API built with Ariadne and Starlette
- OpenSearch integration for full-text search
- Docker containerization for easy deployment
- Sample data seeding for demonstration purposes

## Architecture

The project consists of three main services:

1. **OpenSearch**: A search engine that stores and indexes the data
2. **OpenSearch Dashboard**: A web-based UI for interacting with OpenSearch
3. **GraphQL API**: A Python-based API that provides a GraphQL interface to search the data

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

## Usage

You can interact with the GraphQL API using any GraphQL client (like GraphiQL, Insomnia, or Postman).

### OpenSearch Dashboard

You can use the OpenSearch Dashboard to:
- Explore your data
- Create visualizations
- Monitor your OpenSearch cluster
- Perform direct queries against your indices

### Example Queries

#### Search Papers

```graphql
query {
  searchPapers(query: "neural") {
    id
    title
    authors
  }
}
```

#### Search Datasets

```graphql
query {
  searchDatasets(query: "medical") {
    id
    name
    domain
  }
}
```

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

#### Search Financial Instruments

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

## API Reference

### Types

#### Paper

- `id`: ID! - Unique identifier
- `title`: String! - Paper title
- `authors`: [String!]! - List of authors

#### Dataset

- `id`: ID! - Unique identifier
- `name`: String! - Dataset name
- `domain`: String - Domain/category of the dataset

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

#### Position

- `instrument_id`: String! - ID of the financial instrument
- `quantity`: Float! - Quantity of the instrument
- `market_value`: Float! - Market value of the position
- `currency`: String! - Currency of the market value

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

- `searchPapers(query: String!)`: [Paper!]! - Search for papers matching the query
- `searchDatasets(query: String!)`: [Dataset!]! - Search for datasets matching the query
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

### Extending the Schema

To add more types or queries, modify the GraphQL schema in `server.py` and add corresponding resolvers.

### Pushing to a Remote Repository

To push this repository to a remote Git repository (like GitHub, GitLab, or Bitbucket), follow these steps:

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
