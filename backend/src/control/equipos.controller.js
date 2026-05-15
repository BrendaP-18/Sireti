// PAC - CONTROL: Controlador de Equipos con roles
const EquiposModel = require('../abstraction/equipos.model');

const EquiposController = {
  // Admin: todos los equipos. Trabajador: solo sus equipos
  getAll: async (req, res) => {
    try {
      let equipos;
      if (req.user.rol === 'trabajador') {
        equipos = await EquiposModel.getByTrabajador(req.user.id);
      } else {
        equipos = await EquiposModel.getAll();
      }
      res.json(equipos);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getById: async (req, res) => {
    try {
      const equipo = await EquiposModel.getById(req.params.id);
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json(equipo);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  // Solo admin puede crear
  create: async (req, res) => {
    try {
      if (req.user.rol === 'trabajador')
        return res.status(403).json({ error: 'No tienes permiso para crear equipos' });
      const equipo = await EquiposModel.create(req.body);
      res.status(201).json(equipo);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  // Solo admin puede editar
  update: async (req, res) => {
    try {
      if (req.user.rol === 'trabajador')
        return res.status(403).json({ error: 'No tienes permiso para editar equipos' });
      const equipo = await EquiposModel.update(req.params.id, req.body);
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json(equipo);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  // Solo admin puede eliminar
  delete: async (req, res) => {
    try {
      if (req.user.rol === 'trabajador')
        return res.status(403).json({ error: 'No tienes permiso para eliminar equipos' });
      const result = await EquiposModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  // Asignar equipo a trabajador (solo admin)
  asignar: async (req, res) => {
    try {
      if (req.user.rol === 'trabajador')
        return res.status(403).json({ error: 'No tienes permiso' });
      const { id_usuario } = req.body;
      const result = await EquiposModel.asignar(req.params.id, id_usuario);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  // Desasignar equipo (solo admin)
  desasignar: async (req, res) => {
    try {
      if (req.user.rol === 'trabajador')
        return res.status(403).json({ error: 'No tienes permiso' });
      const result = await EquiposModel.desasignar(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = EquiposController;
