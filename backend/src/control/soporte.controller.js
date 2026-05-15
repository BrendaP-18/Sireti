// PAC - CONTROL: Controlador de Soporte Técnico
const SoporteModel = require('../abstraction/soporte.model');

const SoporteController = {
  getAll: async (req, res) => {
    try {
      const reportes = await SoporteModel.getAll();
      res.json(reportes);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getById: async (req, res) => {
    try {
      const reporte = await SoporteModel.getById(req.params.id);
      if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
      res.json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getRecientes: async (req, res) => {
    try {
      const reportes = await SoporteModel.getRecientes(req.query.limit || 5);
      res.json(reportes);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getStats: async (req, res) => {
    try {
      const [count, porEstado] = await Promise.all([
        SoporteModel.count(),
        SoporteModel.countByEstado()
      ]);
      res.json({ total: count, porEstado });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, id_usuario: req.body.id_usuario || req.user.id };
      const reporte = await SoporteModel.create(data);
      res.status(201).json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  update: async (req, res) => {
    try {
      const reporte = await SoporteModel.update(req.params.id, req.body);
      if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
      res.json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  delete: async (req, res) => {
    try {
      const result = await SoporteModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = SoporteController;
