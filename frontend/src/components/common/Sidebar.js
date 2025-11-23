import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <Link to="/" className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Home</span>
        </Link>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Media</h3>
        <Link to="/videos" className={`sidebar-item ${isActive('/videos') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <span>Videos</span>
        </Link>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Storage</h3>
        <Link to="/files" className={`sidebar-item ${isActive('/files') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H5V4h14v16z"/>
          </svg>
          <span>My Drive</span>
        </Link>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section sidebar-storage">
        <div className="storage-info">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
          </svg>
          <span>Storage</span>
        </div>
        <div className="storage-bar">
          <div className="storage-used" style={{ width: '35%' }}></div>
        </div>
        <span className="storage-text">3.5 GB of 10 GB used</span>
      </div>
    </aside>
  );
};

export default Sidebar;
