# Xeetrix — Bridge to Global Trade

Xeetrix is a B2B wholesale marketplace connecting local entrepreneurs with
verified importers and exporters. Buyers browse bulk-priced products with
transparent minimum order quantities (MOQs) and contact suppliers directly;
suppliers list products through a protected admin dashboard.

## Tech stack

- **Framework:** Next.js 14 (App Router, Server Components, SSG/SSR)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Database/ORM:** Prisma (PostgreSQL by default; SQLite works for local dev)
- **Icons:** lucide-react
- **Auth:** Lightweight JWT session cookie (`jose`) for the admin dashboard
- **Validation:** Zod

## Project structure

```
app/
  (site)/            Public storefront — shares Navbar/Footer via its own layout
    page.tsx          Homepage (hero, featured categories, hot products)
    products/          Product listing (filters) + [slug] detail (SEO + JSON-LD)
    categories/         Category listing + [slug] detail
    about/, contact/
  admin/
    login/             Admin login (outside the dashboard layout)
    (dashboard)/       Sidebar-driven dashboard: overview, products, categories, users
  api/
    products/, categories/, users/   REST CRUD routes (admin-only)
    auth/login, auth/logout           Session cookie issuance
    contact/                          Contact form handler
  sitemap.ts, robots.ts, manifest.ts  SEO plumbing
components/            Shared UI, section, and admin components
lib/
  data/                Data-access layer: Prisma first, mock catalog fallback
  mock-data.ts         Bundled demo catalog (6 categories, 12 products)
  validation/          Zod schemas for forms/API input
  auth.ts, require-admin.ts   Session signing/verification helpers
prisma/
  schema.prisma        User / Category / Product models
  seed.ts               Seeds the admin user + demo catalog into a real DB
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values — see below
npm run dev
```

The site works immediately with **zero configuration**: every data-fetching
function in `lib/data/*` tries the database first and falls back to the
bundled mock catalog (`lib/mock-data.ts`) whenever `DATABASE_URL` is unset,
unreachable, or the tables are empty. This means the storefront, SEO pages,
and static generation all work out of the box — only the **admin CRUD**
screens require a real database to persist changes.

### Connecting a database

1. Provision a Postgres database (Vercel Postgres, Neon, Supabase, Railway, etc.)
2. Set `DATABASE_URL` in `.env.local` (or your hosting provider's env vars)
3. Push the schema: `npm run db:push`
4. Seed the admin user + demo catalog: `npm run db:seed`

`ADMIN_EMAIL` / `ADMIN_PASSWORD` in your environment control the seeded
admin account. Until the database is connected, the same credentials work
as a **bootstrap login** for `/admin` (see `app/api/auth/login/route.ts`),
so you can preview the dashboard immediately.

### Environment variables

See `.env.example` for the full list with descriptions:

- `DATABASE_URL` — Postgres connection string (Prisma)
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME` — used in metadata/JSON-LD
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — powers the "Order via WhatsApp" CTA
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — seed admin / bootstrap login credentials
- `AUTH_SECRET` — signs admin session JWTs (generate with `openssl rand -base64 32`)

## SEO implementation

- Per-page `generateMetadata` (title, description, canonical, OpenGraph, Twitter) on every product and category page
- `Product` JSON-LD (price, availability, MOQ via `eligibleQuantity`) and `BreadcrumbList` JSON-LD on product pages
- `Organization` JSON-LD in the root layout
- `app/sitemap.ts` dynamically includes every product and category
- `app/robots.ts` disallows `/admin` and `/api`
- Static generation (`generateStaticParams` + `revalidate`) for product and category pages

## Admin dashboard

Visit `/admin` (redirects to `/admin/login` if unauthenticated). Once signed
in you can:

- **Products** — create, edit, delete; set wholesale/regular price, MOQ, stock, images, SEO fields, featured/published flags
- **Categories** — create, edit, delete (blocked while products still reference a category)
- **Users** — create Importer/Exporter/Admin accounts, manage roles and active status

`middleware.ts` protects every `/admin/*` route at the edge; API routes
independently re-check the session server-side before mutating data.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Start the production server |
| `npm run lint` | Lint |
| `npm run db:push` | Push `schema.prisma` to `DATABASE_URL` |
| `npm run db:seed` | Seed admin user + demo catalog |
| `npm run db:studio` | Open Prisma Studio |

## Deploying to Vercel

1. Push this repository to GitHub (already done if you're reading this from the repo)
2. Import the project in Vercel
3. Add the environment variables above in Vercel's project settings
4. Provision a Postgres database and set `DATABASE_URL`
5. Deploy — the build step runs `prisma generate` automatically via `postinstall`/`build`
