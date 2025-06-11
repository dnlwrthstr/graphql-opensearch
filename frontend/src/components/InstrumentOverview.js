import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

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

// GraphQL query for getting instrument sector counts
const GET_INSTRUMENT_SECTOR_COUNTS = gql`
  query GetInstrumentSectorCounts {
    getInstrumentSectorCounts {
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

// Colors for the donut charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FAACC5', '#F5A623'];

function InstrumentOverview() {
  // Query for instrument type values
  const { loading: loadingTypes, error: errorTypes, data: typeData } = useQuery(GET_INSTRUMENT_TYPE_COUNTS, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for instrument issuer values
  const { loading: loadingIssuers, error: errorIssuers, data: issuerData } = useQuery(GET_INSTRUMENT_ISSUER_COUNTS, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for instrument sector values
  const { loading: loadingSectors, error: errorSectors, data: sectorData } = useQuery(GET_INSTRUMENT_SECTOR_COUNTS, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Query for instrument country values
  const { loading: loadingCountries, error: errorCountries, data: countryData } = useQuery(GET_INSTRUMENT_COUNTRY_COUNTS, {
    fetchPolicy: "network-only" // Don't cache this query
  });

  // Custom tooltip for the donut charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${payload[0].name}: ${payload[0].value} instruments`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="partner-overview-container">
      <h2>Instrument Overview</h2>

      {/* Instrument Type Donut Chart */}
      <div className="chart-container">
        <h3>Instrument Type Distribution</h3>
        {loadingTypes && <p>Loading...</p>}
        {errorTypes && <p>Error loading instrument type data</p>}
        {typeData && typeData.getInstrumentTypeCounts && (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={typeData.getInstrumentTypeCounts}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value, percent }) => `${name}: ${value}`}
                outerRadius={65}
                innerRadius={35}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {typeData.getInstrumentTypeCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`Instrument Types`}
                  position="center"
                  fill="#333"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Instrument Issuer Donut Chart */}
      <div className="chart-container">
        <h3>Issuer Distribution</h3>
        {loadingIssuers && <p>Loading...</p>}
        {errorIssuers && <p>Error loading issuer data</p>}
        {issuerData && issuerData.getInstrumentIssuerCounts && (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={issuerData.getInstrumentIssuerCounts}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value, percent }) => `${name}: ${value}`}
                outerRadius={65}
                innerRadius={35}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {issuerData.getInstrumentIssuerCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`Issuers`}
                  position="center"
                  fill="#333"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Instrument Sector Donut Chart */}
      <div className="chart-container">
        <h3>Sector Distribution</h3>
        {loadingSectors && <p>Loading...</p>}
        {errorSectors && <p>Error loading sector data</p>}
        {sectorData && sectorData.getInstrumentSectorCounts && (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sectorData.getInstrumentSectorCounts}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value, percent }) => `${name}: ${value}`}
                outerRadius={65}
                innerRadius={35}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {sectorData.getInstrumentSectorCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`Sectors`}
                  position="center"
                  fill="#333"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Instrument Country Donut Chart */}
      <div className="chart-container">
        <h3>Country Distribution</h3>
        {loadingCountries && <p>Loading...</p>}
        {errorCountries && <p>Error loading country data</p>}
        {countryData && countryData.getInstrumentCountryCounts && (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={countryData.getInstrumentCountryCounts}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value, percent }) => `${name}: ${value}`}
                outerRadius={65}
                innerRadius={35}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {countryData.getInstrumentCountryCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`Countries`}
                  position="center"
                  fill="#333"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default InstrumentOverview;