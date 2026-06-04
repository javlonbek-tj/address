# Prisma Migration Workflow

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
