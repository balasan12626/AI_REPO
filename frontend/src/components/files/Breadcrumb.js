import React from 'react';

const Breadcrumb = ({ items, onNavigate }) => {
  return (
    <div className="breadcrumb">
      <button
        className="breadcrumb-item"
        onClick={() => onNavigate(null)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        My Drive
      </button>

      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <span className="breadcrumb-separator">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </span>
          <button
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
