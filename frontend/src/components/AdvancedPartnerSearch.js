import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for searching partners
const SEARCH_PARTNERS = gql`
  query SearchPartners($query: String, $id: ID) {
    searchPartners(query: $query, id: $id) {
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

// GraphQL query for getting unique country values
const GET_UNIQUE_COUNTRY_VALUES = gql`
  query GetUniqueCountryValues($field: String!, $filter: String) {
    getUniqueCountryValues(field: $field, filter: $filter) {
      value
      count
    }
  }
`;

function AdvancedPartnerSearch() {
  const [searchParams, setSearchParams] = useState({
    name: '*',
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
  const [searchId, setSearchId] = useState(null);

  // Query for search results
  const { loading, error, data } = useQuery(SEARCH_PARTNERS, {
    variables: { query: searchQuery, id: searchId },
    skip: !executeQuery
  });

  // Query for unique nationality values
  const { loading: loadingNationalities, error: errorNationalities, data: nationalityData, refetch: refetchNationalities } = useQuery(GET_UNIQUE_COUNTRY_VALUES, {
    variables: { 
      field: "nationality",
      filter: null
    },
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for unique residency_country values
  const { loading: loadingResidencies, error: errorResidencies, data: residencyData, refetch: refetchResidencies } = useQuery(GET_UNIQUE_COUNTRY_VALUES, {
    variables: { 
      field: "residency_country",
      filter: null
    },
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Ensure data is loaded on component mount
  useEffect(() => {
    refetchNationalities();
    refetchResidencies();
  }, []);

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
      // Skip the name field if it's empty (it will be treated as a wildcard)
      // Include both 'true' and 'false' values for boolean fields
      if ((value && (key !== 'name' || value.trim() !== '')) || value === 'false') {
        queryParts.push(`${key}:${value}`);
      }
    });

    const query = queryParts.join(' AND ');
    setSearchQuery(query);
    setSearchId(null);

    setExecuteQuery(true);
  };

  const handleReset = () => {
    setSearchParams({
      name: '*',
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
    setSearchQuery('');
    setSearchId(null);
    setExecuteQuery(false);
  };


  return (
    <div className="partner-portfolio-view-container">
      <h2>Advanced Partner Search</h2>
      <form onSubmit={handleSubmit}>
        <div className="search-inputs">
          {/* First row: name (make larger field), partner type, legal entity type */}
          <div className="search-row">
            <div className="input-group name-field">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                placeholder="Partner name (supports wildcards: *, ? and expressions: AND, OR, NOT)..."
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
          </div>

          {/* Second row: Nationality, Residence Country, PEP Flag */}
          <div className="search-row">
            <div className="input-group">
              <label>Nationality:</label>
              <select
                name="nationality"
                value={searchParams.nationality}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                {!loadingNationalities && !errorNationalities && nationalityData && nationalityData.getUniqueCountryValues && 
                  nationalityData.getUniqueCountryValues.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.value} ({country.count})
                    </option>
                  ))
                }
              </select>
              {loadingNationalities && <span className="loading-indicator">Loading...</span>}
              {errorNationalities && <span className="error-message">Error loading countries</span>}
            </div>

            <div className="input-group">
              <label>Residency Country:</label>
              <select
                name="residency_country"
                value={searchParams.residency_country}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                {!loadingResidencies && !errorResidencies && residencyData && residencyData.getUniqueCountryValues && 
                  residencyData.getUniqueCountryValues.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.value} ({country.count})
                    </option>
                  ))
                }
              </select>
              {loadingResidencies && <span className="loading-indicator">Loading...</span>}
              {errorResidencies && <span className="error-message">Error loading countries</span>}
            </div>

            <div className="input-group">
              <label>PEP Flag:</label>
              <select
                name="pep_flag"
                value={searchParams.pep_flag}
                onChange={handleInputChange}
              >
                <option value="">No Selection</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Third row: KYC Status, Sanction Screened, risk level */}
          <div className="search-row">
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
              <label>Sanctions Screened:</label>
              <select
                name="sanctions_screened"
                value={searchParams.sanctions_screened}
                onChange={handleInputChange}
              >
                <option value="">No Selection</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
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
          </div>

          {/* Fourth row: Account Type */}
          <div className="search-row">
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
          </div>
        </div>

        <div className="button-group">
          <button type="submit">Search</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <div className="results">
        <h3>Search Results {data && data.searchPartners ? `(${data.searchPartners.length} partners found)` : ''}</h3>

        <div className="partner-results-table-container">
          <table className="partner-results-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Legal Entity Type</th>
                <th>Residence</th>
                <th>Nationality</th>
                <th>KYC Status</th>
                <th>Risk Level</th>
                <th>Account Type</th>
                <th>PEP Flag</th>
                <th>Sanctions Screened</th>
                <th>Incorporation Date</th>
              </tr>
            </thead>
            <tbody>
              {data && data.searchPartners && data.searchPartners.length > 0 ? (
                data.searchPartners.map(partner => (
                  <tr key={partner.id}>
                    <td>{partner.name}</td>
                    <td>{partner.partner_type}</td>
                    <td>{partner.partner_type === 'individual' ? 'Individual' : (partner.legal_entity_type || '-')}</td>
                    <td>{partner.residency_country}</td>
                    <td>{partner.nationality || '-'}</td>
                    <td>{partner.kyc_status}</td>
                    <td>{partner.risk_level}</td>
                    <td>{partner.account_type}</td>
                    <td className={partner.pep_flag ? 'yes-value' : 'no-value'}>
                      {partner.pep_flag ? 'Yes' : 'No'}
                    </td>
                    <td className={partner.sanctions_screened ? 'yes-value' : 'no-value'}>
                      {partner.sanctions_screened ? 'Yes' : 'No'}
                    </td>
                    <td>{partner.incorporation_date || (partner.birth_date || '-')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{textAlign: 'center'}}>
                    {data && data.searchPartners && data.searchPartners.length === 0 
                      ? 'No partners found matching your criteria' 
                      : 'Use the search form above to find partners'}
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

export default AdvancedPartnerSearch;
