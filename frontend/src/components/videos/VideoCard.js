import React from 'react';

const VideoCard = ({ video, onClick, onEdit, onDelete, formatViews }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit && onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete && onDelete();
  };

  return (
    <div className="video-card" onClick={onClick}>
      <div className="video-thumbnail">
        <img src={video.thumbnail} alt={video.title} />
        <span className="video-duration">{video.duration}</span>
        <div className="video-card-actions">
          <button className="card-action-btn edit" onClick={handleEdit} title="Edit">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button className="card-action-btn delete" onClick={handleDelete} title="Delete">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="video-info">
        <div className="video-avatar">
          {video.channel?.charAt(0) || 'V'}
        </div>
        <div className="video-details">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-channel">{video.channel}</p>
          <p className="video-meta">
            {formatViews(video.views)} views • {timeAgo(video.uploadedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
