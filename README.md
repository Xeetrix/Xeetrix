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
  data/                Data-access layer: reads straight from Prisma
  validation/          Zod schemas for forms/API input
  auth.ts, require-admin.ts   Session signing/verification helpers
prisma/
  schema.prisma        User / Category / Product models
  seed.ts               Seeds (or ensures) the admin user in a real DB
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values — see below
npm run dev
```

The site requires a database to show any content: every data-fetching
function in `lib/data/*` reads straight from Postgres via Prisma. With no
`DATABASE_URL` (or an unreachable one), reads fail gracefully and pages
render their empty state — an empty catalog, not a crash — but you'll want
a database connected before deploying. The **admin CRUD** screens also
require it to persist changes.

### Connecting a database (via terminal)

1. Provision a Postgres database (Vercel Postgres, Neon, Supabase, Railway, etc.)
2. Set `DATABASE_URL` in `.env.local` (or your hosting provider's env vars)
3. Push the schema: `npm run db:push`
4. Seed the admin user: `npm run db:seed`
5. Add categories and products from `/admin` once signed in

### Connecting a database (via the Supabase SQL editor, no terminal)

If you're provisioning through the Supabase dashboard instead, paste
[`supabase/schema.sql`](supabase/schema.sql) into **SQL Editor → New query**
and run it once. It creates the `Role` enum, the `users`/`categories`/`products`
tables with the exact column names Prisma expects, the foreign keys, a
default `ADMIN` user, and (in an optional, clearly-marked section) a small
demo catalog so the storefront isn't empty on first connect — delete that
section if you'd rather add your own products from `/admin`. Then just set
`DATABASE_URL` in your deployment environment — no `db:push` / `db:seed`
needed since the SQL already did that.

`ADMIN_EMAIL` / `ADMIN_PASSWORD` in your environment control the seeded
admin account (`prisma/seed.ts`) — or, for the SQL route above, the
credentials are baked into the INSERT statement. Until the database is
connected, the same credentials work as a **bootstrap login** for `/admin`
(see `app/api/auth/login/route.ts`), so you can preview the dashboard
immediately.

### Environment variables

See `.env.example` for the full list with descriptions:

- `DATABASE_URL` — Postgres connection string (Prisma)
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME` — used in metadata/JSON-LD
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — powers every "Order via WhatsApp" CTA and the contact form (which opens a pre-filled `wa.me` chat instead of submitting to an API)
- `NEXT_PUBLIC_CONTACT_EMAIL` — shown in the footer, contact page, and about page
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — seed admin / bootstrap login credentials
- `AUTH_SECRET` — signs admin session JWTs (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — power the image uploaders in the admin Category/Product forms; see **Image uploads** below

## Image uploads (Supabase Storage)

The Category and Product admin forms upload images by drag-and-drop or file
picker directly from the browser to a Supabase Storage bucket, then save the
returned public URL — no more pasting image URLs by hand.

- `lib/supabase-client.ts` — browser Supabase client (anon key only, never a service-role key)
- `lib/upload-image.ts` — validates file type/size (≤5MB, JPG/PNG/WEBP/GIF/AVIF), generates a unique filename (`crypto.randomUUID()`), uploads, and returns the public URL
- `components/admin/ImageDropzone.tsx` — single-image uploader (Category)
- `components/admin/MultiImageDropzone.tsx` — multi-image uploader with reordering-free grid, per-image remove, and an 8-image cap (Product; first image is the storefront "cover")

### One-time Supabase setup

1. In your Supabase project, note the **Project URL** and **anon public key**
   (Settings → API) and set them as `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Create the bucket and its policies by running this once in the Supabase
   **SQL Editor** (bucket id must stay `xeetrix-images` — it's hardcoded as
   `SUPABASE_IMAGE_BUCKET` in `lib/constants.ts`):

   ```sql
   -- Create a public bucket named xeetrix-images
   insert into storage.buckets (id, name, public)
   values ('xeetrix-images', 'xeetrix-images', true)
   on conflict (id) do nothing;

   -- Anyone can read/view files in this bucket (needed for public image URLs)
   create policy "Public read access for xeetrix-images"
   on storage.objects for select
   using (bucket_id = 'xeetrix-images');

   -- The anon key can upload into this bucket (the upload UI itself is only
   -- reachable through the /admin dashboard, which is already session-gated;
   -- this policy only governs direct calls to the Storage API)
   create policy "Public upload access for xeetrix-images"
   on storage.objects for insert
   with check (bucket_id = 'xeetrix-images');
   ```

   Alternatively, create the bucket from **Storage → New bucket** in the
   dashboard (toggle **Public bucket**), then add an INSERT policy on
   `storage.objects` scoped to `bucket_id = 'xeetrix-images'` for the `anon`
   role from **Storage → Policies**.

**Security note:** because the upload happens client-side with the public
anon key, the bucket's own Storage policies — not the app's admin
session — are what actually gate who can write to it. The policy above
intentionally scopes writes to only the `xeetrix-images` bucket, so it
can't be used to touch any other bucket in the project. If you need
uploads gated by your app's own admin session (so a valid Supabase anon
key alone isn't enough), swap this for a server-side `/api/upload` route
that checks `getCurrentUser()` before writing to Storage with a
service-role key.

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
| `npm run db:seed` | Ensure the admin user exists |
| `npm run db:studio` | Open Prisma Studio |

## Deploying to Vercel

1. Push this repository to GitHub (already done if you're reading this from the repo)
2. Import the project in Vercel
3. Add the environment variables above in Vercel's project settings
4. Provision a Postgres database and set `DATABASE_URL`
5. Deploy — the build step runs `prisma generate` automatically via `postinstall`/`build`
