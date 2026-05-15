// PAC - CONTROL: Controlador de Calendario
const CalendarioModel = require('../abstraction/calendario.model');

const CalendarioController = {
  getAll: async (req, res) => {
    try {
      const eventos = await CalendarioModel.getAll();
      res.json(eventos);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getProximos: async (req, res) => {
    try {
      const eventos = await CalendarioModel.getProximos(req.query.limit || 5);
      res.json(eventos);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getById: async (req, res) => {
    try {
      const evento = await CalendarioModel.getById(req.params.id);
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  create: async (req, res) => {
    try {
      const evento = await CalendarioModel.create(req.body);
      res.status(201).json(evento);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  update: async (req, res) => {
    try {
      const evento = await CalendarioModel.update(req.params.id, req.body);
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  delete: async (req, res) => {
    try {
      const result = await CalendarioModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = CalendarioController;
