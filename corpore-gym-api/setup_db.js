const mysql = require('mysql2/promise');
const fs = require('fs');
async function run() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '1234',
      database: 'corpore_gym',
      multipleStatements: true
    });
    console.log('Conectado a MySQL');
    const schema = fs.readFileSync('sql/schema.sql', 'utf8');
    await conn.query(schema);
    console.log('Schema ejecutado');
    const seed = fs.readFileSync('sql/seed.sql', 'utf8');
    await conn.query(seed);
    console.log('✅ Tablas y usuario admin creados con éxito');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
run();
