import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import FilterBar from './components/FilterBar';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import { itemsApi } from './services/api';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itemsApi.getAll();
      setItems(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Create or update item
  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingItem) {
        const response = await itemsApi.update(editingItem.id, formData);
        setItems(prev =>
          prev.map(item =>
            item.id === editingItem.id ? response.data : item
          )
        );
        setEditingItem(null);
      } else {
        const response = await itemsApi.create(formData);
        setItems(prev => [...prev, response.data]);
      }
    } catch (err) {
      setError(err.message || 'Failed to save item');
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      setError(null);
      await itemsApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  // Toggle item status
  const handleToggleStatus = async (item) => {
    try {
      setError(null);
      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      const response = await itemsApi.update(item.id, { status: newStatus });
      setItems(prev =>
        prev.map(i => (i.id === item.id ? response.data : i))
      );
    } catch (err) {
      setError(err.message || 'Failed to update item status');
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Calculate counts for filter
  const counts = {
    all: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    inProgress: items.filter(i => i.status === 'in-progress').length,
    completed: items.filter(i => i.status === 'completed').length,
  };

  return (
    <div className="app">
      <Header itemCount={items.length} />

      <main className="main-content">
        <div className="container">
          <div className="content-grid">
            <aside className="sidebar">
              <ItemForm
                onSubmit={handleSubmit}
                editingItem={editingItem}
                onCancel={handleCancelEdit}
              />
            </aside>

            <section className="main-section">
              {error && (
                <ErrorMessage message={error} onRetry={fetchItems} />
              )}

              <FilterBar
                filter={filter}
                setFilter={setFilter}
                counts={counts}
              />

              {loading ? (
                <Loading />
              ) : (
                <ItemList
                  items={items}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  filter={filter}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>AI Full-Stack Application - Built with React &amp; Express</p>
      </footer>
    </div>
  );
}

export default App;
