import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';
import './App.css';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: '/graphql',  // Use relative URL for compatibility with Docker and local development
  cache: new InMemoryCache()
});

// GraphQL query for partner portfolio view
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
            country
            issue_date
            maturity_date
            sector
            coupon
            face_value
            exchange
          }
        }
      }
    }
  }
`;

// Partner Portfolio View Component
function PartnerPortfolioView() {
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
    <div className="partner-portfolio-view-container">
      <h2>Partner Portfolio View</h2>
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
        <button type="submit">View Partner</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && data.getPartner && (
        <div className="partner-portfolio-content">
          <div className="partner-info">
            <h3>{data.getPartner.name}</h3>
            <p>Partner ID: {data.getPartner.id} | Type: {data.getPartner.partner_type}</p>
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
                        <p>Currency: {portfolio.currency} | Created: {portfolio.created_at} | Positions: {portfolio.positions.length}</p>
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
                                <th>Instrument Name</th>
                                <th>ISIN</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Market Value</th>
                                <th>Currency</th>
                                <th>Issuer</th>
                                <th>Rating</th>
                                <th>Country</th>
                                <th>Issue Date</th>
                                <th>Maturity Date</th>
                                {/* Only show these columns if at least one position has these values */}
                                {portfolio.positions.some(p => p.instrument && p.instrument.sector) && <th>Sector</th>}
                                {portfolio.positions.some(p => p.instrument && p.instrument.coupon) && <th>Coupon</th>}
                                {portfolio.positions.some(p => p.instrument && p.instrument.face_value) && <th>Face Value</th>}
                                {portfolio.positions.some(p => p.instrument && p.instrument.exchange) && <th>Exchange</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {portfolio.positions.map((position, index) => {
                                const instrument = position.instrument || {};
                                return (
                                  <tr key={index}>
                                    <td>{instrument.name || 'Unknown'}</td>
                                    <td>{instrument.isin || 'N/A'}</td>
                                    <td>{instrument.type || 'N/A'}</td>
                                    <td>{position.quantity ? position.quantity.toLocaleString() : 'N/A'}</td>
                                    <td>{position.market_value ? position.market_value.toLocaleString() : 'N/A'}</td>
                                    <td>{position.currency || 'N/A'}</td>
                                    <td>{instrument.issuer || 'N/A'}</td>
                                    <td>{instrument.rating || 'N/A'}</td>
                                    <td>{instrument.country || 'N/A'}</td>
                                    <td>{instrument.issue_date || 'N/A'}</td>
                                    <td>{instrument.maturity_date || 'N/A'}</td>
                                    {portfolio.positions.some(p => p.instrument && p.instrument.sector) && 
                                      <td>{instrument.sector || 'N/A'}</td>}
                                    {portfolio.positions.some(p => p.instrument && p.instrument.coupon) && 
                                      <td>{instrument.coupon ? instrument.coupon.toLocaleString() : 'N/A'}</td>}
                                    {portfolio.positions.some(p => p.instrument && p.instrument.face_value) && 
                                      <td>{instrument.face_value ? instrument.face_value.toLocaleString() : 'N/A'}</td>}
                                    {portfolio.positions.some(p => p.instrument && p.instrument.exchange) && 
                                      <td>{instrument.exchange || 'N/A'}</td>}
                                  </tr>
                                );
                              })}
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
          <h1>Partner Portfolio Viewer</h1>
        </header>
        <main>
          <PartnerPortfolioView />
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;
