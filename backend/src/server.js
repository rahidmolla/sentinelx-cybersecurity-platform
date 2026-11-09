import { env } from './config/env.js';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import logger from './utils/logger.js';

await connectDatabase();

app.listen(env.port, () => {
  logger.info(`CYVEX API listening on port ${env.port}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection in CYVEX API.', reason);
});
export default app;
