# Prisma Migration Workflow

> ## ⚠️ Warning: never run development migration commands against Production
>
> The project currently has **only one database**, and it is **Production** (the `DATABASE_URL` in `.env`). There is no separate development database.
>
> **Never run these against Production:**
> - `npm run migrate:dev` / `prisma migrate dev`
> - `prisma migrate reset`
> - `prisma db push`
>
> The Production schema has known drift from the committed migrations (verified 2026-11-12):
> - FK `streets_uzKadCode_fkey` is missing, and 1,401 streets have orphan `uzKadCode` values;
> - FK `uzkad_streets_districtId_fkey` is missing;
> - a stray empty column `streets.uzkadupdatedat` exists.
>
> `prisma migrate dev` detects that drift and offers to **reset the database**. Accepting the prompt would delete all data. `prisma migrate status` still says "up to date", because it only compares migration history, not the actual schema.
>
> **Until a separate development database exists, use this workflow instead:**
> 1. Edit `prisma/schema.prisma`, then run `npx prisma validate` and `npx prisma generate`.
> 2. Generate the SQL without touching any database: `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`. To see what would change in Production, `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` only *prints* SQL.
> 3. Hand-write `prisma/migrations/<timestamp>_<name>/migration.sql` with **only** the statements for your change. Never include the drift items above unless a separate, approved task says so.
> 4. Get explicit approval, take a fresh `pg_dump` backup (the client major version must match the server, currently PostgreSQL 18), then apply with `npx prisma migrate deploy`.
> 5. **A committed migration file is executed on Production by the next `npm run build`** (it runs `prisma migrate deploy`). Don't commit a migration you haven't approved for Production.
>
> The "Golden Rule" below applies only once a separate development database is configured.

## The Golden Rule

Every time you change the schema, run `migrate:dev` first to generate the migration file — then commit it. Production applies it automatically on build.

```
Edit schema (prisma/schema.prisma)
        ↓
npm run migrate:dev     ← always, in dev (creates migration file)
        ↓
git commit              ← commit the generated migration file too
        ↓
Prod: npm run build     ← runs prisma migrate deploy automatically before next build
```

---

## Commands

| Command | What it does | When to use |
|---|---|---|
| `npm run migrate:dev` | Creates a new migration file and applies it to the DB | After every schema change, in dev |
| `npm run build` | Runs `prisma migrate deploy` then builds the app | Production (migrate is automatic) |
| `npm install` | Triggers `prisma generate` automatically via postinstall | After cloning or installing dependencies |

---

## Key Points

- **`migrate:dev` is always a dev step** — run it locally, commit the output.
- **`prisma migrate deploy` only applies existing files** — it cannot create new ones, so migration files must already exist and be committed.
- **`prisma generate` runs automatically on `npm install`** via the `postinstall` hook — no need to run it manually.
- In production, `npm run build` calls `prisma migrate deploy && next build`, so migrations run automatically on every deploy.
