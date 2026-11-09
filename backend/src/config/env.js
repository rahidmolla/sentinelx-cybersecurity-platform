import 'dotenv/config';

const parseOrigins = () => {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return raw.split(',').map(origin => origin.trim()).filter(Boolean);
};

export const ENV = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sentinelx',
  JWT_SECRET: process.env.JWT_SECRET || 'development-only-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGINS: parseOrigins(),
  GOOGLE_SAFE_BROWSING_API_KEY: process.env.GOOGLE_SAFE_BROWSING_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
