import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/usuario.controller';
import { handleValidationErrors } from '../middlewares/errorHandler';

const router = Router();

// POST /auth/register
router.post(
  '/register',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres.'),
    body('telefono').optional({ checkFalsy: true }).isMobilePhone('any').withMessage('Teléfono inválido.'),
  ],
  handleValidationErrors,
  authController.register.bind(authController)
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es requerida.'),
  ],
  handleValidationErrors,
  authController.login.bind(authController)
);

export default router;
