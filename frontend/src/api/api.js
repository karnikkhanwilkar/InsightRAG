import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - sign out
      await supabase.auth.signOut();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

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

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const getCreditsHistory = async () => {
  const response = await api.get('/auth/credits-history');
  return response.data;
};

export default api;
