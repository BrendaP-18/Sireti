// PAC - ABSTRACTION: Cliente HTTP base (Axios)
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL });

// Inyectar token JWT en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sireti_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de respuesta: si 401/403, limpiar sesión
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('sireti_token');
      localStorage.removeItem('sireti_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
