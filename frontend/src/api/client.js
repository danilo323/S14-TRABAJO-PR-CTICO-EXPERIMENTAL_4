import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_STORAGE_KEY = 'taskflow_token';

/**
 * Cliente HTTP autenticado: adjunta automáticamente el JWT almacenado.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Cliente HTTP sin interceptor de token, útil para pruebas de acceso no autorizado.
 */
export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function extractErrorMessage(error, fallback = 'Ocurrió un error inesperado.') {
  return error?.response?.data?.message || error?.message || fallback;
}
