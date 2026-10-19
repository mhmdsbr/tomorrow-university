# tomorrow-university
Small app to showcase learning products to user to be reviewed

## Database

The app uses Drizzle ORM with PostgreSQL. Its only application table is
`milestones`, with two required text columns: `title` and `description`.
There is no ID column, and duplicate titles are allowed.

1. Set `DB_URL_LOCAL` in your untracked `.env` file to your local PostgreSQL
   connection URL. Set `DB_URL_PROD` in your production environment.
2. Start the local database with `docker compose up -d postgres`.
3. Run `npm run db:migrate` to apply the committed migration. Drizzle also
   maintains its own migration history in the separate `drizzle` schema.

After changing the schema, run `npm run db:generate` and then
`npm run db:migrate`. Both the app and Drizzle CLI use `DB_URL_PROD` when
`NODE_ENV=production`, and `DB_URL_LOCAL` otherwise.

Use the database only in server-side code:

```ts
import { db, milestones } from "@/server/db";

await db.insert(milestones).values({
  title: "First milestone",
  description: "Complete the first learning module.",
});

const allMilestones = await db.select().from(milestones);
```
