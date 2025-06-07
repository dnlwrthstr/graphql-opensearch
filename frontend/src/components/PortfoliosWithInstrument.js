import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

// GraphQL query for autocomplete
const AUTOCOMPLETE_INSTRUMENT_NAME = gql`
  query AutocompleteInstrumentName($query: String!) {
    autocompleteInstrumentName(query: $query) {
      id
      name
      isin
      type
      currency
    }
  }
`;

// GraphQL query for portfolios by instrument
const GET_PORTFOLIOS_BY_INSTRUMENT = gql`
  query GetPortfoliosByInstrument($instrument_id: ID!) {
    getPortfoliosByInstrument(instrument_id: $instrument_id) {
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
          type
          currency
        }
      }
      partner {
        id
        name
        partner_type
        residency_country
        nationality
        created_at
      }
    }
  }
`;

function PortfoliosWithInstrument() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(null);
  const [lastSearched, setLastSearched] = useState('');
  const [expandedPortfolios, setExpandedPortfolios] = useState({});

  // Lazy query for autocomplete
  const [getAutocompleteSuggestions, { loading: autocompleteLoading, data: autocompleteData }] = useLazyQuery(
    AUTOCOMPLETE_INSTRUMENT_NAME,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data && data.autocompleteInstrumentName) {
          setSuggestions(data.autocompleteInstrumentName);
          setShowSuggestions(true);
        }
      }
    }
  );

  // Query for portfolios by instrument
  const [getPortfoliosByInstrument, { loading: portfoliosLoading, data: portfoliosData }] = useLazyQuery(
    GET_PORTFOLIOS_BY_INSTRUMENT,
    {
      fetchPolicy: 'network-only'
    }
  );

  // Debounce function for autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2 && searchTerm !== lastSearched) {
        getAutocompleteSuggestions({ variables: { query: searchTerm } });
        setLastSearched(searchTerm);
      } else if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, getAutocompleteSuggestions, lastSearched]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedInstrumentId(null); // Clear selected instrument when input changes
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setSelectedInstrumentId(suggestion.id);
    setLastSearched(suggestion.name); // Update lastSearched to prevent dropdown from reopening
    getPortfoliosByInstrument({ variables: { instrument_id: suggestion.id } });
  };

  const handleSearch = () => {
    // If there's a search term but no selected instrument, try searching by the term directly
    if (searchTerm && !selectedInstrumentId) {
      getPortfoliosByInstrument({ variables: { instrument_id: searchTerm } });
    } else if (selectedInstrumentId) {
      getPortfoliosByInstrument({ variables: { instrument_id: selectedInstrumentId } });
    }
  };

  const togglePortfolio = (portfolioId) => {
    setExpandedPortfolios(prev => ({
      ...prev,
      [portfolioId]: !prev[portfolioId]
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="portfolios-with-instrument-container">
      <h2>Portfolios with Instrument</h2>
      <div className="search-inputs">
        <div className="input-group">
          <label>Instrument Name or ISIN:</label>
          <div className="autocomplete-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchTerm) {
                  handleSearch();
                }
              }}
              placeholder="Start typing to search..."
              className="autocomplete-input"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item"
                  >
                    <div className="suggestion-name">{suggestion.name}</div>
                    <div className="suggestion-details">
                      ID: {suggestion.id} | ISIN: {suggestion.isin} | Type: {suggestion.type} | Currency: {suggestion.currency}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleSearch}
          className="search-button"
          disabled={!searchTerm}
        >
          Search
        </button>
        <p className="search-tip">
          Tip: You can search by instrument name, ISIN (e.g., US952911131), or select from suggestions.
        </p>
      </div>

      {autocompleteLoading && <p>Loading suggestions...</p>}
      {portfoliosLoading && <p>Loading portfolios...</p>}

      {portfoliosData && portfoliosData.getPortfoliosByInstrument && (
        <div className="portfolios-results">
          <h3>Portfolios containing this instrument</h3>
          {portfoliosData.getPortfoliosByInstrument.length === 0 ? (
            <p>No portfolios found containing this instrument</p>
          ) : (
            <div className="portfolios-list">
              {portfoliosData.getPortfoliosByInstrument.map(portfolio => (
                <div key={portfolio.id} className="portfolio-item">
                  <div 
                    className="portfolio-header" 
                    onClick={() => togglePortfolio(portfolio.id)}
                  >
                    <h4>{portfolio.name}</h4>
                    <div className="portfolio-summary">
                      <p>
                        Partner: {portfolio.partner ? portfolio.partner.name : 'Unknown'} | 
                        Currency: {portfolio.currency} | 
                        Created: {formatDate(portfolio.created_at)} | 
                        Positions: {portfolio.positions.length}
                      </p>
                    </div>
                    <span>{expandedPortfolios[portfolio.id] ? '▼' : '►'}</span>
                  </div>

                  {expandedPortfolios[portfolio.id] && (
                    <div className="portfolio-details">
                      <div className="partner-info">
                        <h5>Partner Information</h5>
                        {portfolio.partner ? (
                          <div>
                            <p>Name: {portfolio.partner.name}</p>
                            <p>Type: {portfolio.partner.partner_type}</p>
                            <p>Residency: {portfolio.partner.residency_country || 'N/A'}</p>
                            <p>Nationality: {portfolio.partner.nationality || 'N/A'}</p>
                            <p>Created: {formatDate(portfolio.partner.created_at)}</p>
                          </div>
                        ) : (
                          <p>Partner information not available</p>
                        )}
                      </div>

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
                              </tr>
                            </thead>
                            <tbody>
                              {portfolio.positions.map((position, index) => {
                                const instrument = position.instrument || {};
                                const isSelectedInstrument = position.instrument_id === selectedInstrumentId;
                                return (
                                  <tr key={index} className={isSelectedInstrument ? 'highlighted-position' : ''}>
                                    <td>{instrument.name || 'Unknown'}</td>
                                    <td>{instrument.isin || 'N/A'}</td>
                                    <td>{instrument.type || 'N/A'}</td>
                                    <td>{position.quantity ? position.quantity.toLocaleString() : 'N/A'}</td>
                                    <td>{position.market_value ? position.market_value.toLocaleString() : 'N/A'}</td>
                                    <td>{position.currency || 'N/A'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfoliosWithInstrument;
