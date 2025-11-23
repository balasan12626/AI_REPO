import React, { useState, useEffect, useCallback } from 'react';
import { videosApi } from '../services/api';
import VideoCard from '../components/videos/VideoCard';
import VideoPlayer from '../components/videos/VideoPlayer';
import VideoUpload from '../components/videos/VideoUpload';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'music', name: 'Music' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'education', name: 'Education' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'sports', name: 'Sports' },
    { id: 'tech', name: 'Technology' },
    { id: 'news', name: 'News' },
  ];

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (category !== 'all') params.category = category;
      if (searchQuery) params.search = searchQuery;

      const response = await videosApi.getAll(params);
      setVideos(response.data || []);
    } catch (err) {
      setError('Failed to load videos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleVideoClick = async (video) => {
    try {
      const response = await videosApi.getById(video.id);
      setSelectedVideo(response.data);
    } catch (err) {
      setError('Error loading video: ' + err.message);
    }
  };

  const handleReaction = async (type) => {
    if (!selectedVideo) return;
    try {
      const response = await videosApi.react(selectedVideo.id, type);
      setSelectedVideo(response.data);
      setVideos(prev =>
        prev.map(v => v.id === selectedVideo.id ? response.data : v)
      );
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // CREATE - Add new video
  const handleCreate = async (videoData) => {
    try {
      setError(null);
      const response = await videosApi.create(videoData);
      setVideos(prev => [response.data, ...prev]);
      setShowUpload(false);
      showSuccessMessage('Video created successfully!');
    } catch (err) {
      setError('Failed to create video: ' + err.message);
    }
  };

  // UPDATE - Edit existing video
  const handleUpdate = async (videoData) => {
    try {
      setError(null);
      const response = await videosApi.update(editingVideo.id, videoData);
      setVideos(prev =>
        prev.map(v => v.id === editingVideo.id ? response.data : v)
      );
      setEditingVideo(null);
      setShowUpload(false);
      showSuccessMessage('Video updated successfully!');
    } catch (err) {
      setError('Failed to update video: ' + err.message);
    }
  };

  // DELETE - Remove video
  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      setError(null);
      await videosApi.delete(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      showSuccessMessage('Video deleted successfully!');
    } catch (err) {
      setError('Failed to delete video: ' + err.message);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowUpload(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos();
  };

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  if (selectedVideo) {
    return (
      <VideoPlayer
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onReaction={handleReaction}
        onDelete={() => {
          handleDelete(selectedVideo.id);
          setSelectedVideo(null);
        }}
        relatedVideos={videos.filter(v => v.id !== selectedVideo.id).slice(0, 5)}
        onVideoClick={handleVideoClick}
        formatViews={formatViews}
      />
    );
  }

  return (
    <div className="videos-page">
      {/* Success Message */}
      {success && (
        <div className="success-banner">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="videos-header">
        <div>
          <h1>Video Library</h1>
          <p className="subtitle">Total: {videos.length} videos</p>
        </div>
        <div className="videos-actions">
          <form className="videos-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <button className="upload-btn" onClick={() => { setEditingVideo(null); setShowUpload(true); }}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Video
          </button>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${category === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="#ccc" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
          <h3>No videos found</h3>
          <p>Upload your first video or try a different search</p>
          <button onClick={() => setShowUpload(true)}>Add Video</button>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => handleVideoClick(video)}
              onEdit={() => handleEdit(video)}
              onDelete={() => handleDelete(video.id)}
              formatViews={formatViews}
            />
          ))}
        </div>
      )}

      {showUpload && (
        <VideoUpload
          onClose={() => { setShowUpload(false); setEditingVideo(null); }}
          onSubmit={editingVideo ? handleUpdate : handleCreate}
          categories={categories.filter(c => c.id !== 'all')}
          editingVideo={editingVideo}
        />
      )}
    </div>
  );
};

export default Videos;
