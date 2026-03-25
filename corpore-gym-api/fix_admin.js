const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fix() {
  try {
    const hash = await bcrypt.hash('Admin123!', 12);
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '1234',
      database: 'corpore_gym'
    });
    await conn.query('UPDATE usuarios SET password = ? WHERE email = ?', [hash, 'admin@corporegym.com']);
    console.log('✅ Admin hash fixed!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fix();
