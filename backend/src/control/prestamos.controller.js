// PAC - CONTROL: Controlador de Préstamos
const PrestamosModel = require('../abstraction/prestamos.model');

const PrestamosController = {
  getAll: async (req, res) => {
    try {
      const prestamos = await PrestamosModel.getAll();
      res.json(prestamos);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getById: async (req, res) => {
    try {
      const prestamo = await PrestamosModel.getById(req.params.id);
      if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
      res.json(prestamo);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  create: async (req, res) => {
    try {
      const prestamo = await PrestamosModel.create(req.body);
      res.status(201).json(prestamo);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  update: async (req, res) => {
    try {
      const prestamo = await PrestamosModel.update(req.params.id, req.body);
      if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
      res.json(prestamo);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  delete: async (req, res) => {
    try {
      const result = await PrestamosModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = PrestamosController;
