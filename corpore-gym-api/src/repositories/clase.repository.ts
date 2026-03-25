import pool from '../config/database';
import { Clase, CreateClaseDTO, UpdateClaseDTO } from '../models';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ============================================================
// ClaseRepository – Acceso a datos de la tabla `clases`
// ============================================================
export class ClaseRepository {
  async findAll(): Promise<Clase[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.nombre AS profesor_nombre,
              (c.cupo_maximo - c.cupos_ocupados) AS cupos_disponibles
       FROM clases c
       JOIN usuarios u ON c.profesor_id = u.id
       ORDER BY FIELD(c.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'), c.hora_inicio ASC`
    );
    return rows as Clase[];
  }

  async findById(id: number): Promise<Clase | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.nombre AS profesor_nombre,
              (c.cupo_maximo - c.cupos_ocupados) AS cupos_disponibles
       FROM clases c
       JOIN usuarios u ON c.profesor_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return (rows[0] as Clase) ?? null;
  }

  async create(dto: CreateClaseDTO): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO clases (nombre, descripcion, dia_semana, hora_inicio, hora_fin, cupo_maximo, profesor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [dto.nombre, dto.descripcion ?? null, dto.dia_semana, dto.hora_inicio, dto.hora_fin, dto.cupo_maximo, dto.profesor_id]
    );
    return result.insertId;
  }

  async update(id: number, dto: UpdateClaseDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.nombre !== undefined)      { fields.push('nombre = ?');      values.push(dto.nombre); }
    if (dto.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(dto.descripcion); }
    if (dto.dia_semana !== undefined)       { fields.push('dia_semana = ?');       values.push(dto.dia_semana); }
    if (dto.hora_inicio !== undefined) { fields.push('hora_inicio = ?'); values.push(dto.hora_inicio); }
    if (dto.hora_fin !== undefined)    { fields.push('hora_fin = ?');    values.push(dto.hora_fin); }
    if (dto.cupo_maximo !== undefined) { fields.push('cupo_maximo = ?'); values.push(dto.cupo_maximo); }
    if (dto.profesor_id !== undefined) { fields.push('profesor_id = ?'); values.push(dto.profesor_id); }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE clases SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM clases WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /** Incrementa cupos_ocupados en 1 dentro de una transacción */
  async incrementarCupo(id: number, conn: Awaited<ReturnType<typeof pool.getConnection>>): Promise<void> {
    await conn.query(
      'UPDATE clases SET cupos_ocupados = cupos_ocupados + 1 WHERE id = ?',
      [id]
    );
  }

  /** Decrementa cupos_ocupados en 1 dentro de una transacción */
  async decrementarCupo(id: number, conn: Awaited<ReturnType<typeof pool.getConnection>>): Promise<void> {
    await conn.query(
      'UPDATE clases SET cupos_ocupados = GREATEST(cupos_ocupados - 1, 0) WHERE id = ?',
      [id]
    );
  }

  /** Lock FOR UPDATE para evitar race conditions en inscripciones */
  async findByIdForUpdate(id: number, conn: Awaited<ReturnType<typeof pool.getConnection>>): Promise<Clase | null> {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM clases WHERE id = ? FOR UPDATE',
      [id]
    );
    return (rows[0] as Clase) ?? null;
  }
}

export default new ClaseRepository();
