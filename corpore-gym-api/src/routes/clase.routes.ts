import { Router } from 'express';
import { body, param } from 'express-validator';
import { claseController } from '../controllers/clase.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { handleValidationErrors } from '../middlewares/errorHandler';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// --------------------------------------------------------
// CRUD de clases (solo admin)
// --------------------------------------------------------

// GET /classes
router.get('/', claseController.getAll.bind(claseController));

// GET /classes/:id
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido.')],
  handleValidationErrors,
  claseController.getById.bind(claseController)
);

// POST /classes (admin)
router.post(
  '/',
  authorize('admin'),
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido.'),
    body('dia_semana').isIn(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']).withMessage('Día de la semana inválido.'),
    body('hora_inicio').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_inicio inválida (HH:mm).'),
    body('hora_fin').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_fin inválida (HH:mm).'),
    body('cupo_maximo').isInt({ min: 1 }).withMessage('cupo_maximo debe ser un número positivo.'),
    body('profesor_id').isInt({ min: 1 }).withMessage('profesor_id inválido.'),
  ],
  handleValidationErrors,
  claseController.create.bind(claseController)
);

// PUT /classes/:id (admin)
router.put(
  '/:id',
  authorize('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
    body('nombre').optional().trim().notEmpty(),
    body('dia_semana').optional().isIn(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']).withMessage('Día de la semana inválido.'),
    body('hora_inicio').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_inicio inválida.'),
    body('hora_fin').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('hora_fin inválida.'),
    body('cupo_maximo').optional().isInt({ min: 1 }).withMessage('cupo_maximo inválido.'),
  ],
  handleValidationErrors,
  claseController.update.bind(claseController)
);

// DELETE /classes/:id (admin)
router.delete(
  '/:id',
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('ID inválido.')],
  handleValidationErrors,
  claseController.delete.bind(claseController)
);

// --------------------------------------------------------
// Inscripciones (usuario)
// --------------------------------------------------------

// POST /classes/:id/enroll
router.post(
  '/:id/enroll',
  [param('id').isInt({ min: 1 }).withMessage('ID de clase inválido.')],
  handleValidationErrors,
  claseController.enroll.bind(claseController)
);

// DELETE /classes/:id/enroll
router.delete(
  '/:id/enroll',
  [param('id').isInt({ min: 1 }).withMessage('ID de clase inválido.')],
  handleValidationErrors,
  claseController.cancelEnroll.bind(claseController)
);

// --------------------------------------------------------
// Asistencia (admin)
// --------------------------------------------------------

// GET /classes/:id/attendance
router.get(
  '/:id/attendance',
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('ID inválido.')],
  handleValidationErrors,
  claseController.getAsistencia.bind(claseController)
);

// POST /classes/:id/attendance
router.post(
  '/:id/attendance',
  authorize('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
    body('asistencias').isArray({ min: 1 }).withMessage('asistencias debe ser un arreglo no vacío.'),
    body('asistencias.*.usuario_id').isInt({ min: 1 }).withMessage('usuario_id inválido.'),
    body('asistencias.*.presente').isBoolean().withMessage('presente debe ser true o false.'),
  ],
  handleValidationErrors,
  claseController.registrarAsistencia.bind(claseController)
);

// --------------------------------------------------------
// Administración de alumnos (admin)
// --------------------------------------------------------

// GET /classes/:id/students
router.get(
  '/:id/students',
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('ID inválido.')],
  handleValidationErrors,
  claseController.getAlumnos.bind(claseController)
);

// PATCH /classes/:classId/move-user
router.patch(
  '/:classId/move-user',
  authorize('admin'),
  [
    param('classId').isInt({ min: 1 }).withMessage('classId inválido.'),
    body('usuario_id').isInt({ min: 1 }).withMessage('usuario_id inválido.'),
    body('nueva_clase_id').isInt({ min: 1 }).withMessage('nueva_clase_id inválido.'),
  ],
  handleValidationErrors,
  claseController.moverAlumno.bind(claseController)
);

// PATCH /classes/:classId/remove-user
router.patch(
  '/:classId/remove-user',
  authorize('admin'),
  [
    param('classId').isInt({ min: 1 }).withMessage('classId inválido.'),
    body('usuario_id').isInt({ min: 1 }).withMessage('usuario_id inválido.'),
  ],
  handleValidationErrors,
  claseController.removerAlumno.bind(claseController)
);

export default router;
