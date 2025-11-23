import React, { useState, useEffect, useCallback } from 'react';
import { filesApi } from '../services/api';
import FileCard from '../components/files/FileCard';
import FolderCard from '../components/files/FolderCard';
import Breadcrumb from '../components/files/Breadcrumb';
import FileUpload from '../components/files/FileUpload';
import CreateFolder from '../components/files/CreateFolder';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (currentFolder) params.folderId = currentFolder;
      if (searchQuery) params.search = searchQuery;

      const response = await filesApi.getAll(params);
      setFiles(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchQuery]);

  const fetchBreadcrumb = useCallback(async () => {
    if (!currentFolder) {
      setBreadcrumb([]);
      return;
    }
    try {
      const response = await filesApi.getPath(currentFolder);
      setBreadcrumb(response.data || []);
    } catch (err) {
      console.error('Error fetching breadcrumb:', err);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchFiles();
    fetchBreadcrumb();
  }, [fetchFiles, fetchBreadcrumb]);

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder.id);
    setSelectedFiles([]);
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (folderId) => {
    setCurrentFolder(folderId || null);
    setSelectedFiles([]);
  };

  const handleUpload = async (file) => {
    try {
      await filesApi.upload(file, currentFolder);
      fetchFiles();
      setShowUpload(false);
    } catch (err) {
      console.error('Error uploading:', err);
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      await filesApi.createFolder(name, currentFolder);
      fetchFiles();
      setShowCreateFolder(false);
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await filesApi.delete(id);
      fetchFiles();
      setSelectedFiles(prev => prev.filter(fId => fId !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleRename = async (id, newName) => {
    try {
      await filesApi.rename(id, newName);
      fetchFiles();
    } catch (err) {
      console.error('Error renaming:', err);
    }
  };

  const handleSelect = (id) => {
    setSelectedFiles(prev =>
      prev.includes(id)
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFiles();
  };

  const folders = files.filter(f => f.type === 'folder');
  const regularFiles = files.filter(f => f.type === 'file');

  return (
    <div className="files-page">
      <div className="files-header">
        <div className="files-header-left">
          <h1>My Drive</h1>
          <Breadcrumb
            items={breadcrumb}
            onNavigate={handleBreadcrumbClick}
          />
        </div>

        <div className="files-header-right">
          <form className="files-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search in Drive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
              </svg>
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="files-toolbar">
        <button className="toolbar-btn primary" onClick={() => setShowUpload(true)}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          Upload
        </button>
        <button className="toolbar-btn" onClick={() => setShowCreateFolder(true)}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/>
          </svg>
          New Folder
        </button>
        {selectedFiles.length > 0 && (
          <button className="toolbar-btn danger" onClick={() => selectedFiles.forEach(handleDelete)}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete ({selectedFiles.length})
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchFiles}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <h3>{searchQuery ? 'No files found' : 'This folder is empty'}</h3>
          <p>Upload files or create a new folder</p>
          <div className="empty-actions">
            <button onClick={() => setShowUpload(true)}>Upload Files</button>
            <button onClick={() => setShowCreateFolder(true)}>Create Folder</button>
          </div>
        </div>
      ) : (
        <div className={`files-content ${viewMode}`}>
          {folders.length > 0 && (
            <div className="files-section">
              <h3>Folders</h3>
              <div className={`files-grid ${viewMode}`}>
                {folders.map(folder => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onClick={() => handleFolderClick(folder)}
                    onDelete={() => handleDelete(folder.id)}
                    onRename={(name) => handleRename(folder.id, name)}
                    selected={selectedFiles.includes(folder.id)}
                    onSelect={() => handleSelect(folder.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}

          {regularFiles.length > 0 && (
            <div className="files-section">
              <h3>Files</h3>
              <div className={`files-grid ${viewMode}`}>
                {regularFiles.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDelete={() => handleDelete(file.id)}
                    onRename={(name) => handleRename(file.id, name)}
                    selected={selectedFiles.includes(file.id)}
                    onSelect={() => handleSelect(file.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <FileUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}

      {showCreateFolder && (
        <CreateFolder
          onClose={() => setShowCreateFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  );
};

export default Files;
