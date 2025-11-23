import React from 'react';

const ItemCard = ({ item, onEdit, onDelete, onToggleStatus }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`item-card ${item.status === 'completed' ? 'completed' : ''}`}>
      <div className="item-header">
        <h3 className="item-title">{item.title}</h3>
        <span className={`item-status ${getStatusClass(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
      </div>

      {item.description && (
        <p className="item-description">{item.description}</p>
      )}

      <div className="item-meta">
        <span className="item-date">Created: {formatDate(item.createdAt)}</span>
      </div>

      <div className="item-actions">
        <button
          className="btn btn-small btn-toggle"
          onClick={() => onToggleStatus(item)}
          title={item.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
        >
          {item.status === 'completed' ? 'Undo' : 'Complete'}
        </button>
        <button
          className="btn btn-small btn-edit"
          onClick={() => onEdit(item)}
        >
          Edit
        </button>
        <button
          className="btn btn-small btn-delete"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
