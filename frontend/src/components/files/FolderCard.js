import React, { useState } from 'react';

const FolderCard = ({ folder, onClick, onDelete, onRename, selected, onSelect, viewMode }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== folder.name) {
      onRename(newName);
    }
    setIsRenaming(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  if (viewMode === 'list') {
    return (
      <div className={`file-row folder ${selected ? 'selected' : ''}`}>
        <div className="file-row-checkbox">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
          />
        </div>
        <div className="file-row-icon" onClick={onClick}>
          <svg viewBox="0 0 24 24" width="40" height="40">
            <path fill="#5F6368" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
        </div>
        <div className="file-row-name" onClick={onClick}>
          {isRenaming ? (
            <form onSubmit={handleRename}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          ) : (
            <span>{folder.name}</span>
          )}
        </div>
        <div className="file-row-size">--</div>
        <div className="file-row-date">
          {new Date(folder.createdAt).toLocaleDateString()}
        </div>
        <div className="file-row-actions">
          <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} title="Rename">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`folder-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <div className="folder-card-checkbox" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
        />
      </div>

      <div className="folder-card-icon">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="#5F6368" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
        </svg>
      </div>

      <div className="folder-card-name">
        {isRenaming ? (
          <form onSubmit={handleRename} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              autoFocus
            />
          </form>
        ) : (
          <span title={folder.name}>{folder.name}</span>
        )}
      </div>

      <div className="folder-card-actions" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setShowMenu(!showMenu)} title="More">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {showMenu && (
        <div className="file-context-menu" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { onClick(); setShowMenu(false); }}>Open</button>
          <button onClick={() => { setIsRenaming(true); setShowMenu(false); }}>Rename</button>
          <button onClick={onDelete} className="danger">Delete</button>
        </div>
      )}
    </div>
  );
};

export default FolderCard;
