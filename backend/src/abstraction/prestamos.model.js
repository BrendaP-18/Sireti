// PAC - ABSTRACTION: Modelo de Préstamos
const pool = require('./db');

const PrestamosModel = {
  getAll: async () => {
    const result = await pool.query(`
      SELECT p.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM prestamos p
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON p.id_equipo = e.id_equipo
      ORDER BY p.fecha DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(`
      SELECT p.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM prestamos p
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON p.id_equipo = e.id_equipo
      WHERE p.id_prestamo = $1
    `, [id]);
    return result.rows[0];
  },

  create: async ({ id_usuario, id_equipo, fecha, estado }) => {
    const result = await pool.query(
      'INSERT INTO prestamos (id_usuario, id_equipo, fecha, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, id_equipo, fecha || new Date(), estado || 'Activo']
    );
    return result.rows[0];
  },

  update: async (id, { estado }) => {
    const result = await pool.query(
      'UPDATE prestamos SET estado=$1 WHERE id_prestamo=$2 RETURNING *',
      [estado, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM prestamos WHERE id_prestamo = $1', [id]);
    return { message: 'Préstamo eliminado' };
  }
};

module.exports = PrestamosModel;
