import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from 'recharts';

// GraphQL query for getting legal entity type values
const GET_LEGAL_ENTITY_TYPE_VALUES = gql`
  query GetLegalEntityTypeValues {
    getLegalEntityTypeValues {
      value
      count
    }
  }
`;

// GraphQL query for getting unique nationality values
const GET_UNIQUE_COUNTRY_VALUES = gql`
  query GetUniqueCountryValues($field: String!) {
    getUniqueCountryValues(field: $field) {
      value
      count
    }
  }
`;

// Colors for the donut charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FAACC5', '#F5A623'];

function PartnerOverview() {
  // Query for legal entity type values
  const { loading: loadingLegalEntityTypes, error: errorLegalEntityTypes, data: legalEntityTypeData } = useQuery(GET_LEGAL_ENTITY_TYPE_VALUES, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for nationality values
  const { loading: loadingNationalities, error: errorNationalities, data: nationalityData } = useQuery(GET_UNIQUE_COUNTRY_VALUES, {
    variables: { field: "nationality" },
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Custom tooltip for the donut charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${payload[0].name}: ${payload[0].value} partners`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="partner-overview-container">
      <h2>Partner Overview</h2>

      {/* Legal Entity Type Donut Chart */}
      <div className="chart-container">
        <h3>Legal Entity Type Distribution</h3>
        {loadingLegalEntityTypes && <p>Loading...</p>}
        {errorLegalEntityTypes && <p>Error loading legal entity type data</p>}
        {legalEntityTypeData && legalEntityTypeData.getLegalEntityTypeValues && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={legalEntityTypeData.getLegalEntityTypeValues}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={{
                  fontSize: 10,
                  fill: '#333',
                  position: 'outside'
                }}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
                nameKey="value"
              >
                {legalEntityTypeData.getLegalEntityTypeValues.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`${legalEntityTypeData.getLegalEntityTypeValues.reduce((sum, entry) => sum + entry.count, 0)} partners`}
                  position="center"
                  fill="#333"
                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ opacity: 0.7, paddingTop: 20 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Nationality Donut Chart */}
      <div className="chart-container">
        <h3>Nationality Distribution</h3>
        {loadingNationalities && <p>Loading...</p>}
        {errorNationalities && <p>Error loading nationality data</p>}
        {nationalityData && nationalityData.getUniqueCountryValues && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={nationalityData.getUniqueCountryValues}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={{
                  fontSize: 10,
                  fill: '#333',
                  position: 'outside'
                }}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
                nameKey="value"
              >
                {nationalityData.getUniqueCountryValues.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`${nationalityData.getUniqueCountryValues.reduce((sum, entry) => sum + entry.count, 0)} partners`}
                  position="center"
                  fill="#333"
                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ opacity: 0.7, paddingTop: 20 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default PartnerOverview;
