import pool from '../config/database';
import { Inscripcion, UsuarioPublico } from '../models';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ============================================================
// InscripcionRepository – Acceso a datos de `inscripciones`
// ============================================================
export class InscripcionRepository {
  /** Busca si el usuario ya tiene una inscripción (activa o no) en esta clase */
  async findByUsuarioYClase(
    usuario_id: number,
    clase_id: number
  ): Promise<Inscripcion | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM inscripciones WHERE usuario_id = ? AND clase_id = ?',
      [usuario_id, clase_id]
    );
    return (rows[0] as Inscripcion) ?? null;
  }

  /** Verifica si el usuario ya tiene una inscripción ACTIVA en cualquier clase del mismo día */
  async findActivaEnFecha(
    usuario_id: number,
    dia_semana: string,
    excluirClaseId?: number
  ): Promise<Inscripcion | null> {
    let query = `
      SELECT i.* FROM inscripciones i
      JOIN clases c ON i.clase_id = c.id
      WHERE i.usuario_id = ?
        AND i.estado = 'activa'
        AND c.dia_semana = ?
    `;
    const params: (number | string)[] = [usuario_id, dia_semana];

    if (excluirClaseId !== undefined) {
      query += ' AND i.clase_id != ?';
      params.push(excluirClaseId);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return (rows[0] as Inscripcion) ?? null;
  }

  /** Crea nueva inscripción activa */
  async create(
    usuario_id: number,
    clase_id: number,
    conn: Awaited<ReturnType<typeof pool.getConnection>>
  ): Promise<number> {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO inscripciones (usuario_id, clase_id, estado)
       VALUES (?, ?, 'activa')
       ON DUPLICATE KEY UPDATE estado = 'activa'`,
      [usuario_id, clase_id]
    );
    return result.insertId;
  }

  /** Cancela una inscripción activa */
  async cancelar(
    usuario_id: number,
    clase_id: number,
    conn: Awaited<ReturnType<typeof pool.getConnection>>
  ): Promise<boolean> {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE inscripciones SET estado = 'cancelada'
       WHERE usuario_id = ? AND clase_id = ? AND estado = 'activa'`,
      [usuario_id, clase_id]
    );
    return result.affectedRows > 0;
  }

  /** Lista clases activas de un usuario */
  async findClasesByUsuario(usuario_id: number): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.nombre AS profesor_nombre,
              (c.cupo_maximo - c.cupos_ocupados) AS cupos_disponibles,
              i.estado AS estado_inscripcion
       FROM inscripciones i
       JOIN clases c ON i.clase_id = c.id
       JOIN usuarios u ON c.profesor_id = u.id
       WHERE i.usuario_id = ? AND i.estado = 'activa'
       ORDER BY FIELD(c.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'), c.hora_inicio ASC`,
      [usuario_id]
    );
    return rows;
  }

  /** Lista alumnos inscritos activos en una clase */
  async findAlumnosByClase(clase_id: number): Promise<UsuarioPublico[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.rol
       FROM inscripciones i
       JOIN usuarios u ON i.usuario_id = u.id
       WHERE i.clase_id = ? AND i.estado = 'activa'
       ORDER BY u.nombre ASC`,
      [clase_id]
    );
    return rows as UsuarioPublico[];
  }
}

export default new InscripcionRepository();
