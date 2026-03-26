import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from './src/config/env';

async function initDb() {
  const dbConfig: mysql.PoolOptions = {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    multipleStatements: true,
  };

  if (env.nodeEnv === 'production') {
    dbConfig.ssl = { rejectUnauthorized: false };
  }

  const pool = mysql.createPool(dbConfig);

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('✅ Tablas creadas correctamente en la base de datos (schema.sql ejecutado).');
    
    // Corremos las migraciones adicionales
    try { await pool.query('ALTER TABLE usuarios ADD COLUMN cuota_al_dia BOOLEAN DEFAULT FALSE;'); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    try { await pool.query('ALTER TABLE usuarios ADD COLUMN pago_pendiente BOOLEAN DEFAULT FALSE;'); } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    
    console.log('✅ Columnas de estado de pago sincronizadas.');
    console.log('🚀 ¡La base de datos está 100% lista para usarse en producción!');
  } catch (err: any) {
    console.error('❌ Error inicializando la base de datos:', err);
  } finally {
    process.exit(0);
  }
}

initDb();
