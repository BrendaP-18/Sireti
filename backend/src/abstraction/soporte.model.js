// PAC - ABSTRACTION: Modelo de Soporte Técnico
const pool = require('./db');

const SoporteModel = {
  getAll: async () => {
    const result = await pool.query(`
      SELECT s.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM soporte_tecnico s
      LEFT JOIN usuarios u ON s.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON s.id_equipo = e.id_equipo
      ORDER BY s.id_reporte DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(`
      SELECT s.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM soporte_tecnico s
      LEFT JOIN usuarios u ON s.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON s.id_equipo = e.id_equipo
      WHERE s.id_reporte = $1
    `, [id]);
    return result.rows[0];
  },

  getByUsuario: async (id_usuario) => {
    const result = await pool.query(`
      SELECT s.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM soporte_tecnico s
      LEFT JOIN usuarios u ON s.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON s.id_equipo = e.id_equipo
      WHERE s.id_usuario = $1
      ORDER BY s.id_reporte DESC
    `, [id_usuario]);
    return result.rows;
  },

  getRecientes: async (limit = 5) => {
    const result = await pool.query(`
      SELECT s.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM soporte_tecnico s
      LEFT JOIN usuarios u ON s.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON s.id_equipo = e.id_equipo
      ORDER BY s.id_reporte DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  },

  create: async ({ id_usuario, id_equipo, descripcion, estado }) => {
    const result = await pool.query(
      'INSERT INTO soporte_tecnico (id_usuario, id_equipo, descripcion, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, id_equipo, descripcion, estado || 'Pendiente']
    );
    return result.rows[0];
  },

  update: async (id, { descripcion, estado }) => {
    const result = await pool.query(
      'UPDATE soporte_tecnico SET descripcion=$1, estado=$2 WHERE id_reporte=$3 RETURNING *',
      [descripcion, estado, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM soporte_tecnico WHERE id_reporte = $1', [id]);
    return { message: 'Reporte eliminado' };
  },

  countByEstado: async () => {
    const result = await pool.query(`
      SELECT estado, COUNT(*) as total
      FROM soporte_tecnico
      GROUP BY estado
    `);
    return result.rows;
  },

  count: async () => {
    const result = await pool.query('SELECT COUNT(*) FROM soporte_tecnico');
    return parseInt(result.rows[0].count);
  }
};

module.exports = SoporteModel;
