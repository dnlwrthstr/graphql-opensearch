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
      // Use the portfolio endpoint as specified in the issue
      const response = await axios.get(`/portfolio/${portfolioId}?reference_currency=${referenceCurrency}`);
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

          {portfolioData.instrument_groups.map((group, groupIndex) => (
            <div key={groupIndex} className="asset-class-section">
              <div 
                className="group-header" 
                onClick={() => toggleGroupExpansion(groupIndex)}
                style={{ 
                  cursor: 'pointer',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              >
                <h3 style={{ margin: '0 0 5px 0' }}>
                  {group.instrument_type} {expandedGroups[groupIndex] ? '▼' : '►'}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ margin: '5px 0' }}>Total Value: {group.total_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {portfolioData.reference_currency}</p>
                  <p style={{ margin: '5px 0' }}>Percentage of Portfolio: {((group.total_value / portfolioData.total_portfolio_value) * 100).toFixed(2)}%</p>
                </div>
              </div>

              {expandedGroups[groupIndex] && (
                <div className="positions-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th colSpan={group.instrument_type === 'share' || group.instrument_type === 'structured_product' ? 5 : 4} className="section-header">Instrument Data</th>
                        <th colSpan={1} className="section-header">Asset Class Info</th>
                        <th colSpan={4} className="section-header">Position Values</th>
                      </tr>
                      <tr>
                        <th>ISIN</th>
                        <th>Name</th>
                        <th>Issuer</th>
                        {group.instrument_type === 'share' || group.instrument_type === 'structured_product' ? (
                          <th>Sector/Underlyings</th>
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
                          {position.instrument_type === 'share' || position.instrument_type === 'structured_product' ? (
                            <td>{position.instrument_type === 'structured_product' ? (position.instrument?.underlyings?.join(', ') || 'N/A') : (position.instrument?.sector || 'N/A')}</td>
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
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfolioAssetClassesView;
