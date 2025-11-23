import React, { useState } from 'react';
import { filesApi } from '../../services/api';

const FileCard = ({ file, onDelete, onRename, selected, onSelect, viewMode }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [showMenu, setShowMenu] = useState(false);

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#EA4335" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      ),
      document: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#4285F4" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      ),
      spreadsheet: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#34A853" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm1 16H9v-2h6v2zm0-4H9v-2h6v2zm-4-5V3.5L16.5 9H11z"/>
        </svg>
      ),
      presentation: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#FBBC04" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 15l-4-4h3V9h2v4h3l-4 4zm3-8V3.5L18.5 9H13z"/>
        </svg>
      ),
      image: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#EA4335" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      ),
      video: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#EA4335" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
        </svg>
      ),
      audio: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#FBBC04" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      ),
      archive: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#5F6368" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
        </svg>
      ),
      code: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#4285F4" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      ),
      other: (
        <svg viewBox="0 0 24 24" width="40" height="40">
          <path fill="#5F6368" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
        </svg>
      )
    };
    return icons[fileType] || icons.other;
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== file.name) {
      onRename(newName);
    }
    setIsRenaming(false);
  };

  const handleDownload = async () => {
    try {
      // For S3 files, get signed URL
      if (file.s3Key) {
        const response = await filesApi.getDownloadUrl(file.id);
        if (response.success && response.data.url) {
          window.open(response.data.url, '_blank');
        }
      } else if (file.path) {
        // Fallback for local files or direct S3 URLs
        window.open(file.path, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className={`file-row ${selected ? 'selected' : ''}`}>
        <div className="file-row-checkbox">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
          />
        </div>
        <div className="file-row-icon">
          {getFileIcon(file.fileType)}
        </div>
        <div className="file-row-name">
          {isRenaming ? (
            <form onSubmit={handleRename}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                autoFocus
              />
            </form>
          ) : (
            <span>{file.name}</span>
          )}
        </div>
        <div className="file-row-size">{file.sizeFormatted || '-'}</div>
        <div className="file-row-date">
          {new Date(file.createdAt).toLocaleDateString()}
        </div>
        <div className="file-row-actions">
          <button onClick={handleDownload} title="Download">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
          <button onClick={() => setIsRenaming(true)} title="Rename">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button onClick={onDelete} title="Delete">
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
      className={`file-card ${selected ? 'selected' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(!showMenu);
      }}
    >
      <div className="file-card-checkbox">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
        />
      </div>

      <div className="file-card-icon">
        {getFileIcon(file.fileType)}
      </div>

      <div className="file-card-name">
        {isRenaming ? (
          <form onSubmit={handleRename}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              autoFocus
            />
          </form>
        ) : (
          <span title={file.name}>{file.name}</span>
        )}
      </div>

      <div className="file-card-meta">
        <span>{file.sizeFormatted}</span>
      </div>

      <div className="file-card-actions">
        <button onClick={handleDownload} title="Download">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <button onClick={() => setShowMenu(!showMenu)} title="More">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {showMenu && (
        <div className="file-context-menu">
          <button onClick={() => { setIsRenaming(true); setShowMenu(false); }}>
            Rename
          </button>
          <button onClick={handleDownload}>Download</button>
          <button onClick={onDelete} className="danger">Delete</button>
        </div>
      )}
    </div>
  );
};

export default FileCard;
