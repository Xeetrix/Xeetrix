import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(healthRouter);
app.use(chatRouter);

app.use(errorMiddleware);
