-- ============================================================
-- CORPORE GYM – Datos Iniciales (Seed)
-- Usuario administrador/profesor por defecto
-- Password: Admin123! (hasheada con bcrypt saltRounds=12)
-- ============================================================

USE corpore_gym;

INSERT INTO usuarios (nombre, email, password, rol, telefono)
VALUES (
  'Profesor Admin',
  'admin@corporegym.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU4a53pD9N3BQWBO',
  'admin',
  '+54 11 0000-0000'
);

-- Clase de ejemplo para el día siguiente
INSERT INTO clases (nombre, descripcion, fecha, hora_inicio, hora_fin, cupo_maximo, profesor_id)
VALUES (
  'Pilates Matutino',
  'Clase de pilates nivel inicial. Apta para todos los niveles.',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  '09:00:00',
  '10:00:00',
  10,
  1
),
(
  'Pilates Avanzado',
  'Clase de pilates nivel avanzado. Requiere experiencia previa.',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  '11:00:00',
  '12:00:00',
  8,
  1
);
