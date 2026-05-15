// PAC - ABSTRACTION: Servicio de Mensajes
import api from './api';
export const mensajesService = {
  getAll:  (limit) => api.get(`/mensajes?limit=${limit||50}`),
  create:  (data)  => api.post('/mensajes', data),
  delete:  (id)    => api.delete(`/mensajes/${id}`),
};
