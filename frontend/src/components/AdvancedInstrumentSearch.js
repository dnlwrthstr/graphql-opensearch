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

// GraphQL query for getting instrument issuer counts
const GET_INSTRUMENT_ISSUER_COUNTS = gql`
  query GetInstrumentIssuerCounts {
    getInstrumentIssuerCounts {
      type
      count
    }
  }
`;

// GraphQL query for getting instrument country counts
const GET_INSTRUMENT_COUNTRY_COUNTS = gql`
  query GetInstrumentCountryCounts {
    getInstrumentCountryCounts {
      type
      count
    }
  }
`;

// GraphQL query for getting instrument currency counts
const GET_INSTRUMENT_CURRENCY_COUNTS = gql`
  query GetInstrumentCurrencyCounts {
    getInstrumentCurrencyCounts {
      type
      count
    }
  }
`;

// GraphQL query for getting instrument exchange counts
const GET_INSTRUMENT_EXCHANGE_COUNTS = gql`
  query GetInstrumentExchangeCounts {
    getInstrumentExchangeCounts {
      type
      count
    }
  }
`;

// GraphQL query for getting instrument sector counts
const GET_INSTRUMENT_SECTOR_COUNTS = gql`
  query GetInstrumentSectorCounts {
    getInstrumentSectorCounts {
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

  // Query for instrument issuer counts
  const { data: issuerCountsData } = useQuery(GET_INSTRUMENT_ISSUER_COUNTS);

  // Query for instrument country counts
  const { data: countryCountsData } = useQuery(GET_INSTRUMENT_COUNTRY_COUNTS);

  // Query for instrument currency counts
  const { data: currencyCountsData } = useQuery(GET_INSTRUMENT_CURRENCY_COUNTS);

  // Query for instrument exchange counts
  const { data: exchangeCountsData } = useQuery(GET_INSTRUMENT_EXCHANGE_COUNTS);

  // Query for instrument sector counts
  const { data: sectorCountsData } = useQuery(GET_INSTRUMENT_SECTOR_COUNTS);

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
                <option value="BlackRock">
                  BlackRock {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'BlackRock')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'BlackRock').count})` : ''}
                </option>
                <option value="Goldman Sachs">
                  Goldman Sachs {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'Goldman Sachs')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'Goldman Sachs').count})` : ''}
                </option>
                <option value="JP Morgan">
                  JP Morgan {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'JP Morgan')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'JP Morgan').count})` : ''}
                </option>
                <option value="Credit Suisse">
                  Credit Suisse {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'Credit Suisse')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'Credit Suisse').count})` : ''}
                </option>
                <option value="Deutsche Bank">
                  Deutsche Bank {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'Deutsche Bank')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'Deutsche Bank').count})` : ''}
                </option>
                <option value="UBS">
                  UBS {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'UBS')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'UBS').count})` : ''}
                </option>
                <option value="BNP Paribas">
                  BNP Paribas {issuerCountsData?.getInstrumentIssuerCounts?.find(i => i.type === 'BNP Paribas')?.count ? `(${issuerCountsData.getInstrumentIssuerCounts.find(i => i.type === 'BNP Paribas').count})` : ''}
                </option>
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
                <option value="USD">
                  USD {currencyCountsData?.getInstrumentCurrencyCounts?.find(c => c.type === 'USD')?.count ? `(${currencyCountsData.getInstrumentCurrencyCounts.find(c => c.type === 'USD').count})` : ''}
                </option>
                <option value="EUR">
                  EUR {currencyCountsData?.getInstrumentCurrencyCounts?.find(c => c.type === 'EUR')?.count ? `(${currencyCountsData.getInstrumentCurrencyCounts.find(c => c.type === 'EUR').count})` : ''}
                </option>
                <option value="GBP">
                  GBP {currencyCountsData?.getInstrumentCurrencyCounts?.find(c => c.type === 'GBP')?.count ? `(${currencyCountsData.getInstrumentCurrencyCounts.find(c => c.type === 'GBP').count})` : ''}
                </option>
                <option value="CHF">
                  CHF {currencyCountsData?.getInstrumentCurrencyCounts?.find(c => c.type === 'CHF')?.count ? `(${currencyCountsData.getInstrumentCurrencyCounts.find(c => c.type === 'CHF').count})` : ''}
                </option>
                <option value="JPY">
                  JPY {currencyCountsData?.getInstrumentCurrencyCounts?.find(c => c.type === 'JPY')?.count ? `(${currencyCountsData.getInstrumentCurrencyCounts.find(c => c.type === 'JPY').count})` : ''}
                </option>
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
                <option value="US">
                  US {countryCountsData?.getInstrumentCountryCounts?.find(c => c.type === 'US')?.count ? `(${countryCountsData.getInstrumentCountryCounts.find(c => c.type === 'US').count})` : ''}
                </option>
                <option value="UK">
                  UK {countryCountsData?.getInstrumentCountryCounts?.find(c => c.type === 'UK')?.count ? `(${countryCountsData.getInstrumentCountryCounts.find(c => c.type === 'UK').count})` : ''}
                </option>
                <option value="DE">
                  DE {countryCountsData?.getInstrumentCountryCounts?.find(c => c.type === 'DE')?.count ? `(${countryCountsData.getInstrumentCountryCounts.find(c => c.type === 'DE').count})` : ''}
                </option>
                <option value="CH">
                  CH {countryCountsData?.getInstrumentCountryCounts?.find(c => c.type === 'CH')?.count ? `(${countryCountsData.getInstrumentCountryCounts.find(c => c.type === 'CH').count})` : ''}
                </option>
                <option value="JP">
                  JP {countryCountsData?.getInstrumentCountryCounts?.find(c => c.type === 'JP')?.count ? `(${countryCountsData.getInstrumentCountryCounts.find(c => c.type === 'JP').count})` : ''}
                </option>
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
                    <option value="NYSE">
                      NYSE {exchangeCountsData?.getInstrumentExchangeCounts?.find(e => e.type === 'NYSE')?.count ? `(${exchangeCountsData.getInstrumentExchangeCounts.find(e => e.type === 'NYSE').count})` : ''}
                    </option>
                    <option value="NASDAQ">
                      NASDAQ {exchangeCountsData?.getInstrumentExchangeCounts?.find(e => e.type === 'NASDAQ')?.count ? `(${exchangeCountsData.getInstrumentExchangeCounts.find(e => e.type === 'NASDAQ').count})` : ''}
                    </option>
                    <option value="LSE">
                      LSE {exchangeCountsData?.getInstrumentExchangeCounts?.find(e => e.type === 'LSE')?.count ? `(${exchangeCountsData.getInstrumentExchangeCounts.find(e => e.type === 'LSE').count})` : ''}
                    </option>
                    <option value="TSE">
                      TSE {exchangeCountsData?.getInstrumentExchangeCounts?.find(e => e.type === 'TSE')?.count ? `(${exchangeCountsData.getInstrumentExchangeCounts.find(e => e.type === 'TSE').count})` : ''}
                    </option>
                    <option value="SIX">
                      SIX {exchangeCountsData?.getInstrumentExchangeCounts?.find(e => e.type === 'SIX')?.count ? `(${exchangeCountsData.getInstrumentExchangeCounts.find(e => e.type === 'SIX').count})` : ''}
                    </option>
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
                    <option value="Technology">
                      Technology {sectorCountsData?.getInstrumentSectorCounts?.find(s => s.type === 'Technology')?.count ? `(${sectorCountsData.getInstrumentSectorCounts.find(s => s.type === 'Technology').count})` : ''}
                    </option>
                    <option value="Finance">
                      Finance {sectorCountsData?.getInstrumentSectorCounts?.find(s => s.type === 'Finance')?.count ? `(${sectorCountsData.getInstrumentSectorCounts.find(s => s.type === 'Finance').count})` : ''}
                    </option>
                    <option value="Healthcare">
                      Healthcare {sectorCountsData?.getInstrumentSectorCounts?.find(s => s.type === 'Healthcare')?.count ? `(${sectorCountsData.getInstrumentSectorCounts.find(s => s.type === 'Healthcare').count})` : ''}
                    </option>
                    <option value="Energy">
                      Energy {sectorCountsData?.getInstrumentSectorCounts?.find(s => s.type === 'Energy')?.count ? `(${sectorCountsData.getInstrumentSectorCounts.find(s => s.type === 'Energy').count})` : ''}
                    </option>
                    <option value="Retail">
                      Retail {sectorCountsData?.getInstrumentSectorCounts?.find(s => s.type === 'Retail')?.count ? `(${sectorCountsData.getInstrumentSectorCounts.find(s => s.type === 'Retail').count})` : ''}
                    </option>
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
