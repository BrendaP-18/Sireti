// PAC - ABSTRACTION: Servicio de Equipos
import api from './api';
export const equiposService = {
  getAll:      ()             => api.get('/equipos'),
  getById:     (id)           => api.get(`/equipos/${id}`),
  create:      (data)         => api.post('/equipos', data),
  update:      (id, d)        => api.put(`/equipos/${id}`, d),
  delete:      (id)           => api.delete(`/equipos/${id}`),
  asignar:     (id, id_usuario) => api.post(`/equipos/${id}/asignar`, { id_usuario }),
  desasignar:  (id)           => api.post(`/equipos/${id}/desasignar`),
};
