import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for basic portfolio view
const GET_PORTFOLIO = gql`
  query GetPortfolio($id: ID!) {
    getPortfolio(id: $id) {
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
          type
          currency
        }
      }
    }
  }
`;

function BasicPortfolioView() {
  const [portfolioId, setPortfolioId] = useState('');
  const [executeQuery, setExecuteQuery] = useState(false);
  const [referenceCurrency, setReferenceCurrency] = useState('CHF');

  const { loading, error, data } = useQuery(GET_PORTFOLIO, {
    variables: { id: portfolioId },
    skip: !executeQuery
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setExecuteQuery(true);
  };

  // Calculate total portfolio value
  const calculateTotalValue = (positions) => {
    return positions.reduce((total, position) => total + position.market_value, 0);
  };

  // Group positions by instrument type
  const groupPositionsByType = (positions) => {
    const groups = {};
    
    positions.forEach(position => {
      const type = position.instrument?.type || 'Unknown';
      
      if (!groups[type]) {
        groups[type] = {
          type,
          positions: [],
          totalValue: 0
        };
      }
      
      groups[type].positions.push(position);
      groups[type].totalValue += position.market_value;
    });
    
    return Object.values(groups);
  };

  return (
    <div className="basic-portfolio-view-container">
      <h2>Basic Portfolio View</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Portfolio ID:</label>
          <input
            type="text"
            value={portfolioId}
            onChange={(e) => {
              setPortfolioId(e.target.value);
              setExecuteQuery(false);
            }}
            placeholder="Enter portfolio ID..."
            required
          />
        </div>
        <div className="input-group">
          <label>Reference Currency:</label>
          <select
            value={referenceCurrency}
            onChange={(e) => setReferenceCurrency(e.target.value)}
          >
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <button type="submit">View Portfolio</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && data.getPortfolio && (
        <div className="portfolio-content">
          <div className="portfolio-info">
            <h3>{data.getPortfolio.name}</h3>
            <p>Portfolio ID: {data.getPortfolio.id} | Currency: {data.getPortfolio.currency}</p>
            <p>Created: {data.getPortfolio.created_at}</p>
            <p>Total Value: {calculateTotalValue(data.getPortfolio.positions).toLocaleString()} {data.getPortfolio.currency}</p>
          </div>

          <div className="instrument-groups-section">
            <h3>Instrument Groups</h3>
            {data.getPortfolio.positions.length === 0 ? (
              <p>No positions found in this portfolio</p>
            ) : (
              <div className="instrument-groups-list">
                {groupPositionsByType(data.getPortfolio.positions).map(group => (
                  <div key={group.type} className="instrument-group-item">
                    <h4>{group.type}</h4>
                    <p>Total Value: {group.totalValue.toLocaleString()} {data.getPortfolio.currency}</p>
                    <p>Positions: {group.positions.length}</p>
                    
                    <table>
                      <thead>
                        <tr>
                          <th>Instrument Name</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Market Value</th>
                          <th>Currency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.positions.map((position, index) => (
                          <tr key={index}>
                            <td>{position.instrument?.name || 'Unknown'}</td>
                            <td>{position.instrument?.type || 'N/A'}</td>
                            <td>{position.quantity ? position.quantity.toLocaleString() : 'N/A'}</td>
                            <td>{position.market_value ? position.market_value.toLocaleString() : 'N/A'}</td>
                            <td>{position.currency || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default BasicPortfolioView;