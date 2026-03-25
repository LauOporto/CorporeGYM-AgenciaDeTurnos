import pool from '../config/database';
import claseRepo from '../repositories/clase.repository';
import inscripcionRepo from '../repositories/inscripcion.repository';
import usuarioRepo from '../repositories/usuario.repository';
import { Clase, CreateClaseDTO, UpdateClaseDTO, MoverUsuarioDTO, RemoverUsuarioDTO } from '../models';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../utils/errors';

// ============================================================
// ClaseService – Lógica de negocio de clases e inscripciones
// ============================================================
export class ClaseService {
  async getAll(): Promise<Clase[]> {
    return claseRepo.findAll();
  }

  async getById(id: number): Promise<Clase> {
    const clase = await claseRepo.findById(id);
    if (!clase) throw new NotFoundError('Clase');
    return clase;
  }

  async create(dto: CreateClaseDTO): Promise<Clase> {
    // Validar que hora_fin > hora_inicio (doble check a nivel service)
    if (dto.hora_fin <= dto.hora_inicio) {
      throw new BadRequestError('La hora de fin debe ser posterior a la de inicio.');
    }
    const id = await claseRepo.create(dto);
    return this.getById(id);
  }

  async update(id: number, dto: UpdateClaseDTO): Promise<Clase> {
    const clase = await claseRepo.findById(id);
    if (!clase) throw new NotFoundError('Clase');

    if (dto.cupo_maximo !== undefined && dto.cupo_maximo < clase.cupos_ocupados) {
      throw new BadRequestError(
        `No se puede reducir el cupo a ${dto.cupo_maximo}: ya hay ${clase.cupos_ocupados} inscripciones activas.`
      );
    }
    await claseRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    const deleted = await claseRepo.delete(id);
    if (!deleted) throw new NotFoundError('Clase');
  }

  // --------------------------------------------------------
  // Inscripciones
  // --------------------------------------------------------

  async inscribir(usuario_id: number, clase_id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock FOR UPDATE para evitar race conditions
      const clase = await claseRepo.findByIdForUpdate(clase_id, conn);
      if (!clase) throw new NotFoundError('Clase');

      // Verificar cupo disponible
      if (clase.cupos_ocupados >= clase.cupo_maximo) {
        throw new ConflictError('La clase no tiene cupos disponibles.');
      }

      // Verificar que no esté ya inscripto activo en esta clase
      const inscripcionExistente = await inscripcionRepo.findByUsuarioYClase(usuario_id, clase_id);
      if (inscripcionExistente?.estado === 'activa') {
        throw new ConflictError('Ya estás inscripto en esta clase.');
      }

      // Verificar si la cuota está al día
      const usuario = await usuarioRepo.findById(usuario_id);
      if (!usuario?.cuota_al_dia) {
        throw new ConflictError('No podés inscribirte. Tenés que tener la cuota al día, podés pagarla desde tu perfil.');
      }

      // Verificar regla de 1 clase por día
      const inscripcionDelDia = await inscripcionRepo.findActivaEnFecha(usuario_id, clase.dia_semana);
      if (inscripcionDelDia) {
        throw new ConflictError('Ya tenés una clase reservada para ese día. Solo podés inscribirte en una clase por día.');
      }

      // Crear inscripción e incrementar cupo
      await inscripcionRepo.create(usuario_id, clase_id, conn);
      await claseRepo.incrementarCupo(clase_id, conn);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async cancelarInscripcion(usuario_id: number, clase_id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const cancelada = await inscripcionRepo.cancelar(usuario_id, clase_id, conn);
      if (!cancelada) {
        throw new BadRequestError('No tenés una inscripción activa en esta clase.');
      }

      await claseRepo.decrementarCupo(clase_id, conn);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getClasesDeUsuario(usuario_id: number): Promise<unknown[]> {
    return inscripcionRepo.findClasesByUsuario(usuario_id);
  }

  // --------------------------------------------------------
  // Administración (solo admin)
  // --------------------------------------------------------

  async removerAlumno(clase_id: number, dto: RemoverUsuarioDTO): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const cancelada = await inscripcionRepo.cancelar(dto.usuario_id, clase_id, conn);
      if (!cancelada) {
        throw new BadRequestError('El usuario no tiene inscripción activa en esta clase.');
      }

      await claseRepo.decrementarCupo(clase_id, conn);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async moverAlumno(clase_id: number, dto: MoverUsuarioDTO): Promise<void> {
    if (clase_id === dto.nueva_clase_id) {
      throw new BadRequestError('La clase de origen y destino son iguales.');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock ambas clases en orden de ID para evitar deadlock
      const [idMin, idMax] = [clase_id, dto.nueva_clase_id].sort((a, b) => a - b);
      const claseA = await claseRepo.findByIdForUpdate(idMin, conn);
      const claseB = await claseRepo.findByIdForUpdate(idMax, conn);

      const claseOrigen = claseA?.id === clase_id ? claseA : claseB;
      const claseDestino = claseA?.id === dto.nueva_clase_id ? claseA : claseB;

      if (!claseOrigen) throw new NotFoundError('Clase de origen');
      if (!claseDestino) throw new NotFoundError('Clase de destino');

      // Verificar cupo en destino
      if (claseDestino.cupos_ocupados >= claseDestino.cupo_maximo) {
        throw new ConflictError('La clase destino no tiene cupos disponibles.');
      }

      // Verificar que el usuario esté inscripto en la clase origen
      const inscripcionOrigen = await inscripcionRepo.findByUsuarioYClase(dto.usuario_id, clase_id);
      if (!inscripcionOrigen || inscripcionOrigen.estado !== 'activa') {
        throw new BadRequestError('El usuario no está inscripto en la clase de origen.');
      }

      // Verificar que no esté ya inscripto en la clase destino
      const inscripcionDestino = await inscripcionRepo.findByUsuarioYClase(dto.usuario_id, dto.nueva_clase_id);
      if (inscripcionDestino?.estado === 'activa') {
        throw new ConflictError('El usuario ya está inscripto en la clase destino.');
      }

      // Verificar regla 1 clase por día (excluyendo la clase origen)
      const inscripcionDelDia = await inscripcionRepo.findActivaEnFecha(
        dto.usuario_id,
        claseDestino.dia_semana,
        clase_id
      );
      if (inscripcionDelDia) {
        throw new ConflictError('El usuario ya tiene otra clase en la misma fecha que la clase destino.');
      }

      // Cancelar en origen
      await inscripcionRepo.cancelar(dto.usuario_id, clase_id, conn);
      await claseRepo.decrementarCupo(clase_id, conn);

      // Inscribir en destino
      await inscripcionRepo.create(dto.usuario_id, dto.nueva_clase_id, conn);
      await claseRepo.incrementarCupo(dto.nueva_clase_id, conn);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getAlumnosByClase(clase_id: number): Promise<unknown[]> {
    const clase = await claseRepo.findById(clase_id);
    if (!clase) throw new NotFoundError('Clase');
    return inscripcionRepo.findAlumnosByClase(clase_id);
  }
}

export const claseService = new ClaseService();
