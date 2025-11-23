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

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

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

// Videos API
export const videosApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/videos${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiRequest(`/videos/${id}`),

  create: (videoData) => apiRequest('/videos', {
    method: 'POST',
    body: JSON.stringify(videoData),
  }),

  update: (id, videoData) => apiRequest(`/videos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(videoData),
  }),

  delete: (id) => apiRequest(`/videos/${id}`, {
    method: 'DELETE',
  }),

  react: (id, type) => apiRequest(`/videos/${id}/reaction`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  }),

  getCategories: () => apiRequest('/videos/meta/categories'),
};

// Files API
export const filesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/files${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiRequest(`/files/${id}`),

  createFolder: (name, parentId) => apiRequest('/files/folder', {
    method: 'POST',
    body: JSON.stringify({ name, parentId }),
  }),

  upload: async (file, parentId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);

    return apiRequest('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  rename: (id, name) => apiRequest(`/files/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }),

  move: (id, parentId) => apiRequest(`/files/${id}/move`, {
    method: 'PUT',
    body: JSON.stringify({ parentId }),
  }),

  delete: (id) => apiRequest(`/files/${id}`, {
    method: 'DELETE',
  }),

  getPath: (id) => apiRequest(`/files/${id}/path`),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default { videosApi, filesApi, healthCheck };
