import { createChatCompletion } from '../services/openrouter.service.js';

const VALID_TASK_TYPES = new Set(['primary', 'premium', 'cheap']);

export async function chatController(req, res, next) {
  try {
    const { message, taskType } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const selectedTaskType = VALID_TASK_TYPES.has(taskType) ? taskType : 'primary';
    const result = await createChatCompletion({ message, taskType: selectedTaskType });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
