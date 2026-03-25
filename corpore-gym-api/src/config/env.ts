import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '1234',
    name: process.env.DB_NAME ?? 'corpore_gym',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  },
};
