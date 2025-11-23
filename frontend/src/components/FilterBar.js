import React from 'react';

const FilterBar = ({ filter, setFilter, counts }) => {
  const filters = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'in-progress', label: 'In Progress', count: counts.inProgress },
    { value: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="filter-bar">
      {filters.map(f => (
        <button
          key={f.value}
          className={`filter-btn ${filter === f.value ? 'active' : ''}`}
          onClick={() => setFilter(f.value)}
        >
          {f.label}
          <span className="filter-count">{f.count}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
