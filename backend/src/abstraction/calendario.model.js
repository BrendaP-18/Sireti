// PAC - ABSTRACTION: Modelo de Calendario
const pool = require('./db');

const CalendarioModel = {
  getAll: async () => {
    const result = await pool.query(`
      SELECT c.*, e.nombre AS nombre_equipo
      FROM calendario c
      LEFT JOIN equipos e ON c.id_equipo = e.id_equipo
      ORDER BY c.fecha ASC
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(`
      SELECT c.*, e.nombre AS nombre_equipo
      FROM calendario c
      LEFT JOIN equipos e ON c.id_equipo = e.id_equipo
      WHERE c.id_actividad = $1
    `, [id]);
    return result.rows[0];
  },

  getProximos: async (limit = 5) => {
    const result = await pool.query(`
      SELECT c.*, e.nombre AS nombre_equipo
      FROM calendario c
      LEFT JOIN equipos e ON c.id_equipo = e.id_equipo
      WHERE c.fecha >= NOW()
      ORDER BY c.fecha ASC
      LIMIT $1
    `, [limit]);
    return result.rows;
  },

  create: async ({ id_equipo, descripcion, fecha }) => {
    const result = await pool.query(
      'INSERT INTO calendario (id_equipo, descripcion, fecha) VALUES ($1, $2, $3) RETURNING *',
      [id_equipo, descripcion, fecha]
    );
    return result.rows[0];
  },

  update: async (id, { id_equipo, descripcion, fecha }) => {
    const result = await pool.query(
      'UPDATE calendario SET id_equipo=$1, descripcion=$2, fecha=$3 WHERE id_actividad=$4 RETURNING *',
      [id_equipo, descripcion, fecha, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM calendario WHERE id_actividad = $1', [id]);
    return { message: 'Actividad eliminada' };
  },

  count: async () => {
    const result = await pool.query("SELECT COUNT(*) FROM calendario WHERE fecha >= NOW()");
    return parseInt(result.rows[0].count);
  }
};

module.exports = CalendarioModel;
