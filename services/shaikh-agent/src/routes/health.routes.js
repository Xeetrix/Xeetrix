import { Router } from 'express';

export const healthRouter = Router();

const healthResponse = {
  status: 'ok',
  app: 'Shaikh Agent',
  platform: 'Xeetrix',
  message: 'Server is running'
};

healthRouter.get('/', (req, res) => {
  res.json(healthResponse);
});

healthRouter.get('/health', (req, res) => {
  res.json(healthResponse);
});
