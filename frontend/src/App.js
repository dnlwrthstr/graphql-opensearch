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
import PortfoliosWithInstrument from './components/PortfoliosWithInstrument';

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
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<PartnerPortfolioView />} />
              <Route path="/simple-search" element={<SimplePartnerSearch />} />
              <Route path="/advanced-search" element={<AdvancedPartnerSearch />} />
              <Route path="/simple-instrument-search" element={<SimpleInstrumentSearch />} />
              <Route path="/portfolios-with-instrument" element={<PortfoliosWithInstrument />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
