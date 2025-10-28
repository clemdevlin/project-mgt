import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5002,
  inngestAppId: process.env.INNGEST_APP_ID || 'project-management',
  inngestSigningKey: process.env.INNGEST_SIGNING_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || '',
  mailPass: process.env.MAIL_PASS || '',
  mailUser: process.env.MAIL_USER || 'kwasiclement764@gmail.com',
  stmpUser: process.env.SMTP_USER || '',
  stmpPass: process.env.SMTP_PASS || '',
  senderEmail: process.env.SENDER_EMAIL || '',
};
