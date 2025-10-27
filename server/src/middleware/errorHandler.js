import { logger } from '../config/logger.js';

export default function errorHandler(err, req, res) {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  const status = err.status || 500;
  res
    .status(status)
    .json({ error: status === 500 ? 'Internal Server Error' : err.message });
}
