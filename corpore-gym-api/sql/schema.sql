-- ============================================================
-- CORPORE GYM – Schema de Base de Datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS corpore_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE corpore_gym;

-- ============================================================
-- Tabla: usuarios
-- Almacena tanto alumnos como el profesor/admin (rol ENUM)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  rol         ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  telefono    VARCHAR(20)  NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: clases
-- Un registro por cada clase programada en el gimnasio
-- ============================================================
CREATE TABLE IF NOT EXISTS clases (
  id              INT          NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     TEXT         NULL,
  dia_semana      ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') NOT NULL,
  hora_inicio     TIME         NOT NULL,
  hora_fin        TIME         NOT NULL,
  cupo_maximo     INT          NOT NULL DEFAULT 10,
  cupos_ocupados  INT          NOT NULL DEFAULT 0,
  profesor_id     INT          NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_clases_profesor FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT chk_cupos CHECK (cupos_ocupados >= 0 AND cupos_ocupados <= cupo_maximo),
  CONSTRAINT chk_hora    CHECK (hora_fin > hora_inicio),
  INDEX idx_clases_dia (dia_semana),
  INDEX idx_clases_profesor (profesor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: inscripciones
-- Relación M:N entre usuarios y clases con estado
-- ============================================================
CREATE TABLE IF NOT EXISTS inscripciones (
  id          INT       NOT NULL AUTO_INCREMENT,
  usuario_id  INT       NOT NULL,
  clase_id    INT       NOT NULL,
  estado      ENUM('activa', 'cancelada') NOT NULL DEFAULT 'activa',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_insc_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_insc_clase   FOREIGN KEY (clase_id)   REFERENCES clases(id)   ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_clase (usuario_id, clase_id),
  INDEX idx_insc_usuario (usuario_id),
  INDEX idx_insc_clase   (clase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Tabla: asistencias
-- Registro de presencia por clase y por alumno
-- ============================================================
CREATE TABLE IF NOT EXISTS asistencias (
  id             INT       NOT NULL AUTO_INCREMENT,
  usuario_id     INT       NOT NULL,
  clase_id       INT       NOT NULL,
  presente       TINYINT(1) NOT NULL DEFAULT 0,
  registrado_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_asist_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_asist_clase   FOREIGN KEY (clase_id)   REFERENCES clases(id)   ON DELETE CASCADE,
  UNIQUE KEY uq_asistencia (usuario_id, clase_id),
  INDEX idx_asist_clase (clase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
