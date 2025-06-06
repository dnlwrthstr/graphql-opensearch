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

### Queries

- `searchPapers(query: String!)`: [Paper!]! - Search for papers matching the query
- `searchDatasets(query: String!)`: [Dataset!]! - Search for datasets matching the query

## Development

### Project Structure

- `docker-compose.yml`: Defines the services (OpenSearch and API)
- `server/`: Contains the API code
  - `server.py`: Main API code with GraphQL schema and resolvers
  - `seed_data.py`: Script to populate OpenSearch with sample data
  - `requirements.txt`: Python dependencies
  - `Dockerfile`: Builds the API container

### Adding More Data

You can modify `seed_data.py` to add more sample data or create a more sophisticated data loading mechanism.

### Extending the Schema

To add more types or queries, modify the GraphQL schema in `server.py` and add corresponding resolvers.
