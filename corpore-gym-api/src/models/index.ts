// ===============================================
// Modelos TypeScript – Entidades del dominio
// ===============================================

export type Rol = 'user' | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  telefono?: string | null;
  cuota_al_dia?: boolean;
  pago_pendiente?: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UsuarioPublico = Omit<Usuario, 'password'>;

// -----------------------------------------------

export type EstadoInscripcion = 'activa' | 'cancelada';

export interface Clase {
  id: number;
  nombre: string;
  descripcion?: string | null;
  dia_semana: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  hora_inicio: string;    // HH:mm:ss
  hora_fin: string;       // HH:mm:ss
  cupo_maximo: number;
  cupos_ocupados: number;
  cupos_disponibles?: number; // campo calculado
  profesor_id: number;
  profesor_nombre?: string;   // JOIN opcional
  created_at: Date;
  updated_at: Date;
}

export interface Inscripcion {
  id: number;
  usuario_id: number;
  clase_id: number;
  estado: EstadoInscripcion;
  created_at: Date;
}

export interface Asistencia {
  id: number;
  usuario_id: number;
  clase_id: number;
  presente: boolean;
  registrado_at: Date;
}

// -----------------------------------------------
// DTOs de Request / Response
// -----------------------------------------------

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateClaseDTO {
  nombre: string;
  descripcion?: string;
  dia_semana: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  profesor_id: number;
}

export type UpdateClaseDTO = Partial<CreateClaseDTO>;

export interface UpdateUsuarioDTO {
  nombre?: string;
  telefono?: string;
  password?: string;
}

export interface RegistrarAsistenciaDTO {
  asistencias: { usuario_id: number; presente: boolean }[];
}

export interface MoverUsuarioDTO {
  usuario_id: number;
  nueva_clase_id: number;
}

export interface RemoverUsuarioDTO {
  usuario_id: number;
}

// -----------------------------------------------
// JWT Payload
// -----------------------------------------------
export interface JwtPayload {
  id: number;
  email: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}
