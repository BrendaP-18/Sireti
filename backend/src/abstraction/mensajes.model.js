// PAC - ABSTRACTION: Modelo de Mensajes (Chat)
const pool = require('./db');

const MensajesModel = {
  getAll: async () => {
    const result = await pool.query(`
      SELECT m.*, u.nombre AS nombre_usuario
      FROM mensajes m
      LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
      ORDER BY m.fecha ASC
    `);
    return result.rows;
  },

  getRecientes: async (limit = 50) => {
    const result = await pool.query(`
      SELECT m.*, u.nombre AS nombre_usuario
      FROM mensajes m
      LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
      ORDER BY m.fecha DESC
      LIMIT $1
    `, [limit]);
    return result.rows.reverse();
  },

  create: async ({ id_usuario, contenido }) => {
    const result = await pool.query(
      'INSERT INTO mensajes (id_usuario, contenido, fecha) VALUES ($1, $2, NOW()) RETURNING *',
      [id_usuario, contenido]
    );
    const newMsg = await pool.query(`
      SELECT m.*, u.nombre AS nombre_usuario
      FROM mensajes m
      LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
      WHERE m.id_mensaje = $1
    `, [result.rows[0].id_mensaje]);
    return newMsg.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM mensajes WHERE id_mensaje = $1', [id]);
    return { message: 'Mensaje eliminado' };
  }
};

module.exports = MensajesModel;
