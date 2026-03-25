import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../types/express.d';
import { Rol } from '../models';

// ============================================================
// authenticate – verifica JWT en el header Authorization
// ============================================================
export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token de autenticación requerido.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Token inválido o expirado.'));
  }
}

// ============================================================
// authorize – verifica que el rol del usuario esté permitido
// Debe usarse DESPUÉS de authenticate
// ============================================================
export function authorize(...roles: Rol[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.rol)) {
      return next(new ForbiddenError());
    }
    next();
  };
}

// ============================================================
// isSelf – verifica que el usuario solo acceda a su propio recurso
// Los admins pueden acceder a cualquier recurso
// ============================================================
export function isSelf(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  const targetId = parseInt(req.params.id, 10);

  if (req.user.rol === 'admin' || req.user.id === targetId) {
    return next();
  }

  next(new ForbiddenError('Solo podés acceder a tu propio perfil.'));
}
