import React, { useState } from 'react';
import axios from 'axios';

function PortfolioAssetClassesView() {
  const [portfolioId, setPortfolioId] = useState('');
  const [referenceCurrency, setReferenceCurrency] = useState('CHF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroupExpansion = (groupIndex) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupIndex]: !prev[groupIndex]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPortfolioData(null);
    setExpandedGroups({});

    try {
      // Use the portfolio service environment variable if available (http://localhost:8001 in npm mode)
      // Otherwise fallback to backend URL (http://localhost:8000 in npm mode)
      // Or use relative URL (for Docker mode where nginx handles proxying)
      const baseUrl = process.env.REACT_APP_PORTFOLIO_SERVICE_URL || process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.get(`${baseUrl}/portfolio/${portfolioId}?reference_currency=${referenceCurrency}`);
      setPortfolioData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-asset-classes-container">
      <h2>Portfolio Asset Classes View</h2>
      <p><strong>Note:</strong> For simplicity, asset classes here represent instrument types.</p>

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
        <div className="portfolio-asset-classes-content">
          <div className="portfolio-info">
            <h3>Portfolio Overview</h3>
            <p>Portfolio ID: {portfolioData.portfolio_id}</p>
            <p>Reference Currency: {portfolioData.reference_currency}</p>
            <p>Total Portfolio Value: {portfolioData.total_portfolio_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {portfolioData.reference_currency}</p>
          </div>

          {/* Sort instrument_groups by custom order before mapping */}
          {(() => {
            const instrumentOrder = ['share', 'bond', 'etf', 'structured_product'];
            const sortedGroups = [...portfolioData.instrument_groups].sort(
              (a, b) =>
                instrumentOrder.indexOf(a.instrument_type) - instrumentOrder.indexOf(b.instrument_type)
            );
            return sortedGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="asset-class-section">
                <div
                  className="group-header"
                  onClick={() => toggleGroupExpansion(groupIndex)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    backgroundColor: '#d4e6ff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold' }}>{group.instrument_type}</h3>
                    </div>
                    <span>{expandedGroups[groupIndex] ? '▼' : '►'}</span>
                  </div>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '5px'
                  }}>
                    <div>
                      <div style={{ textAlign: 'right' }}>Total Value: {group.total_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {portfolioData.reference_currency}</div>
                      <div style={{ textAlign: 'right' }}>Percentage of Portfolio: {((group.total_value / portfolioData.total_portfolio_value) * 100).toFixed(2)}%</div>
                    </div>
                  </div>
                </div>

                {expandedGroups[groupIndex] && (
                  <div className="positions-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ISIN</th>
                          <th>Name</th>
                          <th>Issuer</th>
                          {group.instrument_type === 'share' ? (
                            <th>Sector</th>
                          ) : group.instrument_type === 'structured_product' ? (
                            <th>Underlyings</th>
                          ) : null}
                          <th>Country</th>

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
                            {/* Instrument Data (Left) */}
                            <td>{position.instrument?.isin || 'N/A'}</td>
                            <td>{position.instrument?.name || 'N/A'}</td>
                            <td>{position.instrument?.issuer || 'N/A'}</td>
                            {position.instrument_type === 'share' ? (
                              <td>{position.instrument?.sector || 'N/A'}</td>
                            ) : position.instrument_type === 'structured_product' ? (
                              <td>{position.instrument?.underlyings?.join(', ') || 'N/A'}</td>
                            ) : null}
                            <td>{position.instrument?.country || 'N/A'}</td>

                            {/* Asset Class Info (Middle) */}
                            <td>{position.instrument_type}</td>

                            {/* Position Values (Right) */}
                            <td>{position.quantity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>{position.market_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>{position.currency}</td>
                            <td>{position.value_in_ref_currency.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}

export default PortfolioAssetClassesView;
