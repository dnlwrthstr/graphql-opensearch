import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Define colors for pie chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

function PortfolioRestView() {
  const [portfolioId, setPortfolioId] = useState('');
  const [referenceCurrency, setReferenceCurrency] = useState('CHF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aggregatesData, setAggregatesData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAggregatesData(null);

    try {
      // Use the portfolio service environment variable if available (http://localhost:8001 in npm mode)
      // Otherwise fallback to backend URL (http://localhost:8000 in npm mode)
      // Or use relative URL (for Docker mode where nginx handles proxying)
      const baseUrl = process.env.REACT_APP_PORTFOLIO_SERVICE_URL || process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.get(`${baseUrl}/portfolio-aggregates/${portfolioId}?reference_currency=${referenceCurrency}`);
      setAggregatesData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-rest-view-container">
      <h2>Portfolio Aggregates View</h2>
      <p>This view displays portfolio aggregates data from the Portfolio Aggregates REST API</p>

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

      {aggregatesData && aggregatesData.portfolio && (
        <div className="portfolio-aggregates-content">
          <div className="portfolio-info">
            <h3>Portfolio Aggregates</h3>
            <p>Valuation Currency: {aggregatesData.portfolio.valuation_currency}</p>
            <p>Total Portfolio Value: {aggregatesData.portfolio.value_in_valuation_currency.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {aggregatesData.portfolio.valuation_currency}</p>
          </div>

          <div className="exposure-section">
            <h3>Instrument Type Exposure</h3>
            {!aggregatesData.portfolio.instrument_exposures || aggregatesData.portfolio.instrument_exposures.length === 0 ? (
              <p>No instrument type exposure data available</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Instrument Type</th>
                    <th>Value in {aggregatesData.portfolio.valuation_currency}</th>
                    <th>% of Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatesData.portfolio.instrument_exposures.map((exposure, index) => (
                    <tr key={index}>
                      <td>{exposure.instrument_type}</td>
                      <td>{exposure.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {aggregatesData.portfolio.valuation_currency}</td>
                      <td>{((exposure.value / aggregatesData.portfolio.value_in_valuation_currency) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="exposure-section">
            <h3>Currency Exposure</h3>
            {!aggregatesData.portfolio.currency_exposure || aggregatesData.portfolio.currency_exposure.length === 0 ? (
              <p>No currency exposure data available</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Value in {aggregatesData.portfolio.valuation_currency}</th>
                    <th>% of Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatesData.portfolio.currency_exposure.map((exposure, index) => (
                    <tr key={index}>
                      <td>{exposure.currency}</td>
                      <td>{exposure.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {aggregatesData.portfolio.valuation_currency}</td>
                      <td>{((exposure.value / aggregatesData.portfolio.value_in_valuation_currency) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <h3>Visualization</h3>
            <div className="charts-container">
              {/* Instrument Type Exposure Pie Chart */}
              <div className="chart-wrapper">
                <h4>Instrument Type Exposure</h4>
                {!aggregatesData.portfolio.instrument_exposures || aggregatesData.portfolio.instrument_exposures.length === 0 ? (
                  <p>No instrument type exposure data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={aggregatesData.portfolio.instrument_exposures.map(item => ({
                          name: item.instrument_type,
                          value: item.value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {aggregatesData.portfolio.instrument_exposures.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' ' + aggregatesData.portfolio.valuation_currency} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Currency Exposure Pie Chart */}
              <div className="chart-wrapper">
                <h4>Currency Exposure</h4>
                {!aggregatesData.portfolio.currency_exposure || aggregatesData.portfolio.currency_exposure.length === 0 ? (
                  <p>No currency exposure data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={aggregatesData.portfolio.currency_exposure.map(item => ({
                          name: item.currency,
                          value: item.value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {aggregatesData.portfolio.currency_exposure.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' ' + aggregatesData.portfolio.valuation_currency} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioRestView;
