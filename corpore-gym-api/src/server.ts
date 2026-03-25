import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';

async function bootstrap(): Promise<void> {
  try {
    await testConnection();
    app.listen(env.port, () => {
      console.log(`🚀 CORPORE GYM API corriendo en http://localhost:${env.port}/api`);
      console.log(`📋 Entorno: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
