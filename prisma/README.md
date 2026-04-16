# Prisma database workflow

This project treats `prisma/schema.prisma` as the source of truth for app-owned database tables.

## Normal schema changes

1. Update `prisma/schema.prisma`.
2. Create and apply a Prisma migration with `npm run db:migrate` during development.
3. Regenerate and validate the client with `npm run db:check`.
4. Verify app code with `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
5. Deploy migrations with `npm run db:deploy`.

## Production and Supabase rules

- Keep Supabase Data API off for the `public` schema. The app uses Prisma/direct Postgres access for `public`.
- Only expose an intentional custom schema, such as `api`, if a public Data API surface is needed later.
- Do not grant `anon` or `authenticated` permissions on app-owned `public` tables.
- Avoid `prisma db pull` as a normal workflow. Use it only for audits, then review any schema changes before committing.

## Operational SQL

Direct SQL is allowed only for operational tasks that should not become Prisma models, such as one-off cleanup or Supabase permission hardening. Store those files in `prisma/operational-sql/` so the reason and exact SQL stay visible in git.
