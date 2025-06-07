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

// GraphQL query for instrument details
const GET_FINANCIAL_INSTRUMENT = gql`
  query GetFinancialInstrument($id: ID!) {
    getFinancialInstrument(id: $id) {
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

function SimpleInstrumentSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(null);
  const [lastSearched, setLastSearched] = useState('');

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

  // Query for instrument details
  const [getInstrumentDetails, { loading: instrumentLoading, data: instrumentData }] = useLazyQuery(
    GET_FINANCIAL_INSTRUMENT,
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
    getInstrumentDetails({ variables: { id: suggestion.id } });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="instrument-search-container">
      <h2>Simple Instrument Search</h2>
      <div className="search-inputs">
        <div className="input-group">
          <label>Search by Name or ISIN:</label>
          <div className="autocomplete-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Enter instrument name or ISIN..."
              onFocus={() => searchTerm.length >= 2 && searchTerm !== lastSearched && setShowSuggestions(true)}
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
                      <span>ISIN: {suggestion.isin}</span>
                      {suggestion.type && <span>Type: {suggestion.type}</span>}
                      {suggestion.currency && <span>Currency: {suggestion.currency}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {autocompleteLoading && <div className="loading-indicator">Loading suggestions...</div>}
          </div>
        </div>
      </div>

      {instrumentLoading && <p>Loading instrument data...</p>}

      {instrumentData && instrumentData.getFinancialInstrument && (
        <div className="instrument-details">
          <h3>{instrumentData.getFinancialInstrument.name}</h3>
          <div className="instrument-info">
            <div className="info-section">
              <h4>Basic Information</h4>
              <p><strong>ID:</strong> {instrumentData.getFinancialInstrument.id}</p>
              <p><strong>ISIN:</strong> {instrumentData.getFinancialInstrument.isin}</p>
              <p><strong>Type:</strong> {instrumentData.getFinancialInstrument.type}</p>
              <p><strong>Issuer:</strong> {instrumentData.getFinancialInstrument.issuer}</p>
              <p><strong>Country:</strong> {instrumentData.getFinancialInstrument.country}</p>
              <p><strong>Currency:</strong> {instrumentData.getFinancialInstrument.currency}</p>
            </div>

            <div className="info-section">
              <h4>Dates</h4>
              <p><strong>Issue Date:</strong> {formatDate(instrumentData.getFinancialInstrument.issue_date)}</p>
              <p><strong>Maturity Date:</strong> {formatDate(instrumentData.getFinancialInstrument.maturity_date)}</p>
            </div>

            <div className="info-section">
              <h4>Market Information</h4>
              <p><strong>Rating:</strong> {instrumentData.getFinancialInstrument.rating}</p>
              {instrumentData.getFinancialInstrument.exchange && 
                <p><strong>Exchange:</strong> {instrumentData.getFinancialInstrument.exchange}</p>}
              {instrumentData.getFinancialInstrument.sector && 
                <p><strong>Sector:</strong> {instrumentData.getFinancialInstrument.sector}</p>}
            </div>

            {/* Conditional sections based on instrument type */}
            {instrumentData.getFinancialInstrument.coupon !== null && (
              <div className="info-section">
                <h4>Bond Details</h4>
                <p><strong>Coupon:</strong> {instrumentData.getFinancialInstrument.coupon}%</p>
                {instrumentData.getFinancialInstrument.face_value && 
                  <p><strong>Face Value:</strong> {instrumentData.getFinancialInstrument.face_value}</p>}
              </div>
            )}

            {instrumentData.getFinancialInstrument.index_tracked && (
              <div className="info-section">
                <h4>ETF Details</h4>
                <p><strong>Index Tracked:</strong> {instrumentData.getFinancialInstrument.index_tracked}</p>
                {instrumentData.getFinancialInstrument.total_expense_ratio !== null && 
                  <p><strong>Total Expense Ratio:</strong> {instrumentData.getFinancialInstrument.total_expense_ratio}%</p>}
              </div>
            )}

            {instrumentData.getFinancialInstrument.underlyings && instrumentData.getFinancialInstrument.underlyings.length > 0 && (
              <div className="info-section">
                <h4>Structured Product Details</h4>
                <p><strong>Underlyings:</strong> {instrumentData.getFinancialInstrument.underlyings.join(', ')}</p>
                {instrumentData.getFinancialInstrument.barrier_level !== null && 
                  <p><strong>Barrier Level:</strong> {instrumentData.getFinancialInstrument.barrier_level}%</p>}
                {instrumentData.getFinancialInstrument.capital_protection !== null && 
                  <p><strong>Capital Protection:</strong> {instrumentData.getFinancialInstrument.capital_protection ? 'Yes' : 'No'}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleInstrumentSearch;
