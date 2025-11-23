import React from 'react';

const Header = ({ itemCount }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">AI Task Manager</h1>
        <p className="header-subtitle">
          Manage your tasks efficiently | {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>
      </div>
    </header>
  );
};

export default Header;
