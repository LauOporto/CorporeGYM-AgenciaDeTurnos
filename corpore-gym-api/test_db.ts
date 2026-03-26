import pool from './src/config/database';

async function test() {
  try {
    const [rows1] = await pool.query('SHOW TABLES');
    console.log('Tables in defaultdb:', rows1);

    await pool.query('USE corpore_gym');
    const [rows2] = await pool.query('SHOW TABLES');
    console.log('Tables in corpore_gym:', rows2);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
