import pool from './src/config/database';

async function migrate() {
  try {
    await pool.query('ALTER TABLE usuarios ADD COLUMN cuota_al_dia BOOLEAN DEFAULT FALSE');
    console.log('Migration successful');
  } catch(e: any) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error(e);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
