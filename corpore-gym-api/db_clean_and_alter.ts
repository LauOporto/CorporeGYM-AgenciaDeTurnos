import pool from './src/config/database';

async function run() {
  try {
    await pool.query('ALTER TABLE usuarios ADD COLUMN pago_pendiente BOOLEAN DEFAULT FALSE;');
    console.log('Columna pago_pendiente agregada.');
  } catch(e:any) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('pago_pendiente ya existe.');
    else console.error(e);
  }

  try {
    const [rows] = await pool.query<any[]>('SELECT id FROM usuarios WHERE rol = "admin" OR nombre LIKE "%test5%"');
    const idsToKeep = rows.map(r => r.id);
    if (idsToKeep.length > 0) {
      const placeholders = idsToKeep.map(() => '?').join(',');
      await pool.query(`DELETE FROM inscripciones WHERE usuario_id NOT IN (${placeholders})`, idsToKeep);
      await pool.query(`DELETE FROM asistencias WHERE usuario_id NOT IN (${placeholders})`, idsToKeep);
      const [res] = await pool.query<any>(`DELETE FROM usuarios WHERE id NOT IN (${placeholders})`, idsToKeep);
      console.log(`Eliminados ${res.affectedRows} usuarios de prueba.`);
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
run();
