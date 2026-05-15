// PAC - ABSTRACTION: Modelo de Usuarios
const pool = require('./db');
const bcrypt = require('bcryptjs');

const UsuariosModel = {
  // Obtener todos los usuarios
  getAll: async () => {
    const result = await pool.query(
      'SELECT id_usuario, nombre, area, correo, rol FROM usuarios ORDER BY id_usuario'
    );
    return result.rows;
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT id_usuario, nombre, area, correo, rol FROM usuarios WHERE id_usuario = $1',
      [id]
    );
    return result.rows[0];
  },

  // Obtener usuario por correo (incluye password para autenticación)
  getByCorreo: async (correo) => {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );
    return result.rows[0];
  },

  // Crear usuario
  create: async ({ nombre, area, correo, password, rol }) => {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, area, correo, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, area, correo, rol',
      [nombre, area, correo, hash, rol || 'trabajador']
    );
    return result.rows[0];
  },

  // Actualizar usuario
  update: async (id, { nombre, area, correo, rol }) => {
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, area=$2, correo=$3, rol=$4 WHERE id_usuario=$5 RETURNING id_usuario, nombre, area, correo, rol',
      [nombre, area, correo, rol, id]
    );
    return result.rows[0];
  },

  // Eliminar usuario
  delete: async (id) => {
    await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
    return { message: 'Usuario eliminado' };
  },

  // Contar usuarios
  count: async () => {
    const result = await pool.query('SELECT COUNT(*) FROM usuarios');
    return parseInt(result.rows[0].count);
  }
};

module.exports = UsuariosModel;
