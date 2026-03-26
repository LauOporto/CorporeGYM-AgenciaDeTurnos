import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from './env';

export async function syncDatabase() {
  console.log('🔄 Sincronizando base de datos...');
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

  const tempPool = mysql.createPool(dbConfig);

  try {
    const sqlPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      await tempPool.query(sql);
      console.log('✅ Tablas base (schema.sql) aseguradas.');
    }
    
    // Migraciones seguras
    try { await tempPool.query('ALTER TABLE usuarios ADD COLUMN cuota_al_dia BOOLEAN DEFAULT FALSE;'); } catch (e: any) { }
    try { await tempPool.query('ALTER TABLE usuarios ADD COLUMN pago_pendiente BOOLEAN DEFAULT FALSE;'); } catch (e: any) { }
    
    console.log('✅ Migraciones extra ejecutadas.');
  } catch (err: any) {
    console.error('❌ Error sinconizando DB:', err);
  } finally {
    await tempPool.end();
  }
}
