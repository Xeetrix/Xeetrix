import { env, getModelForTask } from '../config/env.js';
import { shaikhAgentPrompt } from '../prompts/shaikh-agent.prompt.js';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

function createOpenRouterError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function createChatCompletion({ message, taskType }) {
  if (!env.openRouterApiKey) {
    throw createOpenRouterError(500, 'OpenRouter API key is not configured');
  }

  const model = getModelForTask(taskType);
  const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://knltc.com',
      'X-Title': 'Shaikh Agent'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: shaikhAgentPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.4,
      max_tokens: 900
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const safeMessage = data?.error?.message || data?.message || 'OpenRouter request failed';
    throw createOpenRouterError(response.status, safeMessage);
  }

  return {
    model,
    reply: data?.choices?.[0]?.message?.content || '',
    usage: data?.usage || null
  };
}
