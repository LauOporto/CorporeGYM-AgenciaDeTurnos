import { Router } from 'express';
import { body } from 'express-validator';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate, isSelf, authorize } from '../middlewares/auth';
import { handleValidationErrors } from '../middlewares/errorHandler';

const router = Router();

// GET /users/admin/alumnos – listar todos los alumnos
router.get('/admin/alumnos', authenticate, authorize('admin'), usuarioController.getAllAlumnos.bind(usuarioController));

// PATCH /users/:id/cuota – cambiar estado de cuota
router.patch('/:id/cuota', authenticate, authorize('admin'), usuarioController.toggleCuota.bind(usuarioController));

// POST /users/self/pay - alumno notifica pago (Trust-based Option A)
router.post('/self/pay', authenticate, usuarioController.declarePayment.bind(usuarioController));

// GET /users/:id – ver perfil
router.get('/:id', authenticate, isSelf, usuarioController.getById.bind(usuarioController));

// GET /users/:id/classes – mis clases activas
router.get('/:id/classes', authenticate, isSelf, usuarioController.getMisClases.bind(usuarioController));

// PUT /users/:id – editar perfil
router.put(
  '/:id',
  authenticate,
  isSelf,
  [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('telefono').optional().isMobilePhone('any').withMessage('Teléfono inválido.'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres.'),
  ],
  handleValidationErrors,
  usuarioController.update.bind(usuarioController)
);

// DELETE /users/:id – eliminar cuenta
router.delete('/:id', authenticate, isSelf, usuarioController.delete.bind(usuarioController));

export default router;
