// PAC - CONTROL: Controlador de Mensajes (Chat)
const MensajesModel = require('../abstraction/mensajes.model');

const MensajesController = {
  getAll: async (req, res) => {
    try {
      const mensajes = await MensajesModel.getRecientes(req.query.limit || 50);
      res.json(mensajes);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  create: async (req, res) => {
    try {
      const { contenido } = req.body;
      const id_usuario = req.user.id;
      const mensaje = await MensajesModel.create({ id_usuario, contenido });
      res.status(201).json(mensaje);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  delete: async (req, res) => {
    try {
      const result = await MensajesModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = MensajesController;
