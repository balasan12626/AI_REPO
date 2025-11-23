import React, { useState, useEffect, useCallback } from 'react';
import { videosApi } from '../services/api';
import VideoCard from '../components/videos/VideoCard';
import VideoPlayer from '../components/videos/VideoPlayer';
import VideoUpload from '../components/videos/VideoUpload';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

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

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'all') params.category = category;
      if (searchQuery) params.search = searchQuery;

      const response = await videosApi.getAll(params);
      setVideos(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
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
      console.error('Error loading video:', err);
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
      console.error('Error reacting:', err);
    }
  };

  const handleUpload = async (videoData) => {
    try {
      const response = await videosApi.create(videoData);
      setVideos(prev => [response.data, ...prev]);
      setShowUpload(false);
    } catch (err) {
      console.error('Error uploading:', err);
    }
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
        relatedVideos={videos.filter(v => v.id !== selectedVideo.id).slice(0, 5)}
        onVideoClick={handleVideoClick}
        formatViews={formatViews}
      />
    );
  }

  return (
    <div className="videos-page">
      <div className="videos-header">
        <h1>Video Library</h1>
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
          <button className="upload-btn" onClick={() => setShowUpload(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            Upload Video
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

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchVideos}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
          <h3>No videos found</h3>
          <p>Upload your first video or try a different search</p>
          <button onClick={() => setShowUpload(true)}>Upload Video</button>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => handleVideoClick(video)}
              formatViews={formatViews}
            />
          ))}
        </div>
      )}

      {showUpload && (
        <VideoUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          categories={categories.filter(c => c.id !== 'all')}
        />
      )}
    </div>
  );
};

export default Videos;
