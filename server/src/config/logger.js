import winston from 'winston';
import fs from 'fs';
import path from 'path';

const isServerless = !!process.env.VERCEL; // true on Vercel
const isProd = process.env.NODE_ENV === 'production';

const transports = [];

// ✅ Only create/write logs locally (non-serverless)
if (!isServerless) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  );
}

// ✅ Always log to console in dev or serverless (Vercel)
if (!isProd || isServerless) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'project-management-api' },
  transports,
});

export const morganStream = {
  write: message => logger.info(message.trim()),
};
