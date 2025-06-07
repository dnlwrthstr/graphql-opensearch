import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

function Navigation() {
  return (
    <nav className="main-navigation">
      <h2>Bank Data Search</h2>
      <ul className="nav-menu">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
          >
            Portfolio by Partner ID
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/simple-search" 
            className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
          >
            Simple Partner Search
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/advanced-search" 
            className={({ isActive }) => isActive ? "active-nav-link" : "nav-link"}
          >
            Advanced Partner Search
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
