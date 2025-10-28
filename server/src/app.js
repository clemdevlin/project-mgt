import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';

import { morganStream } from './config/logger.js';
import healthRouter from './routes/health.js';
import { inngestHandler } from './inngest/handler.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import workspaceRouter from '#routes/workspace.route.js';
import { protect } from '#middleware/auth.middleware.js';

const app = express();

app.set('trust proxy', true);

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:5174',
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: morganStream }));

app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.status(201).json({
    name: 'Project Management API',
    description: 'Project Management API for Project Mangement',
    health: 'GET api/health',
  });
});

app.use('/api/health', healthRouter);
app.use('/api/inngest', inngestHandler);

// Routes
app.use('/api/workspaces', protect, workspaceRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
