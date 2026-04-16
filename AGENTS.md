<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Database safety

- Treat `prisma/schema.prisma` as the source of truth for app-owned database tables.
- Do not expose the Supabase `public` schema through the Data API. Keep `public` server-only for Prisma/direct Postgres access.
- If a Supabase Data API endpoint is needed later, expose only an intentional custom schema such as `api`, and add explicit RLS/grants for that surface.
- If direct SQL changes are required, mirror them in Prisma schema/migrations or document why they are operational-only.
- Before shipping database-related changes, run `npm run db:check`, `npx tsc --noEmit`, and `npm run lint`.
