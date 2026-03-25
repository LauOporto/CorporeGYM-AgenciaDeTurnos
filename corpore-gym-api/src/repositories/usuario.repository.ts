import pool from '../config/database';
import { Usuario, UsuarioPublico, RegisterDTO, UpdateUsuarioDTO } from '../models';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ============================================================
// UsuarioRepository – Acceso a datos de la tabla `usuarios`
// ============================================================
export class UsuarioRepository {
  async findById(id: number): Promise<UsuarioPublico | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, email, rol, telefono, cuota_al_dia, pago_pendiente, created_at, updated_at FROM usuarios WHERE id = ?',
      [id]
    );
    return (rows[0] as UsuarioPublico) ?? null;
  }

  async findAllAlumnos(): Promise<UsuarioPublico[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, email, rol, telefono, cuota_al_dia, pago_pendiente, created_at, updated_at FROM usuarios WHERE rol = "user" ORDER BY created_at DESC'
    );
    return rows as UsuarioPublico[];
  }

  async updateCuota(id: number, al_dia: boolean): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE usuarios SET cuota_al_dia = ?, pago_pendiente = false WHERE id = ?',
      [al_dia, id]
    );
    return result.affectedRows > 0;
  }

  async updatePagoPendiente(id: number, pendiente: boolean): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE usuarios SET pago_pendiente = ? WHERE id = ?',
      [pendiente, id]
    );
    return result.affectedRows > 0;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return (rows[0] as Usuario) ?? null;
  }

  async create(dto: RegisterDTO & { hashedPassword: string }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?)',
      [dto.nombre, dto.email, dto.hashedPassword, 'user', dto.telefono ?? null]
    );
    return result.insertId;
  }

  async update(id: number, dto: UpdateUsuarioDTO & { hashedPassword?: string }): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(dto.nombre);
    }
    if (dto.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(dto.telefono);
    }
    if (dto.hashedPassword !== undefined) {
      fields.push('password = ?');
      values.push(dto.hashedPassword);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new UsuarioRepository();
