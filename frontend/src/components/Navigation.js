import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeDropdown && !dropdownRefs.current[activeDropdown]?.contains(event.target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (item) => {
    setActiveDropdown(activeDropdown === item ? null : item);
  };

  // Close dropdown when a menu item is clicked
  const handleNavLinkClick = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="top-navigation">
      <ul className="top-nav-menu">
        <li className="top-menu-item" ref={el => dropdownRefs.current.partner = el}>
          <div 
            className={`top-menu-header ${activeDropdown === 'partner' ? 'active' : ''}`}
            onClick={() => toggleDropdown('partner')}
          >
            Partner
          </div>
          {activeDropdown === 'partner' && (
            <ul className="top-submenu">
              <li>
                <NavLink 
                  to="/partner-overview" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Overview
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/simple-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Search by Name
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/advanced-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Advanced Search
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li className="top-menu-item" ref={el => dropdownRefs.current.portfolio = el}>
          <div 
            className={`top-menu-header ${activeDropdown === 'portfolio' ? 'active' : ''}`}
            onClick={() => toggleDropdown('portfolio')}
          >
            Portfolio
          </div>
          {activeDropdown === 'portfolio' && (
            <ul className="top-submenu">
              <li>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/basic-view" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Basic View
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/portfolio-rest" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  REST API View
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/asset-classes" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Asset Classes
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Search by Partner ID
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/portfolios-with-instrument" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Search by Instrument
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li className="top-menu-item" ref={el => dropdownRefs.current.instrument = el}>
          <div 
            className={`top-menu-header ${activeDropdown === 'instrument' ? 'active' : ''}`}
            onClick={() => toggleDropdown('instrument')}
          >
            Instrument
          </div>
          {activeDropdown === 'instrument' && (
            <ul className="top-submenu">
              <li>
                <NavLink 
                  to="/instrument-overview" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Overview
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/simple-instrument-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
                >
                  Search by Name or ISIN
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/advanced-instrument-search" 
                  className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
                  onClick={handleNavLinkClick}
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
