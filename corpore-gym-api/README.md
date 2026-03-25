# CORPORE GYM API

API REST para gestión de turnos y clases del gimnasio de pilates CORPORE GYM.

## Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de datos**: MySQL (mysql2/promise con pool)
- **Auth**: JWT + bcrypt

## Inicio rápido

### 1. Prerrequisitos
- Node.js >= 18
- MySQL 8.x corriendo localmente

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de MySQL
```

### 3. Crear la base de datos
```sql
-- Ejecutar en MySQL:
source sql/schema.sql;
source sql/seed.sql;
```

### 4. Instalar dependencias y correr
```bash
npm install
npm run dev
```

El servidor corre en `http://localhost:3000/api`

### 5. Health check
```
GET http://localhost:3000/api/health
```

---

## Estructura del proyecto
```
src/
├── config/          # DB pool, env vars
├── controllers/     # Handlers HTTP
├── services/        # Lógica de negocio
├── repositories/    # Queries SQL
├── routes/          # Definición de rutas
├── middlewares/     # Auth JWT, roles, errores
├── models/          # Interfaces TypeScript
├── types/           # Tipos auxiliares
├── utils/           # JWT, hash, AppError
├── app.ts           # Express setup
└── server.ts        # Entry point
sql/
├── schema.sql       # Creación de tablas
└── seed.sql         # Datos iniciales (admin + clases)
```

---

## Credenciales del admin inicial (seed)
- **Email**: `admin@corporegym.com`
- **Password**: `Admin123!`

---

## Endpoints principales

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/auth/register` | Público | Registrar usuario |
| POST | `/auth/login` | Público | Login, retorna JWT |
| GET | `/users/:id` | user/admin | Ver perfil |
| PUT | `/users/:id` | user/admin | Editar perfil |
| DELETE | `/users/:id` | user/admin | Eliminar cuenta |
| GET | `/users/:id/classes` | user/admin | Mis clases activas |
| GET | `/classes` | Autenticado | Listar clases |
| GET | `/classes/:id` | Autenticado | Detalle de clase |
| POST | `/classes` | admin | Crear clase |
| PUT | `/classes/:id` | admin | Editar clase |
| DELETE | `/classes/:id` | admin | Eliminar clase |
| POST | `/classes/:id/enroll` | user | Inscribirse |
| DELETE | `/classes/:id/enroll` | user | Cancelar inscripción |
| GET | `/classes/:id/students` | admin | Ver alumnos |
| GET | `/classes/:id/attendance` | admin | Ver asistencia |
| POST | `/classes/:id/attendance` | admin | Registrar asistencia |
| PATCH | `/classes/:classId/move-user` | admin | Mover alumno |
| PATCH | `/classes/:classId/remove-user` | admin | Remover alumno |

---

## Probar con Postman
Importar `CORPORE_GYM.postman_collection.json`. El login guarda el token automáticamente.

---

## Propuesta de Frontend futuro

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx        # POST /auth/login
│   │   ├── RegisterPage.tsx     # POST /auth/register
│   │   ├── ClassesPage.tsx      # GET /classes (listado con cupos)
│   │   ├── ClassDetailPage.tsx  # GET /classes/:id + POST /enroll
│   │   ├── ProfilePage.tsx      # GET/PUT /users/:id
│   │   └── AdminPanel/
│   │       ├── AttendancePage.tsx  # POST /classes/:id/attendance
│   │       ├── StudentsPage.tsx    # GET /classes/:id/students
│   │       └── MoveUserPage.tsx    # PATCH /classes/:classId/move-user
│   ├── services/
│   │   └── api.ts              # Axios/Fetch configurado con JWT header
│   ├── context/
│   │   └── AuthContext.tsx     # JWT storage, rol del usuario
│   └── components/
│       ├── ClassCard.tsx       # Cupos disponibles / ocupados
│       └── ProtectedRoute.tsx  # Guard de rutas por rol
```

**Stack sugerido**: React + Vite + TypeScript + React Query para manejo de estado del servidor.
