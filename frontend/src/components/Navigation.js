import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

function Navigation() {
  const [expandedItems, setExpandedItems] = useState({
    partner: true,
    portfolio: true,
    instrument: true
  });

  const toggleExpand = (item) => {
    setExpandedItems({
      ...expandedItems,
      [item]: !expandedItems[item]
    });
  };

  return (
    <nav>
      <h2>Navigation</h2>
      <ul className="nav-menu">
        <li className="menu-item">
          <div 
            className="menu-header" 
            onClick={() => toggleExpand('partner')}
          >
            Partner {expandedItems.partner ? '▼' : '►'}
          </div>
          {expandedItems.partner && (
            <ul className="submenu">
              <li>
                <NavLink 
                  to="/simple-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                >
                  Search by Name
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/advanced-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                >
                  Advanced Search
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li className="menu-item">
          <div 
            className="menu-header" 
            onClick={() => toggleExpand('portfolio')}
          >
            Portfolio {expandedItems.portfolio ? '▼' : '►'}
          </div>
          {expandedItems.portfolio && (
            <ul className="submenu">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                >
                  Search by Partner ID
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/portfolios-with-instrument" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                >
                  Search by Instrument
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li className="menu-item">
          <div 
            className="menu-header" 
            onClick={() => toggleExpand('instrument')}
          >
            Instrument {expandedItems.instrument ? '▼' : '►'}
          </div>
          {expandedItems.instrument && (
            <ul className="submenu">
              <li>
                <NavLink 
                  to="/simple-instrument-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                >
                  Search by Name or ISIN
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/advanced-instrument-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                >
                  Advanced Search
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
