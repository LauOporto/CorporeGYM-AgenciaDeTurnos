import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.d';
import { authService, usuarioService } from '../services/usuario.service';
import { claseService } from '../services/clase.service';
import { BadRequestError } from '../utils/errors';

// ============================================================
// AuthController
// ============================================================
export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ ok: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ ok: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

// ============================================================
// UsuarioController
// ============================================================
export class UsuarioController {
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const usuario = await usuarioService.getById(id);
      res.status(200).json({ ok: true, data: usuario });
    } catch (err) {
      next(err);
    }
  }

  async getAllAlumnos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alumnos = await usuarioService.getAllAlumnos();
      res.status(200).json({ ok: true, data: alumnos });
    } catch (err) {
      next(err);
    }
  }

  async toggleCuota(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { cuota_al_dia } = req.body;
      if (typeof cuota_al_dia !== 'boolean') {
        throw new BadRequestError('El campo cuota_al_dia debe ser booleano.');
      }
      const usuario = await usuarioService.toggleCuota(id, cuota_al_dia);
      res.status(200).json({ ok: true, message: 'Estado de cuota actualizado.', data: usuario });
    } catch (err) {
      next(err);
    }
  }

  async declarePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user!.id; // token
      const usuario = await usuarioService.declararPago(usuarioId);
      res.status(200).json({ ok: true, message: 'Pago manual notificado correctamente. Pendiente de validación.', data: usuario });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const usuario = await usuarioService.update(id, req.body);
      res.status(200).json({ ok: true, data: usuario });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await usuarioService.delete(id);
      res.status(200).json({ ok: true, message: 'Usuario eliminado correctamente.' });
    } catch (err) {
      next(err);
    }
  }

  async getMisClases(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const clases = await claseService.getClasesDeUsuario(id);
      res.status(200).json({ ok: true, data: clases });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
export const usuarioController = new UsuarioController();
