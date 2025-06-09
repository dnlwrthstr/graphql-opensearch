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

// GraphQL query for getting partner type values
const GET_PARTNER_TYPE_VALUES = gql`
  query GetPartnerTypeValues {
    getPartnerTypeValues {
      value
      count
    }
  }
`;

// GraphQL query for getting legal entity type values
const GET_LEGAL_ENTITY_TYPE_VALUES = gql`
  query GetLegalEntityTypeValues {
    getLegalEntityTypeValues {
      value
      count
    }
  }
`;

// GraphQL query for getting PEP flag values
const GET_PEP_FLAG_VALUES = gql`
  query GetPepFlagValues {
    getPepFlagValues {
      value
      count
    }
  }
`;

// GraphQL query for getting KYC status values
const GET_KYC_STATUS_VALUES = gql`
  query GetKycStatusValues {
    getKycStatusValues {
      value
      count
    }
  }
`;

// GraphQL query for getting sanctions screened values
const GET_SANCTIONS_SCREENED_VALUES = gql`
  query GetSanctionsScreenedValues {
    getSanctionsScreenedValues {
      value
      count
    }
  }
`;

// GraphQL query for getting risk level values
const GET_RISK_LEVEL_VALUES = gql`
  query GetRiskLevelValues {
    getRiskLevelValues {
      value
      count
    }
  }
`;

// GraphQL query for getting account type values
const GET_ACCOUNT_TYPE_VALUES = gql`
  query GetAccountTypeValues {
    getAccountTypeValues {
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

  // Query for partner type values
  const { loading: loadingPartnerTypes, error: errorPartnerTypes, data: partnerTypeData, refetch: refetchPartnerTypes } = useQuery(GET_PARTNER_TYPE_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for legal entity type values
  const { loading: loadingLegalEntityTypes, error: errorLegalEntityTypes, data: legalEntityTypeData, refetch: refetchLegalEntityTypes } = useQuery(GET_LEGAL_ENTITY_TYPE_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for PEP flag values
  const { loading: loadingPepFlags, error: errorPepFlags, data: pepFlagData, refetch: refetchPepFlags } = useQuery(GET_PEP_FLAG_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for KYC status values
  const { loading: loadingKycStatuses, error: errorKycStatuses, data: kycStatusData, refetch: refetchKycStatuses } = useQuery(GET_KYC_STATUS_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for sanctions screened values
  const { loading: loadingSanctionsScreened, error: errorSanctionsScreened, data: sanctionsScreenedData, refetch: refetchSanctionsScreened } = useQuery(GET_SANCTIONS_SCREENED_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for risk level values
  const { loading: loadingRiskLevels, error: errorRiskLevels, data: riskLevelData, refetch: refetchRiskLevels } = useQuery(GET_RISK_LEVEL_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for account type values
  const { loading: loadingAccountTypes, error: errorAccountTypes, data: accountTypeData, refetch: refetchAccountTypes } = useQuery(GET_ACCOUNT_TYPE_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Ensure data is loaded on component mount
  useEffect(() => {
    refetchNationalities();
    refetchResidencies();
    refetchPartnerTypes();
    refetchLegalEntityTypes();
    refetchPepFlags();
    refetchKycStatuses();
    refetchSanctionsScreened();
    refetchRiskLevels();
    refetchAccountTypes();
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
              {!loadingPartnerTypes && !errorPartnerTypes && partnerTypeData && partnerTypeData.getPartnerTypeValues && 
                (partnerTypeData.getPartnerTypeValues.length > 0 ? (
                  <select
                    name="partner_type"
                    value={searchParams.partner_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {partnerTypeData.getPartnerTypeValues.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.value} ({type.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  partnerTypeData.getPartnerTypeValues.map(type => (
                    <div key={type.value} className="static-value">
                      {type.value} ({type.count})
                    </div>
                  ))
                ))
              }
              {loadingPartnerTypes && <span className="loading-indicator">Loading...</span>}
              {errorPartnerTypes && <span className="error-message">Error loading partner types</span>}
            </div>

            <div className="input-group">
              <label>Legal Entity Type:</label>
              {!loadingLegalEntityTypes && !errorLegalEntityTypes && legalEntityTypeData && legalEntityTypeData.getLegalEntityTypeValues && 
                (legalEntityTypeData.getLegalEntityTypeValues.length > 0 ? (
                  <select
                    name="legal_entity_type"
                    value={searchParams.legal_entity_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {legalEntityTypeData.getLegalEntityTypeValues.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.value} ({type.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  legalEntityTypeData.getLegalEntityTypeValues.map(type => (
                    <div key={type.value} className="static-value">
                      {type.value} ({type.count})
                    </div>
                  ))
                ))
              }
              {loadingLegalEntityTypes && <span className="loading-indicator">Loading...</span>}
              {errorLegalEntityTypes && <span className="error-message">Error loading legal entity types</span>}
            </div>
          </div>

          {/* Second row: Nationality, Residence Country, PEP Flag */}
          <div className="search-row">
            <div className="input-group">
              <label>Nationality:</label>
              {!loadingNationalities && !errorNationalities && nationalityData && nationalityData.getUniqueCountryValues && 
                (nationalityData.getUniqueCountryValues.length > 0 ? (
                  <select
                    name="nationality"
                    value={searchParams.nationality}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {nationalityData.getUniqueCountryValues.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.value} ({country.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  nationalityData.getUniqueCountryValues.map(country => (
                    <div key={country.value} className="static-value">
                      {country.value} ({country.count})
                    </div>
                  ))
                ))
              }
              {loadingNationalities && <span className="loading-indicator">Loading...</span>}
              {errorNationalities && <span className="error-message">Error loading countries</span>}
            </div>

            <div className="input-group">
              <label>Residency Country:</label>
              {!loadingResidencies && !errorResidencies && residencyData && residencyData.getUniqueCountryValues && 
                (residencyData.getUniqueCountryValues.length > 0 ? (
                  <select
                    name="residency_country"
                    value={searchParams.residency_country}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {residencyData.getUniqueCountryValues.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.value} ({country.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  residencyData.getUniqueCountryValues.map(country => (
                    <div key={country.value} className="static-value">
                      {country.value} ({country.count})
                    </div>
                  ))
                ))
              }
              {loadingResidencies && <span className="loading-indicator">Loading...</span>}
              {errorResidencies && <span className="error-message">Error loading countries</span>}
            </div>

            <div className="input-group">
              <label>PEP Flag:</label>
              {!loadingPepFlags && !errorPepFlags && pepFlagData && pepFlagData.getPepFlagValues && 
                (() => {
                  // Count how many values have non-zero counts
                  const nonZeroValues = pepFlagData.getPepFlagValues.filter(flag => flag.count > 0);

                  // If there's only one value with non-zero count, display it as static text
                  if (nonZeroValues.length === 1) {
                    const flag = nonZeroValues[0];
                    return (
                      <div className="static-value">
                        {flag.value === "true" ? "Yes" : (flag.value === "false" ? "No" : "Unknown")} 
                        <span className="count-badge">{flag.count}</span>
                      </div>
                    );
                  } 
                  // Otherwise, display a dropdown
                  else {
                    return (
                      <select
                        name="pep_flag"
                        value={searchParams.pep_flag}
                        onChange={handleInputChange}
                      >
                        <option value="">No Selection</option>
                        {pepFlagData.getPepFlagValues.map(flag => (
                          <option key={flag.value} value={flag.value}>
                            {flag.value === "true" ? "Yes" : (flag.value === "false" ? "No" : "Unknown")} • {flag.count}
                          </option>
                        ))}
                      </select>
                    );
                  }
                })()
              }
              {loadingPepFlags && <span className="loading-indicator">Loading...</span>}
              {errorPepFlags && <span className="error-message">Error loading PEP flag values</span>}
            </div>
          </div>

          {/* Third row: KYC Status, Sanction Screened, risk level */}
          <div className="search-row">
            <div className="input-group">
              <label>KYC Status:</label>
              {!loadingKycStatuses && !errorKycStatuses && kycStatusData && kycStatusData.getKycStatusValues && 
                (kycStatusData.getKycStatusValues.length > 0 ? (
                  <select
                    name="kyc_status"
                    value={searchParams.kyc_status}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {kycStatusData.getKycStatusValues.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.value} ({status.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  kycStatusData.getKycStatusValues.map(status => (
                    <div key={status.value} className="static-value">
                      {status.value} ({status.count})
                    </div>
                  ))
                ))
              }
              {loadingKycStatuses && <span className="loading-indicator">Loading...</span>}
              {errorKycStatuses && <span className="error-message">Error loading KYC status values</span>}
            </div>

            <div className="input-group">
              <label>Sanctions Screened:</label>
              {!loadingSanctionsScreened && !errorSanctionsScreened && sanctionsScreenedData && sanctionsScreenedData.getSanctionsScreenedValues && 
                (() => {
                  // Count how many values have non-zero counts
                  const nonZeroValues = sanctionsScreenedData.getSanctionsScreenedValues.filter(status => status.count > 0);

                  // If there's only one value with non-zero count, display it as static text
                  if (nonZeroValues.length === 1) {
                    const status = nonZeroValues[0];
                    return (
                      <div className="static-value">
                        {status.value === "true" ? "Yes" : (status.value === "false" ? "No" : "Unknown")} 
                        <span className="count-badge">{status.count}</span>
                      </div>
                    );
                  } 
                  // Otherwise, display a dropdown
                  else {
                    return (
                      <select
                        name="sanctions_screened"
                        value={searchParams.sanctions_screened}
                        onChange={handleInputChange}
                      >
                        <option value="">No Selection</option>
                        {sanctionsScreenedData.getSanctionsScreenedValues.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.value === "true" ? "Yes" : (status.value === "false" ? "No" : "Unknown")} • {status.count}
                          </option>
                        ))}
                      </select>
                    );
                  }
                })()
              }
              {loadingSanctionsScreened && <span className="loading-indicator">Loading...</span>}
              {errorSanctionsScreened && <span className="error-message">Error loading sanctions screened values</span>}
            </div>

            <div className="input-group">
              <label>Risk Level:</label>
              {!loadingRiskLevels && !errorRiskLevels && riskLevelData && riskLevelData.getRiskLevelValues && 
                (riskLevelData.getRiskLevelValues.length > 0 ? (
                  <select
                    name="risk_level"
                    value={searchParams.risk_level}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {riskLevelData.getRiskLevelValues.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.value} ({level.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  riskLevelData.getRiskLevelValues.map(level => (
                    <div key={level.value} className="static-value">
                      {level.value} ({level.count})
                    </div>
                  ))
                ))
              }
              {loadingRiskLevels && <span className="loading-indicator">Loading...</span>}
              {errorRiskLevels && <span className="error-message">Error loading risk level values</span>}
            </div>
          </div>

          {/* Fourth row: Account Type */}
          <div className="search-row">
            <div className="input-group">
              <label>Account Type:</label>
              {!loadingAccountTypes && !errorAccountTypes && accountTypeData && accountTypeData.getAccountTypeValues && 
                (accountTypeData.getAccountTypeValues.length > 0 ? (
                  <select
                    name="account_type"
                    value={searchParams.account_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    {accountTypeData.getAccountTypeValues.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.value} ({type.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  accountTypeData.getAccountTypeValues.map(type => (
                    <div key={type.value} className="static-value">
                      {type.value} ({type.count})
                    </div>
                  ))
                ))
              }
              {loadingAccountTypes && <span className="loading-indicator">Loading...</span>}
              {errorAccountTypes && <span className="error-message">Error loading account type values</span>}
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
        <div className="partner-results-table-container">
          <table className="partner-results-table">
            <thead>
              <tr className="results-header">
                <th colSpan="11">Search Results {data && data.searchPartners ? `(${data.searchPartners.length} Partners found)` : ''}</th>
              </tr>
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
                    <td>{partner.legal_entity_type || (partner.partner_type === 'individual' ? 'unknown' : '-')}</td>
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
