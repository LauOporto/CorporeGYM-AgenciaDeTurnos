import mysql from 'mysql2/promise';
import { env } from './env';

// Pool de conexiones – reutilizable en toda la app
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'local',
  charset: 'utf8mb4',
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  conn.release();
  console.log('✅ Conexión a MySQL establecida correctamente.');
}

export default pool;
