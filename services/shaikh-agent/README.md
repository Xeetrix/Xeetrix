# Shaikh Agent

**Parent brand:** Xeetrix

Shaikh Agent is an isolated Node.js + Express AI Agent backend for KNLTC. It is designed to run separately from the Xeetrix website on a VPS with PM2 and Nginx.

## Purpose

Provide a standalone AI Agent API for KNLTC using OpenRouter as the LLM provider.

## Required environment variables

Create a `.env` file in `services/shaikh-agent/` using `.env.example` as a template:

```env
OPENROUTER_API_KEY=
OPENROUTER_PRIMARY_MODEL=google/gemini-2.5-flash
OPENROUTER_PREMIUM_MODEL=anthropic/claude-sonnet-4.5
OPENROUTER_CHEAP_MODEL=deepseek/deepseek-v3.2
AGENT_API_SECRET=
PORT=3000
```

## Install

```bash
npm install
```

## Start

```bash
npm start
```

## PM2 commands

```bash
pm2 start server.js --name shaikh-agent
pm2 restart shaikh-agent
pm2 save
```

## Health checks

```bash
curl https://agent.knltc.com/
curl https://agent.knltc.com/health
```

Expected response:

```json
{
  "status": "ok",
  "app": "Shaikh Agent",
  "platform": "Xeetrix",
  "message": "Server is running"
}
```

## Chat request

```bash
curl -X POST https://agent.knltc.com/chat \
  -H "Content-Type: application/json" \
  -H "x-agent-key: YOUR_AGENT_API_SECRET" \
  -d '{"message":"আমি জাপানে যেতে চাই। কীভাবে শুরু করব?","taskType":"primary"}'
```

`taskType` supports `primary`, `premium`, and `cheap`. Missing or invalid values default to `primary`.

## Nginx reverse proxy note

Configure Nginx for `agent.knltc.com` to reverse proxy HTTPS traffic to the local Node.js process, for example `http://127.0.0.1:3000`.

## VPS deployment commands

```bash
cd /var/www/Xeetrix/services/shaikh-agent
git pull
npm install
pm2 restart shaikh-agent
pm2 save
```
