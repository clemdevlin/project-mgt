import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from './logger.js';

// Create a test account or replace with real credentials.
export const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.stmpUser,
    pass: env.stmpPass,
  },
});

export const sendEmail = async ({ to, subject, body }) => {
  const response = await transporter.sendMail({
    from: env.senderEmail,
    to,
    subject,
    html: body,
  });

  logger.log('Message sent:', response.messageId);
  return response;
};
