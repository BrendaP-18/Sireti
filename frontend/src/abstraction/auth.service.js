// PAC - ABSTRACTION: Servicio de Autenticación
import api from './api';

export const authService = {
  login: (correo, password) => api.post('/auth/login', { correo, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export default authService;
