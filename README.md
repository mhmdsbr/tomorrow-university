# Tomorrow University – Learning Pathway Generator

A Next.js app for designing three-month learning pathways for bachelor's students.
You choose a domain and describe a topic. An AI model suggests three alternative
pathways. You choose one, edit it, and save it to PostgreSQL.

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, GSAP, Zod 4,
Drizzle ORM, PostgreSQL (local Docker or Neon on Vercel), Gemini or DeepSeek.

## Quick start

```bash
npm install
docker compose up -d postgres   # local PostgreSQL
cp .env.example .env            # or create .env by hand, see below
npm run db:migrate              # create the tables
npm run dev                     # http://localhost:3000
```

## Environment variables

Keep these in `.env`, which is not committed. Never prefix them with `NEXT_PUBLIC_`.

| Variable | Purpose |
| --- | --- |
| `DB_URL_LOCAL` | Local PostgreSQL URL, used when not on Vercel |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Neon URLs; set automatically by the Vercel Neon integration |
| `LLM_PROVIDER` | `gemini` (default) or `deepseek` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Needed for Gemini, e.g. `gemini-3.8-flash` |
| `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` | Needed for DeepSeek; the model defaults to `deepseek-flash` |

Restart `npm run dev` after changing the provider settings.

## How it works

1. **Choose a domain:** Entrepreneurship & Innovation, Business & Leadership,
   Technology & AI, or Sustainability. Then enter a topic title (max 200
   characters) and description (max 5000).
2. **Generate:** the AI returns exactly three independent pathways. Each has
   3–5 sequential milestones over about 12 weeks.
3. **Review:** choose a pathway. Each milestone has 2–3 learning outcomes,
   3–5 steps, 1–2 suggested readings (name and author), and one
   scenario assignment. Select **Edit milestone** to change any part.
4. **Save:** select **Save chosen pathway** to store all of its milestones in a single
   insert. You can then choose another option and save it too. Each saved option
   gets its own `pathway_group_id`, is marked **Saved**, and becomes read-only.
   Unsaved options are never recorded.

**Layout:** once options exist, the topic form collapses to a short summary
(**Edit topic / regenerate** reopens it). On desktop the options stay in a
sticky left column, with the chosen pathway's milestones on the right. On mobile
the options scroll sideways. Milestones open one at a time, and the save bar stays
pinned to the bottom.

Drafts live only in page memory, so reloading the page loses unsaved work.
Generating, editing and discarding never write to the database.

**AI output:** both providers use the prompt in `src/server/services/constant.ts`.
Requests time out after 60 seconds and are limited to 32768 output tokens.
Every response is checked against the same Zod schema, and invalid,
truncated or extra-field responses (such as URLs in readings) are rejected.
AI-suggested readings can still be wrong, so check them before assigning.

## Project structure

```text
app/                    page, layout, global styles (brand color #4214b7)
src/actions/            server actions: validate input, call services
src/server/services/    AI generation, saving, prompt (constant.ts)
src/server/repos/       database queries (the only place that imports the db)
src/server/db/          Drizzle schema and connection
src/shared/             Zod schemas, types, LEARNING_DOMAINS
src/hooks/              useMilestoneForm: client workflow state
src/components/         atoms → molecules (incl. milestone-card/) → organisms
src/test/               test fixtures
drizzle/                SQL migrations
```

Request flow: action → service → repository, for example
`saveMilestoneDraft` → `saveChosenPathway` → `insertMilestones`.

## Database

Drizzle manages one table, `milestones`, with one row per saved milestone. Rows from the
same saved pathway share a `pathway_group_id`. Each row stores:

- the milestone itself: `title`, `description`, `steps`, `learning_outcomes`,
  `resources`, `scenario_assignment`, and `pathway_milestone_id`, its position in the pathway
- the chosen pathway: `pathway_option_id`, `pathway_title`, `pathway_focus`,
  `pathway_description`, `duration`
- the original input: `topic_title`, `topic_description`, `topic_domain`

Columns added later are nullable so older rows stay valid. New saves fill every column.

After changing `src/server/db/schema.ts`, run `npm run db:generate` and then
`npm run db:migrate`.

## Deploying to Vercel with Neon

- Connect the Neon database to the project in Vercel (**Storage**). This adds
  `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
- On Vercel the app connects through Neon's serverless HTTP driver, and migrations
  use the unpooled URL.
- Vercel runs `vercel-build` (`drizzle-kit migrate && next build`), so new
  migrations are applied on every deploy. Don't override the Build Command.
  Keep migrations backward compatible.
- Add the AI provider variables in Vercel as well.
- Any `*.neon.tech` URL uses the Neon driver, and other URLs use `pg`. See
  `src/server/db/url.ts`.

There is no authentication or rate limiting yet. Add both before making the app
public.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `build` / `start` | Develop, build, run in production |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Browse the database |
| `npm run test:milestones` | Generation and validation tests (mocked APIs, no keys needed) |
| `npm run test:components` | Form and review rendering tests |
