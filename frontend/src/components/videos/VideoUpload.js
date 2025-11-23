import React, { useState, useEffect } from 'react';

const VideoUpload = ({ onClose, onSubmit, categories, editingVideo }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    category: 'other',
    duration: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingVideo) {
      setFormData({
        title: editingVideo.title || '',
        description: editingVideo.description || '',
        url: editingVideo.url || '',
        thumbnail: editingVideo.thumbnail || '',
        category: editingVideo.category || 'other',
        duration: editingVideo.duration || ''
      });
    }
  }, [editingVideo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        thumbnail: formData.thumbnail || `https://picsum.photos/seed/${Date.now()}/320/180`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editingVideo;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Video' : 'Add New Video'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              required
            />
          </div>

          <div className="form-group">
            <label>Video URL *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://youtube.com/embed/..."
              required
            />
            <small>Use embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)</small>
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="10:30"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter video description"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Video' : 'Create Video')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
