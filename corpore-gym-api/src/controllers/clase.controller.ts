import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.d';
import { claseService } from '../services/clase.service';
import { asistenciaService } from '../services/asistencia.service';

// ============================================================
// ClaseController
// ============================================================
export class ClaseController {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clases = await claseService.getAll();
      res.status(200).json({ ok: true, data: clases });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clase = await claseService.getById(parseInt(req.params.id, 10));
      res.status(200).json({ ok: true, data: clase });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clase = await claseService.create(req.body);
      res.status(201).json({ ok: true, data: clase });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clase = await claseService.update(parseInt(req.params.id, 10), req.body);
      res.status(200).json({ ok: true, data: clase });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await claseService.delete(parseInt(req.params.id, 10));
      res.status(200).json({ ok: true, message: 'Clase eliminada correctamente.' });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------
  // Inscripciones
  // --------------------------------------------------------

  async enroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clase_id = parseInt(req.params.id, 10);
      const usuario_id = req.user!.id;
      await claseService.inscribir(usuario_id, clase_id);
      res.status(201).json({ ok: true, message: 'Te inscribiste correctamente en la clase.' });
    } catch (err) {
      next(err);
    }
  }

  async cancelEnroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clase_id = parseInt(req.params.id, 10);
      const usuario_id = req.user!.id;
      await claseService.cancelarInscripcion(usuario_id, clase_id);
      res.status(200).json({ ok: true, message: 'Inscripción cancelada. El cupo fue liberado.' });
    } catch (err) {
      next(err);
    }
  }

  async getAlumnos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alumnos = await claseService.getAlumnosByClase(parseInt(req.params.id, 10));
      res.status(200).json({ ok: true, data: alumnos });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------
  // Asistencia
  // --------------------------------------------------------

  async registrarAsistencia(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await asistenciaService.registrar(parseInt(req.params.id, 10), req.body);
      res.status(200).json({ ok: true, message: 'Asistencia registrada correctamente.' });
    } catch (err) {
      next(err);
    }
  }

  async getAsistencia(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await asistenciaService.getByClase(parseInt(req.params.id, 10));
      res.status(200).json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  }

  // --------------------------------------------------------
  // Administración
  // --------------------------------------------------------

  async moverAlumno(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await claseService.moverAlumno(parseInt(req.params.classId, 10), req.body);
      res.status(200).json({ ok: true, message: 'Alumno movido a la nueva clase correctamente.' });
    } catch (err) {
      next(err);
    }
  }

  async removerAlumno(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await claseService.removerAlumno(parseInt(req.params.classId, 10), req.body);
      res.status(200).json({ ok: true, message: 'Alumno removido de la clase correctamente.' });
    } catch (err) {
      next(err);
    }
  }
}

export const claseController = new ClaseController();
