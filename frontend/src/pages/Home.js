import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to AI MediaHub</h1>
          <p>Your all-in-one platform for videos and file management</p>
        </div>
      </section>

      <section className="features">
        <div className="feature-grid">
          <Link to="/videos" className="feature-card video-feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <h2>Video Library</h2>
            <p>Watch, upload, and manage your video content. YouTube-like experience with categories, search, and more.</p>
            <span className="feature-link">Browse Videos →</span>
          </Link>

          <Link to="/files" className="feature-card files-feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
              </svg>
            </div>
            <h2>File Manager</h2>
            <p>Store, organize, and access your files anywhere. Google Drive-like interface with folders and file types.</p>
            <span className="feature-link">Open Drive →</span>
          </Link>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <span className="stat-number">1000+</span>
          <span className="stat-label">Videos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">10GB</span>
          <span className="stat-label">Storage</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Access</span>
        </div>
      </section>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/videos" className="action-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            Watch Videos
          </Link>
          <Link to="/files" className="action-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Upload Files
          </Link>
          <Link to="/files" className="action-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            Create Folder
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
