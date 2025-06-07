import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

// GraphQL query for autocomplete
const AUTOCOMPLETE_PARTNER_NAME = gql`
  query AutocompletePartnerName($query: String!) {
    autocompletePartnerName(query: $query) {
      id
      name
      residency_country
      nationality
    }
  }
`;

// GraphQL query for partner with portfolios
const GET_PARTNER_WITH_PORTFOLIOS = gql`
  query GetPartnerWithPortfolios($id: ID!) {
    getPartner(id: $id) {
      id
      partner_type
      name
      residency_country
      nationality
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
            type
            currency
          }
        }
      }
    }
  }
`;

function SimplePartnerSearch() {
  const [partnerName, setPartnerName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [expandedPortfolios, setExpandedPortfolios] = useState({});

  // Lazy query for autocomplete
  const [getAutocompleteSuggestions, { loading: autocompleteLoading, data: autocompleteData }] = useLazyQuery(
    AUTOCOMPLETE_PARTNER_NAME,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data && data.autocompletePartnerName) {
          setSuggestions(data.autocompletePartnerName);
          setShowSuggestions(true);
        }
      }
    }
  );

  // Query for partner with portfolios
  const [getPartnerWithPortfolios, { loading: partnerLoading, data: partnerData }] = useLazyQuery(
    GET_PARTNER_WITH_PORTFOLIOS,
    {
      fetchPolicy: 'network-only'
    }
  );

  // Debounce function for autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (partnerName && partnerName.length >= 2) {
        getAutocompleteSuggestions({ variables: { query: partnerName } });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [partnerName, getAutocompleteSuggestions]);

  const handleInputChange = (e) => {
    setPartnerName(e.target.value);
    setSelectedPartnerId(null); // Clear selected partner when input changes
  };

  const handleSuggestionClick = (suggestion) => {
    setPartnerName(suggestion.name);
    setShowSuggestions(false);
    setSelectedPartnerId(suggestion.id);
    getPartnerWithPortfolios({ variables: { id: suggestion.id } });
  };

  const togglePortfolio = (portfolioId) => {
    setExpandedPortfolios(prev => ({
      ...prev,
      [portfolioId]: !prev[portfolioId]
    }));
  };

  return (
    <div className="partner-portfolio-view-container">
      <h2>Simple Partner Search</h2>
      <div className="search-inputs">
        <div className="input-group">
          <label>Partner Name:</label>
          <div className="autocomplete-container">
            <input
              type="text"
              value={partnerName}
              onChange={handleInputChange}
              placeholder="Enter partner name..."
              onFocus={() => partnerName.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-name">{suggestion.name}</div>
                    <div className="suggestion-details">
                      <span>ID: {suggestion.id}</span>
                      {suggestion.residency_country && <span>Residence: {suggestion.residency_country}</span>}
                      {suggestion.nationality && <span>Nationality: {suggestion.nationality}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {autocompleteLoading && <div className="loading-indicator">Loading suggestions...</div>}
          </div>
        </div>
      </div>

      {partnerLoading && <p>Loading partner data...</p>}

      {partnerData && partnerData.getPartner && (
        <div className="partner-portfolio-content">
          <div className="partner-info">
            <h3>{partnerData.getPartner.name}</h3>
            <p>Partner ID: {partnerData.getPartner.id} | Type: {partnerData.getPartner.partner_type}</p>
            {partnerData.getPartner.residency_country && <p>Residency: {partnerData.getPartner.residency_country}</p>}
            {partnerData.getPartner.nationality && <p>Nationality: {partnerData.getPartner.nationality}</p>}
            <p>Created: {partnerData.getPartner.created_at}</p>
          </div>

          <div className="portfolios-section">
            <h3>Portfolios</h3>
            {partnerData.getPartner.portfolios.length === 0 ? (
              <p>No portfolios found for this partner</p>
            ) : (
              <div className="portfolios-list">
                {partnerData.getPartner.portfolios.map(portfolio => (
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

export default SimplePartnerSearch;