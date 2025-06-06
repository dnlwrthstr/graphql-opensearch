import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';
import './App.css';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: '/graphql',  // Use relative URL for compatibility with Docker and local development
  cache: new InMemoryCache()
});

// GraphQL query for financial instruments
const SEARCH_INSTRUMENTS = gql`
  query SearchInstruments($query: String, $id: ID) {
    searchFinancialInstruments(query: $query, id: $id) {
      id
      name
      type
      isin
      currency
    }
  }
`;

// GraphQL query for partners
const SEARCH_PARTNERS = gql`
  query SearchPartners($query: String, $id: ID) {
    searchPartners(query: $query, id: $id) {
      id
      name
      partner_type
      residency_country
      kyc_status
    }
  }
`;

// GraphQL query for portfolio overview
const GET_PARTNER_WITH_PORTFOLIOS = gql`
  query GetPartnerWithPortfolios($id: ID!) {
    getPartner(id: $id) {
      id
      partner_type
      name
      birth_date
      incorporation_date
      residency_country
      tax_id
      nationality
      legal_entity_type
      kyc_status
      risk_level
      account_type
      pep_flag
      sanctions_screened
      created_at
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
            issuer
            currency
            type
            rating
          }
        }
      }
    }
  }
`;

// Financial Instruments Search Component
function InstrumentsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [executeSearch, setExecuteSearch] = useState(false);

  const { loading, error, data } = useQuery(SEARCH_INSTRUMENTS, {
    variables: { 
      query: searchQuery || undefined,
      id: searchId || undefined
    },
    skip: !executeSearch
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setExecuteSearch(true);
  };

  return (
    <div className="search-container">
      <h2>Search Financial Instruments</h2>
      <form onSubmit={handleSearch}>
        <div className="search-inputs">
          <div className="input-group">
            <label>Search by term:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExecuteSearch(false);
              }}
              placeholder="Enter search term..."
            />
          </div>
          <div className="input-group">
            <label>Search by ID:</label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setExecuteSearch(false);
              }}
              placeholder="Enter ID..."
            />
          </div>
        </div>
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && data.searchFinancialInstruments && (
        <div className="results">
          <h3>Results:</h3>
          {data.searchFinancialInstruments.length === 0 ? (
            <p>No instruments found</p>
          ) : (
            <ul>
              {data.searchFinancialInstruments.map(instrument => (
                <li key={instrument.id}>
                  <strong>{instrument.name}</strong> ({instrument.type})
                  <br />
                  ID: {instrument.id}
                  <br />
                  ISIN: {instrument.isin}, Currency: {instrument.currency}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Partners Search Component
function PartnersSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [executeSearch, setExecuteSearch] = useState(false);

  const { loading, error, data } = useQuery(SEARCH_PARTNERS, {
    variables: { 
      query: searchQuery || undefined,
      id: searchId || undefined
    },
    skip: !executeSearch
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setExecuteSearch(true);
  };

  return (
    <div className="search-container">
      <h2>Search Partners</h2>
      <form onSubmit={handleSearch}>
        <div className="search-inputs">
          <div className="input-group">
            <label>Search by term:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExecuteSearch(false);
              }}
              placeholder="Enter search term..."
            />
          </div>
          <div className="input-group">
            <label>Search by ID:</label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setExecuteSearch(false);
              }}
              placeholder="Enter ID..."
            />
          </div>
        </div>
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && data.searchPartners && (
        <div className="results">
          <h3>Results:</h3>
          {data.searchPartners.length === 0 ? (
            <p>No partners found</p>
          ) : (
            <ul>
              {data.searchPartners.map(partner => (
                <li key={partner.id}>
                  <strong>{partner.name}</strong> ({partner.partner_type})
                  <br />
                  ID: {partner.id}
                  <br />
                  Country: {partner.residency_country}, Status: {partner.kyc_status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Portfolio Overview Component
function PortfolioOverview() {
  const [partnerId, setPartnerId] = useState('');
  const [executeQuery, setExecuteQuery] = useState(false);
  const [expandedPortfolios, setExpandedPortfolios] = useState({});

  const { loading, error, data } = useQuery(GET_PARTNER_WITH_PORTFOLIOS, {
    variables: { id: partnerId },
    skip: !executeQuery
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setExecuteQuery(true);
  };

  const togglePortfolio = (portfolioId) => {
    setExpandedPortfolios(prev => ({
      ...prev,
      [portfolioId]: !prev[portfolioId]
    }));
  };

  return (
    <div className="portfolio-overview-container">
      <h2>Portfolio Overview</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Partner ID:</label>
          <input
            type="text"
            value={partnerId}
            onChange={(e) => {
              setPartnerId(e.target.value);
              setExecuteQuery(false);
            }}
            placeholder="Enter partner ID..."
            required
          />
        </div>
        <button type="submit">View Portfolios</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && data.getPartner && (
        <div className="portfolio-content">
          <div className="partner-details">
            <h3>Partner Details</h3>
            <div className="partner-info">
              <p><strong>ID:</strong> {data.getPartner.id}</p>
              <p><strong>Name:</strong> {data.getPartner.name}</p>
              <p><strong>Type:</strong> {data.getPartner.partner_type}</p>
              {data.getPartner.birth_date && <p><strong>Birth Date:</strong> {data.getPartner.birth_date}</p>}
              {data.getPartner.incorporation_date && <p><strong>Incorporation Date:</strong> {data.getPartner.incorporation_date}</p>}
              <p><strong>Residency Country:</strong> {data.getPartner.residency_country}</p>
              <p><strong>Tax ID:</strong> {data.getPartner.tax_id}</p>
              {data.getPartner.nationality && <p><strong>Nationality:</strong> {data.getPartner.nationality}</p>}
              {data.getPartner.legal_entity_type && <p><strong>Legal Entity Type:</strong> {data.getPartner.legal_entity_type}</p>}
              <p><strong>KYC Status:</strong> {data.getPartner.kyc_status}</p>
              <p><strong>Risk Level:</strong> {data.getPartner.risk_level}</p>
              <p><strong>Account Type:</strong> {data.getPartner.account_type}</p>
              <p><strong>PEP Flag:</strong> {data.getPartner.pep_flag ? 'Yes' : 'No'}</p>
              <p><strong>Sanctions Screened:</strong> {data.getPartner.sanctions_screened ? 'Yes' : 'No'}</p>
              <p><strong>Created At:</strong> {data.getPartner.created_at}</p>
            </div>
          </div>

          <div className="portfolios-section">
            <h3>Portfolios</h3>
            {data.getPartner.portfolios.length === 0 ? (
              <p>No portfolios found for this partner</p>
            ) : (
              <div className="portfolios-list">
                {data.getPartner.portfolios.map(portfolio => (
                  <div key={portfolio.id} className="portfolio-item">
                    <div 
                      className="portfolio-header" 
                      onClick={() => togglePortfolio(portfolio.id)}
                    >
                      <h4>{portfolio.name}</h4>
                      <div className="portfolio-summary">
                        <p><strong>ID:</strong> {portfolio.id}</p>
                        <p><strong>Currency:</strong> {portfolio.currency}</p>
                        <p><strong>Created:</strong> {portfolio.created_at}</p>
                        <p><strong>Positions:</strong> {portfolio.positions.length}</p>
                      </div>
                      <span>{expandedPortfolios[portfolio.id] ? '▼' : '►'}</span>
                    </div>

                    {expandedPortfolios[portfolio.id] && (
                      <div className="positions-list">
                        <h5>Positions</h5>
                        {portfolio.positions.length === 0 ? (
                          <p>No positions in this portfolio</p>
                        ) : (
                          <table>
                            <thead>
                              <tr>
                                <th>Instrument</th>
                                <th>Quantity</th>
                                <th>Market Value</th>
                                <th>Currency</th>
                                <th>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {portfolio.positions.map((position, index) => (
                                <tr key={index}>
                                  <td>{position.instrument ? position.instrument.name : 'Unknown'}</td>
                                  <td>{position.quantity.toLocaleString()}</td>
                                  <td>{position.market_value.toLocaleString()}</td>
                                  <td>{position.currency}</td>
                                  <td>
                                    {position.instrument && (
                                      <>
                                        <p><strong>ISIN:</strong> {position.instrument.isin}</p>
                                        <p><strong>Issuer:</strong> {position.instrument.issuer}</p>
                                        <p><strong>Type:</strong> {position.instrument.type}</p>
                                        <p><strong>Rating:</strong> {position.instrument.rating}</p>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <h1>Financial Search Application</h1>
        </header>
        <main>
          <PortfolioOverview />
          <div className="search-section">
            <InstrumentsSearch />
            <PartnersSearch />
          </div>
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;
