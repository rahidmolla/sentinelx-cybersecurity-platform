import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      logger.info(`====================================================`);
      logger.info(`🛡️  SentinelX Cybersecurity Engine Running on Port ${ENV.PORT}`);
      logger.info(`🌐 Environment: ${ENV.NODE_ENV}`);
      logger.info(`📡 Health Check: http://localhost:${ENV.PORT}/api/health`);
      logger.info(`====================================================`);
    });
  } catch (err) {
    logger.error('Failed to start SentinelX server', err);
    process.exit(1);
  }
}

startServer();
