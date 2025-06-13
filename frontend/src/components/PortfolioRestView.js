import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PortfolioRestView() {
  const [portfolioId, setPortfolioId] = useState('');
  const [referenceCurrency, setReferenceCurrency] = useState('CHF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Use the nginx proxy to access the portfolio service
      const response = await axios.get(`/portfolio/${portfolioId}?reference_currency=${referenceCurrency}`);
      setPortfolioData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-rest-view-container">
      <h2>Portfolio REST API View</h2>
      <p>This view uses the Portfolio REST API through nginx</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Portfolio ID:</label>
          <input
            type="text"
            value={portfolioId}
            onChange={(e) => setPortfolioId(e.target.value)}
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
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'View Portfolio'}
        </button>
      </form>

      {loading && <p>Loading portfolio data...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {portfolioData && (
        <div className="portfolio-content">
          <div className="portfolio-info">
            <h3>Portfolio: {portfolioData.portfolio_id}</h3>
            <p>Reference Currency: {portfolioData.reference_currency}</p>
            <p>Total Portfolio Value: {portfolioData.total_portfolio_value.toLocaleString()} {portfolioData.reference_currency}</p>
          </div>

          <div className="instrument-groups-section">
            <h3>Instrument Groups</h3>
            {portfolioData.instrument_groups.length === 0 ? (
              <p>No instrument groups found in this portfolio</p>
            ) : (
              <div className="instrument-groups-list">
                {portfolioData.instrument_groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="instrument-group-item">
                    <h4>{group.instrument_type}</h4>
                    <p>Total Value: {group.total_value.toLocaleString()} {portfolioData.reference_currency}</p>
                    <p>Positions: {group.positions.length}</p>
                    
                    <table>
                      <thead>
                        <tr>
                          <th>Instrument ID</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Market Value</th>
                          <th>Currency</th>
                          <th>Value in {portfolioData.reference_currency}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.positions.map((position, posIndex) => (
                          <tr key={posIndex}>
                            <td>{position.instrument_id}</td>
                            <td>{position.instrument_type}</td>
                            <td>{position.quantity.toLocaleString()}</td>
                            <td>{position.market_value.toLocaleString()}</td>
                            <td>{position.currency}</td>
                            <td>{position.value_in_ref_currency.toLocaleString()}</td>
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

export default PortfolioRestView;