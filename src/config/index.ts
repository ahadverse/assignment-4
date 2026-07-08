import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || '*',

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@gearup.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@1234',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    successUrl:
      process.env.STRIPE_SUCCESS_URL ||
      'http://localhost:5000/api/payments/success',
    cancelUrl:
      process.env.STRIPE_CANCEL_URL ||
      'http://localhost:5000/api/payments/cancel',
  },
};
