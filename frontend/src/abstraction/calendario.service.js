// PAC - ABSTRACTION: Servicio de Calendario
import api from './api';
export const calendarioService = {
  getAll:      ()       => api.get('/calendario'),
  getProximos: (limit)  => api.get(`/calendario/proximos?limit=${limit||5}`),
  getById:     (id)     => api.get(`/calendario/${id}`),
  create:      (data)   => api.post('/calendario', data),
  update:      (id, d)  => api.put(`/calendario/${id}`, d),
  delete:      (id)     => api.delete(`/calendario/${id}`),
};
