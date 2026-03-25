import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuario.routes';
import claseRoutes from './routes/clase.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ============================================================
// Middlewares globales
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Rutas
// ============================================================
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'CORPORE GYM API corriendo ✅', timestamp: new Date().toISOString() });
});

app.use('/api/auth',    authRoutes);
app.use('/api/users',   usuarioRoutes);
app.use('/api/classes', claseRoutes);

// ============================================================
// Manejo de rutas no encontradas
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada.' });
});

// ============================================================
// Middleware de errores (siempre al final)
// ============================================================
app.use(errorHandler);

export default app;
