const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Item API functions
export const itemsApi = {
  // Get all items
  getAll: () => apiRequest('/items'),

  // Get single item by ID
  getById: (id) => apiRequest(`/items/${id}`),

  // Create new item
  create: (itemData) => apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),

  // Update item
  update: (id, itemData) => apiRequest(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  }),

  // Delete item
  delete: (id) => apiRequest(`/items/${id}`, {
    method: 'DELETE',
  }),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default itemsApi;
