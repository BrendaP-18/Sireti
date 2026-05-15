// PAC - CONTROL: Controlador de Autenticación
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuariosModel = require('../abstraction/usuarios.model');

const AuthController = {
  login: async (req, res) => {
    try {
      const { correo, password } = req.body;
      if (!correo || !password)
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });

      const usuario = await UsuariosModel.getByCorreo(correo);
      if (!usuario)
        return res.status(401).json({ error: 'Credenciales incorrectas' });

      const valido = await bcrypt.compare(password, usuario.password);
      if (!valido)
        return res.status(401).json({ error: 'Credenciales incorrectas' });

      const token = jwt.sign(
        { id: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          area: usuario.area,
          rol: usuario.rol
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  register: async (req, res) => {
    try {
      const usuario = await UsuariosModel.create(req.body);
      res.status(201).json(usuario);
    } catch (err) {
      if (err.code === '23505')
        return res.status(400).json({ error: 'El correo ya está registrado' });
      res.status(500).json({ error: err.message });
    }
  },

  me: async (req, res) => {
    try {
      const usuario = await UsuariosModel.getById(req.user.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = AuthController;
