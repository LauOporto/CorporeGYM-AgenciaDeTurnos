import { Request } from 'express';
import { JwtPayload } from '../models';

// Extiende el Request de Express para incluir el usuario autenticado
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
