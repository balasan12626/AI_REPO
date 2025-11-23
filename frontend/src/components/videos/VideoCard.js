import React from 'react';

const VideoCard = ({ video, onClick, formatViews }) => {
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

  return (
    <div className="video-card" onClick={onClick}>
      <div className="video-thumbnail">
        <img src={video.thumbnail} alt={video.title} />
        <span className="video-duration">{video.duration}</span>
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
