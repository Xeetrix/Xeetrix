# Xeetrix

Xeetrix is a Next.js 15 platform for building AI-powered business websites, internal operating systems, and agent-driven automation workflows. The repository combines a public Xeetrix marketing site, a Bengali-first personal/business command center called **Shaikh OS**, Supabase-backed memory and integration tables, Google Workspace and GitHub integrations, and a standalone Express AI-agent service.

## Table of contents

- [What this repository contains](#what-this-repository-contains)
- [Core features](#core-features)
- [Architecture overview](#architecture-overview)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Getting started](#getting-started)
- [Running the application](#running-the-application)
- [Database and Supabase setup](#database-and-supabase-setup)
- [Google Workspace integration](#google-workspace-integration)
- [GitHub integration](#github-integration)
- [Shaikh OS](#shaikh-os)
- [Standalone Shaikh Agent service](#standalone-shaikh-agent-service)
- [Available routes](#available-routes)
- [Development workflow](#development-workflow)
- [Deployment notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## What this repository contains

This project is organized as a multi-surface AI automation platform:

1. **Xeetrix public website** - a polished landing page that explains Xeetrix services, AI-agent capabilities, use cases, and conversion calls to action.
2. **Shaikh OS web app** - an internal command center for daily briefings, memory, tasks, meetings, projects, contacts, operations, marketing, finance, health, and improvement loops.
3. **Integration API routes** - Next.js route handlers for Google Workspace OAuth/sync, GitHub diagnostics/issues/repository status, and Shaikh OS commands.
4. **Supabase data foundation** - SQL migrations for relationships, connected sources, Google intelligence, GitHub integration records, self-improvement proposals, agent orchestration, and autonomous engineering-loop tables.
5. **Standalone AI-agent backend** - an Express service under `services/shaikh-agent` that uses OpenRouter models and can be deployed separately behind Nginx/PM2.

## Core features

### Public Xeetrix website

- Modern Next.js App Router landing page.
- Section-based component architecture for hero, problem, solution, agent platform, services, ecosystem, and CTA areas.
- Centralized marketing copy and navigation data in `components/data.ts`.
- Global CSS styling through `app/globals.css`.

### Shaikh OS command center

- Bengali-first daily dashboard at `/os`.
- Daily briefings built from local/runtime memory data.
- Dedicated workspaces for operations, work, personal, marketing, finance, health, timeline, contacts, meetings, projects, tasks, memory, and source connections.
- Command input endpoint for forwarding natural-language commands to an agent API.
- Relationship-aware memory and related-item UI components.

### Google Workspace intelligence

- Google OAuth connection flow.
- Read-only scopes for Gmail, Calendar, and Drive metadata.
- Encrypted token storage.
- Sync endpoints for Gmail, Calendar, and Drive.
- Diagnostic records for missing scopes, disabled APIs, HTTP failures, and sync status.
- Derived intelligence types for Gmail signals, Drive signals, contact candidates, knowledge entities, project links, and review-needed signals.

### GitHub improvement loop

- GitHub token diagnostics.
- Repository lookup and permission checks.
- Issue creation from Shaikh OS improvement proposals.
- Supabase persistence for connections, repositories, issue metadata, generated proposals, and audit data.

### Vercel deployment intelligence

- Optional read-only Vercel deployment status integration.
- Used by the self-improvement area to show recent deployment health and production URL details when configured.

### Standalone Shaikh Agent service

- Separate Node.js/Express API service.
- OpenRouter-backed model routing for `primary`, `premium`, and `cheap` task types.
- API-key middleware through `x-agent-key`.
- Health endpoints and production deployment notes for PM2/Nginx.

## Architecture overview

```text
Browser
  |
  |-- Public pages: /, marketing sections
  |-- Internal OS pages: /os/*, /admin/*
  |
Next.js App Router
  |
  |-- app/api/os/command ------------------> External agent API / Shaikh Agent
  |-- app/api/integrations/google/* -------> Google OAuth + Gmail/Calendar/Drive APIs
  |-- app/api/integrations/github/* -------> GitHub REST API
  |
Library layer
  |
  |-- lib/shaikh-os-* ----------------------> memory, intent, runtime, intelligence, orchestration
  |-- lib/google-integrations.ts ----------> Google OAuth, token encryption, sync helpers
  |-- lib/github-integration.ts -----------> GitHub diagnostics, repo, issue helpers
  |-- lib/vercel-integration.ts -----------> Vercel deployment intelligence
  |
Supabase
  |
  |-- migrations for memory, relationships, connected sources, Google intelligence,
      GitHub integration, self-improvement, runtime, and orchestration

services/shaikh-agent
  |
  |-- Express API service deployed independently when needed
  |-- OpenRouter LLM provider
```

## Tech stack

### Main web application

- **Next.js 15** with the App Router.
- **React 19**.
- **TypeScript 5**.
- **CSS Modules** for Shaikh OS page-specific styles.
- **Global CSS** for the public site shell and shared visual system.
- **Supabase REST/Auth APIs** accessed directly with `fetch`.
- **Google APIs** for OAuth, Gmail, Calendar, and Drive metadata.
- **GitHub REST API** for diagnostics, repository metadata, and issue creation.
- **Vercel API** for deployment intelligence.

### Standalone agent service

- **Node.js** with native ES modules.
- **Express 4**.
- **OpenRouter** as the LLM provider.
- **dotenv** for local environment loading.
- **cors** for API access control.

## Repository structure

```text
.
├── app/                         # Next.js App Router pages and API routes
│   ├── api/                     # Integration and OS command endpoints
│   ├── os/                      # Shaikh OS dashboards and detail pages
│   ├── admin/                   # Admin/login pages
│   ├── globals.css              # Global styling
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Public Xeetrix homepage
├── components/                  # Public website sections and shared marketing data
├── lib/                         # Runtime, memory, integration, intelligence, and agent helpers
├── services/
│   └── shaikh-agent/            # Standalone Express/OpenRouter agent backend
├── supabase/
│   └── migrations/              # Database schema migrations
├── next.config.ts               # Next.js config
├── package.json                 # Main application scripts and dependencies
├── package-lock.json            # Main application lockfile
└── tsconfig.json                # TypeScript config
```

## Prerequisites

Install the following before developing locally:

- Node.js 20 or newer.
- npm 10 or newer.
- A Supabase project if you want persistence, admin login, integrations, or runtime memory.
- Google Cloud OAuth credentials if you want Google Workspace sync.
- A GitHub fine-grained or classic token if you want GitHub diagnostics and issue creation.
- A Vercel token if you want deployment intelligence.
- An OpenRouter API key if you want the standalone Shaikh Agent or command forwarding to call an LLM.

## Environment variables

Create a `.env.local` file in the repository root for the Next.js app. Not every variable is required for every page; unconfigured integrations generally show a degraded or setup-needed state.

### Main app variables

| Variable | Required for | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Admin login, Supabase-backed UI, browser auth | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Admin login/browser auth | Public Supabase anonymous key. |
| `SUPABASE_URL` | Server-side Supabase access | Supabase project URL for server-side REST calls. Falls back to `NEXT_PUBLIC_SUPABASE_URL` in some helpers. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side persistence and integrations | Service-role key used by server routes and library helpers. Keep secret. |
| `NEXT_PUBLIC_SITE_URL` | Local OAuth callback generation | Public local/staging site URL, for example `http://localhost:3000`. |
| `SITE_URL` | Local OAuth callback generation | Server-side fallback site URL. |
| `NEXT_PUBLIC_APP_URL` | Local OAuth callback generation | Additional app URL fallback. |
| `APP_URL` | Local OAuth callback generation | Additional server-side app URL fallback. |
| `GOOGLE_CLIENT_ID` | Google OAuth | OAuth client ID from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth/token refresh | OAuth client secret from Google Cloud Console. |
| `TOKEN_ENCRYPTION_KEY` | Google token encryption | Secret string hashed into an AES-256-GCM key for Google token encryption. |
| `GITHUB_TOKEN` | GitHub diagnostics/issues | GitHub API token with access to the configured repository and issue creation permissions. |
| `GITHUB_REPO_FULL_NAME` | GitHub integration | Target repository in `owner/name` format. Defaults to `Xeetrix/Xeetrix`. |
| `GITHUB_TOKEN_ENCRYPTION_SECRET` | GitHub connection records | Optional secret used when hashing GitHub token-derived connection values. |
| `GOOGLE_TOKEN_ENCRYPTION_SECRET` | GitHub fallback secret | Optional fallback secret used by GitHub helper if GitHub-specific secret is absent. |
| `VERCEL_TOKEN` | Deployment intelligence | Vercel API token. |
| `VERCEL_PROJECT_ID` | Deployment intelligence | Vercel project ID. |
| `VERCEL_PROJECT_NAME` | Deployment intelligence | Alternative Vercel project identifier. |
| `VERCEL_TEAM_ID` | Deployment intelligence | Optional Vercel team ID. |
| `NEXT_PUBLIC_AGENT_API_URL` | Shaikh OS command forwarding/client agent helper | Agent API base URL. Defaults vary by helper. |
| `AGENT_API_SECRET` | Shaikh OS command forwarding | Secret sent to the agent API as `x-agent-key`. |

Example `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TOKEN_ENCRYPTION_KEY=replace-with-a-long-random-secret

GITHUB_TOKEN=github_pat_or_token
GITHUB_REPO_FULL_NAME=your-org/your-repo

VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-vercel-project-id
VERCEL_TEAM_ID=your-vercel-team-id

NEXT_PUBLIC_AGENT_API_URL=http://localhost:3001
AGENT_API_SECRET=replace-with-a-shared-agent-secret
```

### Standalone agent variables

The standalone service has its own environment template at `services/shaikh-agent/.env.example`:

```env
OPENROUTER_API_KEY=
OPENROUTER_PRIMARY_MODEL=google/gemini-2.5-flash
OPENROUTER_PREMIUM_MODEL=anthropic/claude-sonnet-4.5
OPENROUTER_CHEAP_MODEL=deepseek/deepseek-v3.2
AGENT_API_SECRET=
PORT=3000
```

## Getting started

Clone the repository and install the main app dependencies:

```bash
git clone <repository-url>
cd Xeetrix
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

If there is no root `.env.example` in your checkout, create `.env.local` manually using the variables listed above.

## Running the application

Start the main Next.js app:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start the production build locally:

```bash
npm start
```

Run linting:

```bash
npm run lint
```

> Note: the current `lint` script uses `next lint`. Newer Next.js versions may require migrating to the ESLint CLI if `next lint` is unavailable in your installed Next.js release.

## Database and Supabase setup

The `supabase/migrations` directory contains timestamped SQL migrations. Apply them to your Supabase project in chronological order using your preferred Supabase workflow.

The migrations define the data foundation for:

- Relationship and memory graph records.
- Connected source accounts.
- Google Workspace sync tables and diagnostics.
- Google intelligence layer tables.
- GitHub integration connections, repositories, issues, and issue metadata.
- Self-improvement proposals.
- Agent orchestration/runtime foundations.
- Autonomous engineering loop records.

Typical Supabase CLI workflow:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

If you do not use the Supabase CLI, copy the SQL from each migration into the Supabase SQL editor and run the files in timestamp order.

## Google Workspace integration

The Google integration is designed around read-only access and diagnostic transparency.

### Required Google setup

1. Create or select a Google Cloud project.
2. Configure an OAuth consent screen.
3. Create OAuth client credentials for a web application.
4. Add callback URLs:
   - Local: `http://localhost:3000/api/integrations/google/callback`
   - Production: `https://xeetrix.com/api/integrations/google/callback` or your deployed domain.
5. Enable the APIs you plan to sync:
   - Gmail API
   - Google Calendar API
   - Google Drive API
6. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `TOKEN_ENCRYPTION_KEY` in `.env.local` or your hosting provider.

### Google scopes

The app requests:

- OpenID identity scopes: `openid`, `email`, `profile`.
- Gmail read-only scope.
- Calendar read-only scope.
- Drive metadata read-only scope.

### Google routes

- `GET /api/integrations/google/connect` starts OAuth.
- `GET /api/integrations/google/callback` completes OAuth and stores the connected account.
- `GET /api/integrations/google/accounts` lists connected accounts.
- `DELETE /api/integrations/google/account/[id]` removes a connected account.
- `POST /api/integrations/google/gmail/sync` syncs Gmail signals.
- `POST /api/integrations/google/calendar/sync` syncs calendar data.
- `POST /api/integrations/google/drive/sync` syncs Drive metadata.

## GitHub integration

The GitHub integration lets Shaikh OS inspect repository connectivity and turn improvement proposals into GitHub issues.

### Required GitHub setup

1. Create a GitHub token with access to the target repository.
2. Ensure issues are enabled on the repository.
3. Grant permissions sufficient for repository metadata and issue creation.
4. Set:
   - `GITHUB_TOKEN`
   - `GITHUB_REPO_FULL_NAME`, for example `your-org/your-repo`
   - optionally `GITHUB_TOKEN_ENCRYPTION_SECRET`

### GitHub routes

- `GET /api/integrations/github/status` reports token, repository, organization, connection, and permission state.
- `GET /api/integrations/github/repo` returns configured repository details.
- `GET /api/integrations/github/diagnostics` returns detailed diagnostic checks.
- `GET /api/integrations/github/issues` lists issues.
- `POST /api/integrations/github/issues` creates an issue from an improvement proposal.

## Shaikh OS

Shaikh OS is the internal operating layer of the project. It combines static/runtime memory, connected sources, relationship data, and integration signals into focused workspaces.

Important pages include:

| Route | Purpose |
| --- | --- |
| `/os` | Daily dashboard and command input. |
| `/os/agent` | Agent-facing workspace. |
| `/os/briefing` | Briefing view. |
| `/os/memory` | Universal memory/search view. |
| `/os/memory/[id]` | Memory item details. |
| `/os/tasks/[id]` | Task details. |
| `/os/projects/[id]` | Project details. |
| `/os/meetings` | Meeting list. |
| `/os/meetings/[id]` | Meeting details. |
| `/os/contacts` | Contacts workspace. |
| `/os/sources` | Connected source management. |
| `/os/improve` | Self-improvement proposals and engineering loop. |
| `/os/operations` | Operations view. |
| `/os/marketing` | Marketing view. |
| `/os/finance` | Finance view. |
| `/os/health` | Health/personal signals. |
| `/os/timeline` | Timeline view. |
| `/os/work` | Work overview. |
| `/os/personal` | Personal overview. |

## Standalone Shaikh Agent service

The standalone service lives in `services/shaikh-agent`. It is intentionally isolated from the Next.js app so it can be deployed on a VPS or separate host.

Install dependencies:

```bash
cd services/shaikh-agent
npm install
```

Create the service environment file:

```bash
cp .env.example .env
```

Start the service:

```bash
npm start
```

Example health check:

```bash
curl http://localhost:3000/health
```

Example chat request:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "x-agent-key: YOUR_AGENT_API_SECRET" \
  -d '{"message":"আমি জাপানে যেতে চাই। কীভাবে শুরু করব?","taskType":"primary"}'
```

Supported `taskType` values are:

- `primary`
- `premium`
- `cheap`

For more service-specific deployment details, see `services/shaikh-agent/README.md`.

## Available routes

### Public and UI routes

- `/` - public Xeetrix landing page.
- `/admin` - admin area.
- `/admin/login` - admin login.
- `/os/*` - Shaikh OS dashboards and detail pages.

### API routes

- `/api/os/command`
- `/api/os/improve/feedback`
- `/api/integrations/google/connect`
- `/api/integrations/google/callback`
- `/api/integrations/google/accounts`
- `/api/integrations/google/account/[id]`
- `/api/integrations/google/gmail/sync`
- `/api/integrations/google/calendar/sync`
- `/api/integrations/google/drive/sync`
- `/api/integrations/github/status`
- `/api/integrations/github/repo`
- `/api/integrations/github/diagnostics`
- `/api/integrations/github/issues`

## Development workflow

Recommended workflow for changes:

1. Pull the latest branch.
2. Install dependencies with `npm install`.
3. Configure `.env.local` for the integrations you need.
4. Run `npm run dev` for local development.
5. Keep feature code organized by layer:
   - UI pages in `app/`.
   - Public marketing sections in `components/`.
   - Business logic and external API helpers in `lib/`.
   - Schema changes in `supabase/migrations/`.
   - Standalone agent changes in `services/shaikh-agent/`.
6. Run `npm run build` before production deployment.
7. Run `npm run lint` when available for the installed Next.js version.

## Deployment notes

### Next.js app

This app is suitable for Vercel deployment.

Minimum production configuration:

- Set all required environment variables in the hosting provider.
- Configure Supabase URL and service-role key for server-side routes.
- Configure OAuth callback URLs to match the deployed domain.
- Set `GITHUB_REPO_FULL_NAME` to the production repository target.
- Set `NEXT_PUBLIC_AGENT_API_URL` to the deployed agent service if using command forwarding.

### Production Google callback

The Google helper uses `https://xeetrix.com` as the production base URL when `VERCEL_ENV=production` or `NODE_ENV=production`. If deploying to another domain, update the production URL logic in `lib/google-integrations.ts` or ensure your environment routing matches the expected domain.

### Standalone agent service on a VPS

The agent service can be run with PM2:

```bash
cd /var/www/Xeetrix/services/shaikh-agent
npm install
pm2 start server.js --name shaikh-agent
pm2 save
```

Nginx can then reverse proxy a domain such as `agent.example.com` to the local Node.js process.

## Troubleshooting

### Missing Supabase environment variables

If admin login or Supabase-backed screens fail with missing configuration errors, set:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Google OAuth redirects to the wrong URL

Check your local URL variables and callback configuration:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Also verify that the same callback URL is registered in Google Cloud Console.

### Google sync reports missing scopes

Reconnect the Google account after adding scopes or enabling APIs. The integration stores granted scopes and records diagnostics for missing scopes and disabled APIs.

### GitHub diagnostics fail

Verify:

- `GITHUB_TOKEN` is set server-side.
- `GITHUB_REPO_FULL_NAME` is correct.
- The token can access the owner/repository.
- Issues are enabled on the repository.
- The token has enough permission to create issues.

### Agent command endpoint fails

Verify:

- `NEXT_PUBLIC_AGENT_API_URL` points to a reachable agent API.
- `AGENT_API_SECRET` matches the service-side secret.
- The standalone service has `OPENROUTER_API_KEY` configured.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `GITHUB_TOKEN`, `VERCEL_TOKEN`, `OPENROUTER_API_KEY`, or `AGENT_API_SECRET` in client-side code.
- Use read-only Google scopes unless write access is intentionally required.
- Rotate tokens if they are ever committed, logged, or shared.
- Keep production OAuth callback URLs strict and avoid broad wildcard redirects.

## License

No license file is currently included in this repository. Add a license before distributing or open-sourcing the project.
