import pool from './src/config/database';

async function run() {
  try {
    const [result] = await pool.query<any>('UPDATE clases c SET cupos_ocupados = (SELECT COUNT(*) FROM inscripciones i WHERE i.clase_id = c.id);');
    console.log(`Recalculated cupos for ${result.affectedRows} clases`);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
run();
