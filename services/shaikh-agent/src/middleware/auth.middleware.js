import { env } from '../config/env.js';

export function requireAgentKey(req, res, next) {
  const agentKey = req.get('x-agent-key');

  if (!agentKey || !env.agentApiSecret || agentKey !== env.agentApiSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}
