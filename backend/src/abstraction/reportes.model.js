// PAC - ABSTRACTION: Modelo de Reportes de Trabajador
const pool = require('./db');

const ReportesModel = {
  getAll: async () => {
    const result = await pool.query(`
      SELECT r.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM reportes_trabajador r
      LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON r.id_equipo = e.id_equipo
      ORDER BY r.fecha DESC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(`
      SELECT r.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM reportes_trabajador r
      LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON r.id_equipo = e.id_equipo
      WHERE r.id_reporte_trabajador = $1
    `, [id]);
    return result.rows[0];
  },

  getByUsuario: async (id_usuario) => {
    const result = await pool.query(`
      SELECT r.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM reportes_trabajador r
      LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON r.id_equipo = e.id_equipo
      WHERE r.id_usuario = $1
      ORDER BY r.fecha DESC
    `, [id_usuario]);
    return result.rows;
  },

  getByEstado: async (estado) => {
    const result = await pool.query(`
      SELECT r.*, u.nombre AS nombre_usuario, e.nombre AS nombre_equipo
      FROM reportes_trabajador r
      LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
      LEFT JOIN equipos e ON r.id_equipo = e.id_equipo
      WHERE r.estado = $1
      ORDER BY r.fecha DESC
    `, [estado]);
    return result.rows;
  },

  create: async ({ id_usuario, id_equipo, descripcion, estado }) => {
    const result = await pool.query(
      'INSERT INTO reportes_trabajador (id_usuario, id_equipo, descripcion, fecha, estado) VALUES ($1, $2, $3, NOW(), $4) RETURNING *',
      [id_usuario, id_equipo, descripcion, estado || 'Pendiente']
    );
    return result.rows[0];
  },

  update: async (id, { descripcion, estado }) => {
    const result = await pool.query(
      'UPDATE reportes_trabajador SET descripcion=$1, estado=$2 WHERE id_reporte_trabajador=$3 RETURNING *',
      [descripcion, estado, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM reportes_trabajador WHERE id_reporte_trabajador = $1', [id]);
    return { message: 'Reporte eliminado' };
  },

  countByEstado: async () => {
    const result = await pool.query(`
      SELECT estado, COUNT(*) as total FROM reportes_trabajador GROUP BY estado
    `);
    return result.rows;
  },

  count: async () => {
    const result = await pool.query('SELECT COUNT(*) FROM reportes_trabajador');
    return parseInt(result.rows[0].count);
  }
};

module.exports = ReportesModel;
