// PAC - CONTROL: Controlador de Usuarios
const UsuariosModel = require('../abstraction/usuarios.model');

const UsuariosController = {
  getAll: async (req, res) => {
    try {
      const usuarios = await UsuariosModel.getAll();
      res.json(usuarios);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getById: async (req, res) => {
    try {
      const usuario = await UsuariosModel.getById(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  create: async (req, res) => {
    try {
      const usuario = await UsuariosModel.create(req.body);
      res.status(201).json(usuario);
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ error: 'Correo ya registrado' });
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const usuario = await UsuariosModel.update(req.params.id, req.body);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  delete: async (req, res) => {
    try {
      const result = await UsuariosModel.delete(req.params.id);
      res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
};

module.exports = UsuariosController;
