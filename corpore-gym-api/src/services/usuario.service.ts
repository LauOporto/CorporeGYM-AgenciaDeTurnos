import usuarioRepo from '../repositories/usuario.repository';
import { RegisterDTO, LoginDTO, UsuarioPublico, UpdateUsuarioDTO } from '../models';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { ConflictError, NotFoundError, UnauthorizedError, BadRequestError } from '../utils/errors';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// ============================================================
// AuthService – Registro y login
// ============================================================
export class AuthService {
  async register(dto: RegisterDTO): Promise<{ usuario: UsuarioPublico; token: string }> {
    const existe = await usuarioRepo.findByEmail(dto.email);
    if (existe) {
      throw new ConflictError('Ya existe un usuario registrado con ese email.');
    }

    const hashedPassword = await hashPassword(dto.password);
    const id = await usuarioRepo.create({ ...dto, hashedPassword });
    const usuario = await usuarioRepo.findById(id);

    if (!usuario) throw new Error('Error al crear usuario.');

    const token = generateToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });
    return { usuario, token };
  }

  async login(dto: LoginDTO): Promise<{ usuario: UsuarioPublico; token: string }> {
    const usuarioConPassword = await usuarioRepo.findByEmail(dto.email);
    if (!usuarioConPassword) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    const passwordOk = await comparePassword(dto.password, usuarioConPassword.password);
    if (!passwordOk) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    const { password: _, ...usuario } = usuarioConPassword;
    const token = generateToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });
    return { usuario, token };
  }
}

// ============================================================
// UsuarioService – CRUD de usuarios
// ============================================================
export class UsuarioService {
  async getById(id: number): Promise<UsuarioPublico> {
    const usuario = await usuarioRepo.findById(id);
    if (!usuario) throw new NotFoundError('Usuario');
    return usuario;
  }

  async getAllAlumnos(): Promise<UsuarioPublico[]> {
    return usuarioRepo.findAllAlumnos();
  }

  async toggleCuota(id: number, cuota_al_dia: boolean): Promise<UsuarioPublico> {
    const usuario = await usuarioRepo.findById(id);
    if (!usuario) throw new NotFoundError('Usuario');
    await usuarioRepo.updateCuota(id, cuota_al_dia);
    const updated = await usuarioRepo.findById(id);
    return updated!;
  }

  async declararPago(id: number): Promise<UsuarioPublico> {
    const usuario = await usuarioRepo.findById(id);
    if (!usuario) throw new NotFoundError('Usuario');
    await usuarioRepo.updatePagoPendiente(id, true);
    const updated = await usuarioRepo.findById(id);
    return updated!;
  }

  async update(id: number, dto: UpdateUsuarioDTO): Promise<UsuarioPublico> {
    const usuario = await usuarioRepo.findById(id);
    if (!usuario) throw new NotFoundError('Usuario');

    let hashedPassword: string | undefined;
    if (dto.password) {
      if (dto.password.length < 8) {
        throw new BadRequestError('La contraseña debe tener al menos 8 caracteres.');
      }
      hashedPassword = await hashPassword(dto.password);
    }

    await usuarioRepo.update(id, { ...dto, hashedPassword });
    const updated = await usuarioRepo.findById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    const usuario = await usuarioRepo.findById(id);
    if (!usuario) throw new NotFoundError('Usuario');

    // 1. Sweep active enrollments and decrement their class capacities
    const [inscripciones] = await pool.query<RowDataPacket[]>(
      'SELECT clase_id FROM inscripciones WHERE usuario_id = ? AND estado = "activa"',
      [id]
    );

    for (const ins of inscripciones) {
      await pool.query('UPDATE clases SET cupos_ocupados = GREATEST(0, cupos_ocupados - 1) WHERE id = ?', [ins.clase_id]);
    }

    // 2. Cascade delete
    const deleted = await usuarioRepo.delete(id);
    if (!deleted) throw new NotFoundError('Usuario');
  }
}

export const authService = new AuthService();
export const usuarioService = new UsuarioService();
