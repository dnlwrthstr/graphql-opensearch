import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for getting instrument type counts
const GET_INSTRUMENT_TYPE_COUNTS = gql`
  query GetInstrumentTypeCounts {
    getInstrumentTypeCounts {
      type
      count
    }
  }
`;

// GraphQL query for searching instruments
const SEARCH_INSTRUMENTS = gql`
  query SearchInstruments($query: String) {
    searchFinancialInstruments(query: $query) {
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
      exchange
      sector
      coupon
      face_value
      index_tracked
      total_expense_ratio
      underlyings
      barrier_level
      capital_protection
    }
  }
`;

function AdvancedInstrumentSearch() {
  const [searchParams, setSearchParams] = useState({
    name: '*',
    isin: '',
    issuer: '',
    currency: '',
    country: '',
    issue_date: '',
    maturity_date: '',
    rating: '',
    type: '',
    exchange: '',
    sector: '',
    coupon: '',
    face_value: '',
    index_tracked: '',
    total_expense_ratio: '',
    barrier_level: '',
    capital_protection: ''
  });

  const [executeQuery, setExecuteQuery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState({
    common: true,
    bond: true,
    share: true,
    etf: true,
    structured_product: true
  });

  // Update visible fields when type changes
  useEffect(() => {
    if (searchParams.type) {
      setVisibleFields({
        common: true,
        bond: searchParams.type === 'bond',
        share: searchParams.type === 'share',
        etf: searchParams.type === 'etf',
        structured_product: searchParams.type === 'structured_product'
      });
    } else {
      // If no type is selected, show all fields
      setVisibleFields({
        common: true,
        bond: true,
        share: true,
        etf: true,
        structured_product: true
      });
    }
  }, [searchParams.type]);

  // Query for instrument type counts
  const { data: typeCountsData } = useQuery(GET_INSTRUMENT_TYPE_COUNTS);

  // Query for search results
  const { loading, error, data } = useQuery(SEARCH_INSTRUMENTS, {
    variables: { query: searchQuery },
    skip: !executeQuery
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build search query from non-empty parameters
    const queryParts = [];
    Object.entries(searchParams).forEach(([key, value]) => {
      // Skip empty values, but include 'false' for boolean fields
      if ((value && value.trim() !== '') || value === 'false') {
        queryParts.push(`${key}:${value}`);
      }
    });

    const query = queryParts.join(' AND ');
    setSearchQuery(query);
    setExecuteQuery(true);
  };

  const handleReset = () => {
    setSearchParams({
      name: '*',
      isin: '',
      issuer: '',
      currency: '',
      country: '',
      issue_date: '',
      maturity_date: '',
      rating: '',
      type: '',
      exchange: '',
      sector: '',
      coupon: '',
      face_value: '',
      index_tracked: '',
      total_expense_ratio: '',
      barrier_level: '',
      capital_protection: ''
    });
    setSearchQuery('');
    setExecuteQuery(false);
    // Reset visible fields to show all
    setVisibleFields({
      common: true,
      bond: true,
      share: true,
      etf: true,
      structured_product: true
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="partner-portfolio-view-container">
      <h2>Advanced Instrument Search</h2>
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          {/* First row: name, isin, type */}
          <div className="search-row">
            <div className="input-group name-field">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                placeholder="Instrument name (supports wildcards: *, ? and expressions: AND, OR, NOT)..."
              />
            </div>

            <div className="input-group">
              <label>ISIN:</label>
              <input
                type="text"
                name="isin"
                value={searchParams.isin}
                onChange={handleInputChange}
                placeholder="ISIN code..."
              />
            </div>

            <div className="input-group">
              <label>Type:</label>
              <select
                name="type"
                value={searchParams.type}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                <option value="bond">
                  Bond {typeCountsData?.getInstrumentTypeCounts?.find(t => t.type === 'bond')?.count ? `(${typeCountsData.getInstrumentTypeCounts.find(t => t.type === 'bond').count})` : ''}
                </option>
                <option value="share">
                  Share {typeCountsData?.getInstrumentTypeCounts?.find(t => t.type === 'share')?.count ? `(${typeCountsData.getInstrumentTypeCounts.find(t => t.type === 'share').count})` : ''}
                </option>
                <option value="etf">
                  ETF {typeCountsData?.getInstrumentTypeCounts?.find(t => t.type === 'etf')?.count ? `(${typeCountsData.getInstrumentTypeCounts.find(t => t.type === 'etf').count})` : ''}
                </option>
                <option value="structured_product">
                  Structured Product {typeCountsData?.getInstrumentTypeCounts?.find(t => t.type === 'structured_product')?.count ? `(${typeCountsData.getInstrumentTypeCounts.find(t => t.type === 'structured_product').count})` : ''}
                </option>
              </select>
            </div>
          </div>

          {/* Second row: issuer, currency, country */}
          <div className="search-row">
            <div className="input-group">
              <label>Issuer:</label>
              <select
                name="issuer"
                value={searchParams.issuer}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                <option value="BlackRock">BlackRock</option>
                <option value="Goldman Sachs">Goldman Sachs</option>
                <option value="JP Morgan">JP Morgan</option>
                <option value="Credit Suisse">Credit Suisse</option>
                <option value="Deutsche Bank">Deutsche Bank</option>
                <option value="UBS">UBS</option>
                <option value="BNP Paribas">BNP Paribas</option>
              </select>
            </div>

            <div className="input-group">
              <label>Currency:</label>
              <select
                name="currency"
                value={searchParams.currency}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div className="input-group">
              <label>Country:</label>
              <select
                name="country"
                value={searchParams.country}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                <option value="US">US</option>
                <option value="UK">UK</option>
                <option value="DE">DE</option>
                <option value="CH">CH</option>
                <option value="JP">JP</option>
              </select>
            </div>
          </div>

          {/* Third row: rating and share-specific fields (exchange, sector) */}
          <div className="search-row">
            <div className="input-group">
              <label>Rating:</label>
              <select
                name="rating"
                value={searchParams.rating}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                <option value="AAA">AAA</option>
                <option value="AA">AA</option>
                <option value="A">A</option>
                <option value="BBB">BBB</option>
                <option value="BB">BB</option>
                <option value="B">B</option>
                <option value="CCC">CCC</option>
                <option value="CC">CC</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            {visibleFields.share && (
              <>
                <div className="input-group">
                  <label>Exchange:</label>
                  <select
                    name="exchange"
                    value={searchParams.exchange}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    <option value="NYSE">NYSE</option>
                    <option value="NASDAQ">NASDAQ</option>
                    <option value="LSE">LSE</option>
                    <option value="TSE">TSE</option>
                    <option value="SIX">SIX</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Sector:</label>
                  <select
                    name="sector"
                    value={searchParams.sector}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Fourth row: Bond specific fields */}
          {visibleFields.bond && (
            <div className="search-row">
              <div className="input-group">
                <label>Coupon (%):</label>
                <input
                  type="text"
                  name="coupon"
                  value={searchParams.coupon}
                  onChange={handleInputChange}
                  placeholder="Bond coupon rate..."
                />
              </div>

              <div className="input-group">
                <label>Face Value:</label>
                <input
                  type="text"
                  name="face_value"
                  value={searchParams.face_value}
                  onChange={handleInputChange}
                  placeholder="Bond face value..."
                />
              </div>
            </div>
          )}

          {/* Fifth row: ETF specific fields */}
          {visibleFields.etf && (
            <div className="search-row">
              <div className="input-group">
                <label>Index Tracked:</label>
                <select
                  name="index_tracked"
                  value={searchParams.index_tracked}
                  onChange={handleInputChange}
                >
                  <option value="">Select...</option>
                  <option value="S&P 500">S&P 500</option>
                  <option value="NASDAQ 100">NASDAQ 100</option>
                  <option value="DAX">DAX</option>
                  <option value="Nikkei 225">Nikkei 225</option>
                  <option value="SMI">SMI</option>
                </select>
              </div>

              <div className="input-group">
                <label>Total Expense Ratio:</label>
                <input
                  type="text"
                  name="total_expense_ratio"
                  value={searchParams.total_expense_ratio}
                  onChange={handleInputChange}
                  placeholder="ETF expense ratio..."
                />
              </div>
            </div>
          )}

          {/* Sixth row: Structured Product specific fields */}
          {visibleFields.structured_product && (
            <div className="search-row">
              <div className="input-group">
                <label>Barrier Level (%):</label>
                <input
                  type="text"
                  name="barrier_level"
                  value={searchParams.barrier_level}
                  onChange={handleInputChange}
                  placeholder="Structured product barrier level..."
                />
              </div>

              <div className="input-group">
                <label>Capital Protection:</label>
                <select
                  name="capital_protection"
                  value={searchParams.capital_protection}
                  onChange={handleInputChange}
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="button-group">
          <button type="submit">Search</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <div className="results">
        <h3>Search Results {data && data.searchFinancialInstruments ? `(${data.searchFinancialInstruments.length} instruments found)` : ''}</h3>

        <div className="instrument-results-table-container">
          <table className="instrument-results-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ISIN</th>
                <th>Type</th>
                <th>Issuer</th>
                <th>Currency</th>
                <th>Country</th>
                <th>Issue Date</th>
                <th>Maturity Date</th>
                <th>Rating</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data && data.searchFinancialInstruments && data.searchFinancialInstruments.length > 0 ? (
                data.searchFinancialInstruments.map(instrument => (
                  <tr key={instrument.id}>
                    <td>{instrument.name}</td>
                    <td>{instrument.isin}</td>
                    <td>{instrument.type}</td>
                    <td>{instrument.issuer}</td>
                    <td>{instrument.currency}</td>
                    <td>{instrument.country}</td>
                    <td>{formatDate(instrument.issue_date)}</td>
                    <td>{formatDate(instrument.maturity_date)}</td>
                    <td>{instrument.rating}</td>
                    <td>
                      {instrument.type === 'bond' && (
                        <>Coupon: {instrument.coupon}%</>
                      )}
                      {instrument.type === 'share' && (
                        <>Exchange: {instrument.exchange}, Sector: {instrument.sector}</>
                      )}
                      {instrument.type === 'etf' && (
                        <>Index: {instrument.index_tracked}, TER: {instrument.total_expense_ratio}%</>
                      )}
                      {instrument.type === 'structured_product' && (
                        <>Barrier: {instrument.barrier_level}%, Protection: {instrument.capital_protection ? 'Yes' : 'No'}</>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{textAlign: 'center'}}>
                    {data && data.searchFinancialInstruments && data.searchFinancialInstruments.length === 0 
                      ? 'No instruments found matching your criteria' 
                      : 'Use the search form above to find instruments'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdvancedInstrumentSearch;
