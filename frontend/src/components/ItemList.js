import React from 'react';
import ItemCard from './ItemCard';

const ItemList = ({ items, onEdit, onDelete, onToggleStatus, filter }) => {
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No items found</h3>
        <p>
          {filter === 'all'
            ? 'Add your first item using the form above!'
            : `No ${filter} items to display.`}
        </p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {filteredItems.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default ItemList;
