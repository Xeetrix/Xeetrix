import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { requireAgentKey } from '../middleware/auth.middleware.js';
import { chatRateLimit } from '../middleware/rateLimit.middleware.js';

export const chatRouter = Router();

chatRouter.post('/chat', chatRateLimit, requireAgentKey, chatController);
