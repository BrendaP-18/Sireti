// PAC - CONTROL: Controlador de Reportes Trabajador
const ReportesModel = require('../abstraction/reportes.model');

const ReportesController = {
  getAll: async (req, res) => {
    try {
      let reportes;
      if (req.query.estado) {
        reportes = await ReportesModel.getByEstado(req.query.estado);
      } else {
        reportes = await ReportesModel.getAll();
      }
      res.json(reportes);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getById: async (req, res) => {
    try {
      const reporte = await ReportesModel.getById(req.params.id);
      if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
      res.json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getMios: async (req, res) => {
    try {
      const reportes = await ReportesModel.getByUsuario(req.user.id);
      res.json(reportes);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getStats: async (req, res) => {
    try {
      const [total, porEstado] = await Promise.all([
        ReportesModel.count(),
        ReportesModel.countByEstado()
      ]);
      res.json({ total, porEstado });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, id_usuario: req.body.id_usuario || req.user.id };
      const reporte = await ReportesModel.create(data);
      res.status(201).json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  update: async (req, res) => {
    try {
      const reporte = await ReportesModel.update(req.params.id, req.body);
      if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
      res.json(reporte);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  delete: async (req, res) => {
    try {
      const result = await ReportesModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = ReportesController;
