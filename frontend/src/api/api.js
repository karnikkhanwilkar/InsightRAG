import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ingestDocument = async (file, text) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (text) {
    formData.append('text', text);
  }

  const response = await api.post('/ingest', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const queryRAG = async (query) => {
  const response = await api.post('/query', { question: query });
  return response.data;
};

export const getSources = async () => {
  const response = await api.get('/sources');
  return response.data;
};

export default api;
