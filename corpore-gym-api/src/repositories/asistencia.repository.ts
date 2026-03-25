import pool from '../config/database';
import { Asistencia, RegistrarAsistenciaDTO } from '../models';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ============================================================
// AsistenciaRepository – Acceso a datos de `asistencias`
// ============================================================
export class AsistenciaRepository {
  async findByClase(clase_id: number): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT a.id, a.presente, a.registrado_at,
              u.id AS usuario_id, u.nombre, u.email
       FROM asistencias a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.clase_id = ?
       ORDER BY u.nombre ASC`,
      [clase_id]
    );
    return rows;
  }

  /** Upsert de asistencias: inserta o actualiza si ya existe */
  async upsertMany(
    clase_id: number,
    dto: RegistrarAsistenciaDTO
  ): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const item of dto.asistencias) {
        await conn.query<ResultSetHeader>(
          `INSERT INTO asistencias (usuario_id, clase_id, presente)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE presente = VALUES(presente), registrado_at = CURRENT_TIMESTAMP`,
          [item.usuario_id, clase_id, item.presente ? 1 : 0]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

export default new AsistenciaRepository();
