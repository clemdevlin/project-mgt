import { env } from './config/env.js';
import { logger } from './config/logger.js';
import app from './app.js';

app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
});
