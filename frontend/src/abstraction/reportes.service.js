// PAC - ABSTRACTION: Servicio de Reportes Trabajador
import api from './api';
export const reportesService = {
  getAll:      (estado) => api.get(`/reportes${estado ? `?estado=${estado}` : ''}`),
  getMios:     ()       => api.get('/reportes/mis-reportes'),
  getStats:    ()       => api.get('/reportes/stats'),
  getById:     (id)     => api.get(`/reportes/${id}`),
  create:      (data)   => api.post('/reportes', data),
  update:      (id, d)  => api.put(`/reportes/${id}`, d),
  delete:      (id)     => api.delete(`/reportes/${id}`),
};
