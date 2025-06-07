import React, { useState, useEffect } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';

// GraphQL query for searching partners
const SEARCH_PARTNERS = gql`
  query SearchPartners($query: String) {
    searchPartners(query: $query) {
      id
      partner_type
      name
      birth_date
      incorporation_date
      residency_country
      tax_id
      nationality
      legal_entity_type
      kyc_status
      risk_level
      account_type
      pep_flag
      sanctions_screened
      created_at
    }
  }
`;

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

function AdvancedPartnerSearch() {
  const [searchParams, setSearchParams] = useState({
    name: '',
    partner_id: '',
    partner_type: '',
    residency_country: '',
    nationality: '',
    legal_entity_type: '',
    kyc_status: '',
    risk_level: '',
    account_type: '',
    pep_flag: '',
    sanctions_screened: ''
  });

  const [executeQuery, setExecuteQuery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { loading, error, data } = useQuery(SEARCH_PARTNERS, {
    variables: { query: searchQuery },
    skip: !executeQuery
  });

  // Lazy query for autocomplete
  const [getAutocompleteSuggestions, { loading: autocompleteLoading, data: autocompleteData }] = useLazyQuery(
    AUTOCOMPLETE_PARTNER_NAME,
    {
      fetchPolicy: 'network-only', // Don't cache results
      onCompleted: (data) => {
        if (data && data.autocompletePartnerName) {
          setSuggestions(data.autocompletePartnerName);
          setShowSuggestions(true);
        }
      }
    }
  );

  // Debounce function for autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchParams.name && searchParams.name.length >= 2) {
        getAutocompleteSuggestions({ variables: { query: searchParams.name } });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchParams.name, getAutocompleteSuggestions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchParams({
      ...searchParams,
      name: suggestion.name,
      partner_id: suggestion.id
    });
    setShowSuggestions(false);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: checked ? 'true' : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build search query from non-empty parameters
    const queryParts = [];
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        // Map partner_id to id in the search query
        if (key === 'partner_id') {
          queryParts.push(`id:${value}`);
        } else {
          queryParts.push(`${key}:${value}`);
        }
      }
    });

    const query = queryParts.join(' AND ');
    setSearchQuery(query);
    setExecuteQuery(true);
  };

  const handleReset = () => {
    setSearchParams({
      name: '',
      partner_id: '',
      partner_type: '',
      residency_country: '',
      nationality: '',
      legal_entity_type: '',
      kyc_status: '',
      risk_level: '',
      account_type: '',
      pep_flag: '',
      sanctions_screened: ''
    });
    setExecuteQuery(false);
  };

  return (
    <div className="partner-portfolio-view-container">
      <h2>Advanced Partner Search</h2>
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          <div className="input-group">
            <label>Name:</label>
            <div className="autocomplete-container">
              <input
                type="text"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                placeholder="Partner name..."
                onFocus={() => searchParams.name.length >= 2 && setShowSuggestions(true)}
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

          <div className="input-group">
            <label>Partner ID:</label>
            <input
              type="text"
              name="partner_id"
              value={searchParams.partner_id}
              onChange={handleInputChange}
              placeholder="Partner ID..."
            />
          </div>

          <div className="input-group">
            <label>Partner Type:</label>
            <select
              name="partner_type"
              value={searchParams.partner_type}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="individual">Individual</option>
              <option value="entity">Entity</option>
            </select>
          </div>

          <div className="input-group">
            <label>Residency Country:</label>
            <input
              type="text"
              name="residency_country"
              value={searchParams.residency_country}
              onChange={handleInputChange}
              placeholder="Country code (e.g., US, UK, DE)..."
            />
          </div>

          <div className="input-group">
            <label>Nationality:</label>
            <input
              type="text"
              name="nationality"
              value={searchParams.nationality}
              onChange={handleInputChange}
              placeholder="Country code (e.g., US, UK, DE)..."
            />
          </div>

          <div className="input-group">
            <label>Legal Entity Type:</label>
            <select
              name="legal_entity_type"
              value={searchParams.legal_entity_type}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="individual">Individual</option>
              <option value="corporation">Corporation</option>
              <option value="trust">Trust</option>
              <option value="foundation">Foundation</option>
            </select>
          </div>

          <div className="input-group">
            <label>KYC Status:</label>
            <select
              name="kyc_status"
              value={searchParams.kyc_status}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="input-group">
            <label>Risk Level:</label>
            <select
              name="risk_level"
              value={searchParams.risk_level}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="input-group">
            <label>Account Type:</label>
            <select
              name="account_type"
              value={searchParams.account_type}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="retail">Retail</option>
              <option value="private">Private</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div className="input-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="pep_flag"
                checked={searchParams.pep_flag === 'true'}
                onChange={handleCheckboxChange}
              />
              PEP Flag
            </label>
          </div>

          <div className="input-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="sanctions_screened"
                checked={searchParams.sanctions_screened === 'true'}
                onChange={handleCheckboxChange}
              />
              Sanctions Screened
            </label>
          </div>
        </div>

        <div className="button-group">
          <button type="submit">Search</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && data.searchPartners && (
        <div className="results">
          <h3>Search Results</h3>
          {data.searchPartners.length === 0 ? (
            <p>No partners found matching your criteria</p>
          ) : (
            <ul>
              {data.searchPartners.map(partner => (
                <li key={partner.id}>
                  <h4>{partner.name}</h4>
                  <p>ID: {partner.id}</p>
                  <p>Type: {partner.partner_type}</p>
                  {partner.birth_date && <p>Birth Date: {partner.birth_date}</p>}
                  {partner.incorporation_date && <p>Incorporation Date: {partner.incorporation_date}</p>}
                  <p>Residency: {partner.residency_country}</p>
                  {partner.nationality && <p>Nationality: {partner.nationality}</p>}
                  {partner.legal_entity_type && <p>Legal Entity Type: {partner.legal_entity_type}</p>}
                  <p>KYC Status: {partner.kyc_status}</p>
                  <p>Risk Level: {partner.risk_level}</p>
                  <p>Account Type: {partner.account_type}</p>
                  <p>PEP Flag: {partner.pep_flag ? 'Yes' : 'No'}</p>
                  <p>Sanctions Screened: {partner.sanctions_screened ? 'Yes' : 'No'}</p>
                  <p>Created: {partner.created_at}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvancedPartnerSearch;
