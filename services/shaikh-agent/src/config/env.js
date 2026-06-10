import dotenv from 'dotenv';

dotenv.config();

export const env = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  primaryModel: process.env.OPENROUTER_PRIMARY_MODEL || 'google/gemini-2.5-flash',
  premiumModel: process.env.OPENROUTER_PREMIUM_MODEL || 'anthropic/claude-sonnet-4.5',
  cheapModel: process.env.OPENROUTER_CHEAP_MODEL || 'deepseek/deepseek-v3.2',
  agentApiSecret: process.env.AGENT_API_SECRET,
  port: process.env.PORT || 3000
};

export function getModelForTask(taskType = 'primary') {
  const models = {
    primary: env.primaryModel,
    premium: env.premiumModel,
    cheap: env.cheapModel
  };

  return models[taskType] || models.primary;
}
