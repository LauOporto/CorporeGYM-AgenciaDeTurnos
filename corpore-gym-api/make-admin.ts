import pool from './src/config/database';

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('❌ Error: Por favor, provee el email de tu cuenta.\nEjemplo: npx ts-node make-admin.ts tunombre@correo.com');
    process.exit(1);
  }

  try {
    const [result]: any = await pool.execute(
      "UPDATE usuarios SET rol = 'admin', cuota_al_dia = 1 WHERE email = ?",
      [email]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ ¡Éxito! El usuario con correo "${email}" ahora es Administrador y tiene la cuota vitalicia al día.`);
    } else {
      console.log(`⚠️ No se encontró ninguna cuenta con el correo "${email}". Asegurate de haberte registrado primero en la web de Vercel.`);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    // Cerramos la conexión para que el script termine limpio
    process.exit(0);
  }
}

makeAdmin();
