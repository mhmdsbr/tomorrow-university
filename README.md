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

## Creating milestones

Set `GEMINI_API_KEY` and `GEMINI_MODEL` in your untracked `.env` file.
Choose a Gemini model supporting JSON-schema structured output (for example,
`gemini-3.8-flash`, subject to availability in your account). The key is used
only on the server; never prefix it with `NEXT_PUBLIC_`.

Run `npm run dev` and open the home page:

1. Enter a topic title and description. There is no predefined topic list.
2. Select **Generate three milestones**. The topic is sent to Google Gemini
   using the teaching prompt in `src/server/services/milestone-generation.ts`.
3. Review and edit the three milestone titles and descriptions. You can
   discard the draft or generate a replacement.
4. Select **Approve and save all three** to record the reviewed milestones.

Generating, editing, regenerating, and discarding do not write to the database.
Drafts exist only in browser memory and are lost on reload or navigation.
The server validates exactly three milestones before saving them in a single
atomic insert. The topic itself is not stored; the existing two-column
milestones table remains unchanged. Saved milestones remain visible in the
current page but are not loaded again after a reload.

Input titles are limited to 200 characters and descriptions to 5000 characters.
Generation has a 60-second timeout; configure your hosting request timeout
accordingly. Errors are shown in the UI, and unsuccessful saves preserve the draft.
This prototype has no authentication or rate limiting; add both before making
the generation endpoint publicly accessible.

UI components live in `src/components/`, organized by atomic design:

- `atoms/`: shared buttons, headings, and typography.
- `molecules/`: labeled form fields, topic form, milestone cards, and draft review.
- `organisms/MilestoneForm.tsx`: client-side generation, editing, approval, and
  feedback state, composed from the molecules.

Server actions live in `actions/`. The page remains a Server Component; only
the form organism and its dependencies are included in the interactive client UI.

Run `npm run test:milestones` for generation and validation tests. These mock
Gemini and do not send external requests or require an API key.
Run `npm run test:components` to check the topic and draft-review rendering,
field validation attributes, and pending/saved controls.
