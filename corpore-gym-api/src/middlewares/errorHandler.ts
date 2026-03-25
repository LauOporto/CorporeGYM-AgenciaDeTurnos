import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors';

// ============================================================
// Middleware global de manejo de errores
// Captura cualquier error lanzado en la cadena de middlewares
// ============================================================
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      message: err.message,
    });
    return;
  }

  // Error de MySQL: clave duplicada
  if ((err as NodeJS.ErrnoException).code === 'ER_DUP_ENTRY') {
    res.status(409).json({
      ok: false,
      message: 'Ya existe un registro con esos datos.',
    });
    return;
  }

  console.error('[ERROR NO CONTROLADO]', err);
  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor.',
  });
}

// ============================================================
// Middleware de validación de express-validator
// Debe usarse después de los validators en la ruta
// ============================================================
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      ok: false,
      message: 'Datos de entrada inválidos.',
      errors: errors.array().map((e) => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg,
      })),
    });
    return;
  }
  next();
}
