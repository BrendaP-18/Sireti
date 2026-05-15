// PAC - ABSTRACTION: Modelo de Equipos con asignación de trabajador
const pool = require('./db');

const EquiposModel = {
  // Obtener todos los equipos con su trabajador asignado (si existe)
  getAll: async () => {
    const result = await pool.query(`
      SELECT
        e.*,
        u.nombre        AS nombre_trabajador,
        u.area          AS area_trabajador,
        u.id_usuario    AS id_trabajador,
        et.id_asignacion,
        et.fecha_asignacion,
        et.estado       AS estado_asignacion
      FROM equipos e
      LEFT JOIN equipos_trabajador et
        ON et.id_equipo = e.id_equipo
        AND et.estado = 'Activo'
      LEFT JOIN usuarios u ON et.id_usuario = u.id_usuario
      ORDER BY e.id_equipo
    `);
    return result.rows;
  },

  // Obtener equipos asignados a un trabajador específico
  getByTrabajador: async (id_usuario) => {
    const result = await pool.query(`
      SELECT
        e.*,
        u.nombre     AS nombre_trabajador,
        u.area       AS area_trabajador,
        et.id_asignacion,
        et.fecha_asignacion
      FROM equipos e
      INNER JOIN equipos_trabajador et ON et.id_equipo = e.id_equipo AND et.estado = 'Activo'
      INNER JOIN usuarios u ON et.id_usuario = u.id_usuario
      WHERE et.id_usuario = $1
      ORDER BY e.id_equipo
    `, [id_usuario]);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(`
      SELECT e.*, u.nombre AS nombre_trabajador, u.area AS area_trabajador, u.id_usuario AS id_trabajador
      FROM equipos e
      LEFT JOIN equipos_trabajador et ON et.id_equipo = e.id_equipo AND et.estado = 'Activo'
      LEFT JOIN usuarios u ON et.id_usuario = u.id_usuario
      WHERE e.id_equipo = $1
    `, [id]);
    return result.rows[0];
  },

  create: async ({ nombre, tipo, estado, procesador, almacenamiento }) => {
    const result = await pool.query(
      'INSERT INTO equipos (nombre, tipo, estado, procesador, almacenamiento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, tipo, estado || 'Disponible', procesador || null, almacenamiento || null]
    );
    return result.rows[0];
  },

  update: async (id, { nombre, tipo, estado, procesador, almacenamiento }) => {
    const result = await pool.query(
      'UPDATE equipos SET nombre=$1, tipo=$2, estado=$3, procesador=$4, almacenamiento=$5 WHERE id_equipo=$6 RETURNING *',
      [nombre, tipo, estado, procesador || null, almacenamiento || null, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM equipos WHERE id_equipo = $1', [id]);
    return { message: 'Equipo eliminado' };
  },

  // Asignar equipo a trabajador
  asignar: async (id_equipo, id_usuario) => {
    // Desactivar asignaciones previas del equipo
    await pool.query(
      "UPDATE equipos_trabajador SET estado='Inactivo' WHERE id_equipo=$1",
      [id_equipo]
    );
    // Crear nueva asignación
    const result = await pool.query(
      `INSERT INTO equipos_trabajador (id_usuario, id_equipo, fecha_asignacion, estado)
       VALUES ($1, $2, NOW(), 'Activo') RETURNING *`,
      [id_usuario, id_equipo]
    );
    // Actualizar estado del equipo
    await pool.query("UPDATE equipos SET estado='En uso' WHERE id_equipo=$1", [id_equipo]);
    return result.rows[0];
  },

  // Desasignar equipo
  desasignar: async (id_equipo) => {
    await pool.query(
      "UPDATE equipos_trabajador SET estado='Inactivo' WHERE id_equipo=$1",
      [id_equipo]
    );
    await pool.query("UPDATE equipos SET estado='Disponible' WHERE id_equipo=$1", [id_equipo]);
    return { message: 'Equipo desasignado' };
  },

  count: async () => {
    const result = await pool.query('SELECT COUNT(*) FROM equipos');
    return parseInt(result.rows[0].count);
  }
};

module.exports = EquiposModel;
