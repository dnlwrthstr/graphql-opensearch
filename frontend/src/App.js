import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Navigation from './components/Navigation';
import PartnerPortfolioView from './components/PartnerPortfolioView';
import SimplePartnerSearch from './components/SimplePartnerSearch';
import AdvancedPartnerSearch from './components/AdvancedPartnerSearch';
import SimpleInstrumentSearch from './components/SimpleInstrumentSearch';
import AdvancedInstrumentSearch from './components/AdvancedInstrumentSearch';
import PortfoliosWithInstrument from './components/PortfoliosWithInstrument';
import PartnerOverviewPage from './components/PartnerOverviewPage';
import InstrumentOverviewPage from './components/InstrumentOverviewPage';
import Dashboard from './components/Dashboard';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: '/graphql',  // Use relative URL for compatibility with Docker and local development
  cache: new InMemoryCache()
});

// Main App Component
function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <aside className="sidebar">
            <Navigation />
          </aside>
          <main>
            <Routes>
              <Route path="/" element={<PartnerPortfolioView />} />
              <Route path="/simple-search" element={<SimplePartnerSearch />} />
              <Route path="/advanced-search" element={<AdvancedPartnerSearch />} />
              <Route path="/simple-instrument-search" element={<SimpleInstrumentSearch />} />
              <Route path="/advanced-instrument-search" element={<AdvancedInstrumentSearch />} />
              <Route path="/portfolios-with-instrument" element={<PortfoliosWithInstrument />} />
              <Route path="/partner-overview" element={<PartnerOverviewPage />} />
              <Route path="/instrument-overview" element={<InstrumentOverviewPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
