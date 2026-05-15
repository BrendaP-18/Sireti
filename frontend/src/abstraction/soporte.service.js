// PAC - ABSTRACTION: Servicio de Soporte Técnico
import api from './api';
export const soporteService = {
  getAll:      ()       => api.get('/soporte'),
  getRecientes:(limit)  => api.get(`/soporte/recientes?limit=${limit||5}`),
  getStats:    ()       => api.get('/soporte/stats'),
  getById:     (id)     => api.get(`/soporte/${id}`),
  create:      (data)   => api.post('/soporte', data),
  update:      (id, d)  => api.put(`/soporte/${id}`, d),
  delete:      (id)     => api.delete(`/soporte/${id}`),
};
