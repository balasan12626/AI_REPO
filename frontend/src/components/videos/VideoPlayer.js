import React from 'react';

const VideoPlayer = ({ video, onClose, onReaction, relatedVideos, onVideoClick, formatViews }) => {
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
    <div className="video-player-page">
      <div className="video-player-main">
        <button className="back-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Videos
        </button>

        <div className="video-player-container">
          <iframe
            src={video.url}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="video-player-info">
          <h1 className="video-player-title">{video.title}</h1>

          <div className="video-player-stats">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{timeAgo(video.uploadedAt)}</span>
          </div>

          <div className="video-player-actions">
            <button className="action-btn like-btn" onClick={() => onReaction('like')}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
              </svg>
              <span>{formatViews(video.likes)}</span>
            </button>

            <button className="action-btn dislike-btn" onClick={() => onReaction('dislike')}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
              </svg>
              <span>{formatViews(video.dislikes)}</span>
            </button>

            <button className="action-btn share-btn">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>Share</span>
            </button>
          </div>

          <div className="video-player-channel">
            <div className="channel-avatar">
              {video.channel?.charAt(0) || 'V'}
            </div>
            <div className="channel-info">
              <h3>{video.channel}</h3>
              <p>1.2M subscribers</p>
            </div>
            <button className="subscribe-btn">Subscribe</button>
          </div>

          <div className="video-description">
            <p>{video.description}</p>
          </div>
        </div>
      </div>

      <div className="video-player-sidebar">
        <h3>Related Videos</h3>
        <div className="related-videos">
          {relatedVideos.map(v => (
            <div key={v.id} className="related-video-card" onClick={() => onVideoClick(v)}>
              <img src={v.thumbnail} alt={v.title} />
              <div className="related-video-info">
                <h4>{v.title}</h4>
                <p>{v.channel}</p>
                <p>{formatViews(v.views)} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
