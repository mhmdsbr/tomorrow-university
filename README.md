# tomorrow-university

Small app to showcase learning products to user to be reviewed

## Database

The app uses Drizzle ORM with PostgreSQL. Its only application table is
`milestones`, with required milestone text columns `title` and `description`,
plus `topic_title` and `topic_description` storing the original user input
alongside each milestone of the chosen pathway. The topic columns are nullable to preserve
older rows whose original input is unknown; new saves require both.
An ordered `steps` JSONB array stores each milestone's 3-5 steps, each with a
title, description, and explicit `order`. New saves also include the pathway's
`duration`, its sequential `pathway_milestone_id`, 2-3 `learning_outcomes` (JSONB),
1-2 suggested `resources` (JSONB: title and author_or_publisher, no links),
and one `scenario_assignment` (JSONB: title, scenario, task, student_output).
Added columns are nullable for pre-existing rows; new generation and saving
require all pathway fields. Legacy step arrays are preserved without modification.
The pathway milestone ID is an ordinal within a pathway, not a database primary
key. Duplicate titles are allowed.
Each newly saved pathway is grouped by a server-generated `pathway_group_id`
(UUID) shared by all its milestone rows. `pathway_option_id`, `pathway_title`,
`pathway_focus`, and `pathway_description` preserve the chosen suggestion.
Only that pathway is recorded, not the other alternatives.

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
  topicTitle: "Sustainable food systems",
  topicDescription: "Explore campus food sourcing and waste.",
  duration: "3 months",
  pathwayMilestoneId: 1,
  pathwayGroupId: crypto.randomUUID(),
  pathwayOptionId: 1,
  pathwayTitle: "Campus systems analysis",
  pathwayFocus: "Systems mapping and evidence",
  pathwayDescription:
    "You investigate campus food flows and justify an improvement.",
  learningOutcomes: [
    "You can explain the main campus food flows.",
    "You can map the impacts of a food system.",
  ],
  resources: [
    { title: "Thinking in Systems: A Primer", author_or_publisher: "Donella H. Meadows" },
  ],
  scenarioAssignment: {
    title: "Simulated campus food review",
    scenario: "Your university is reviewing food procurement.",
    task: "You map impacts and identify evidence gaps.",
    student_output: "An annotated systems map and evidence checklist.",
  },
  steps: [
    {
      order: 1,
      title: "Explore",
      description: "Identify campus food sources.",
    },
    {
      order: 2,
      title: "Investigate",
      description: "Map resource flows and waste.",
    },
    {
      order: 3,
      title: "Reflect",
      description: "Explain the key sustainability impacts.",
    },
  ],
});

const allMilestones = await db.select().from(milestones);
```

## Generating and choosing a learning pathway

Select the server-side provider with `LLM_PROVIDER=gemini` or
`LLM_PROVIDER=deepseek` in your untracked `.env` file. If omitted, Gemini remains
the default. Unknown values produce an error; providers are never switched
automatically after a failure.

For Gemini, set `GEMINI_API_KEY` and `GEMINI_MODEL`.
Choose a Gemini model supporting JSON-schema structured output (for example,
`gemini-3.8-flash`, subject to availability in your account). The key is used
only on the server; never prefix it with `NEXT_PUBLIC_`.

Generation uses the official `@google/genai` SDK through
`GoogleGenAI.models.generateContent()`, with a 60-second timeout and JSON-schema
structured output. Responses are validated with Zod before becoming drafts.

For DeepSeek, create an API key in the [DeepSeek platform](https://platform.deepseek.com/api_keys)
and configure:

```dotenv
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-key-here
DEEPSEEK_MODEL=deepseek-flash
```

The `deepseek-flash` model is used when `DEEPSEEK_MODEL` is omitted.
Requests use server-side `fetch` to
`https://api.deepseek.com/chat/completions`, with a 60-second timeout
and a 32768 output-token limit. No additional SDK is required.
Requests enable JSON output (`response_format: { type: "json_object" }`)
and disable thinking mode to focus the token budget on the requested pathways.
You may set `DEEPSEEK_MODEL=deepseek-v4-pro` instead. Choose a model supporting
these request options and the output budget.

DeepSeek JSON output ensures JSON syntax, not the complete pathway schema.
Both providers must pass the same Zod validation;
truncated responses, invalid JSON, and invalid pathway structures are rejected,
not repaired or saved. API keys stay on the server; never use `NEXT_PUBLIC_`
for any provider credential. Restart the development server after changing the
provider configuration.

See [DeepSeek's API reference](https://api-docs.deepseek.com/api/create-chat-completion/).
This replaces the LLM7 integration; set `LLM_PROVIDER=deepseek` instead of
`llm7` and configure a new DeepSeek key. Old LLM7 environment variables are
not used or automatically migrated.

Run `npm run dev` and open the home page:

1. Enter a topic title and description. There is no predefined topic list.
2. Select **Generate three pathway options**. The topic is sent to the configured AI provider
   using the teaching prompt in `src/server/services/milestone-generation.ts`.
   The output contains `topic`, `duration: "3 months"`, and exactly three
   `pathway_options`. Each alternative has an ID, title, focus, description,
   and 3-5 sequential milestones. The alternatives are independent journeys,
   not phases of one curriculum.
3. Compare the three option cards and choose one with its radio control.
   No option is chosen by default. The chosen pathway's milestones appear below.
   Each milestone contains 2-3 learning outcomes, 3-5 ordered
   learning steps, 1-2 suggested readings (article or book name and author or
   publisher, without links), and exactly one scenario assignment at the end.
   Milestones and steps each have their own title and description.
   They are read-only until you select **Edit milestone**, which also unlocks
   its outcomes, steps, suggested readings, and scenario assignment; **Done editing** returns the
   whole card to reading mode.
4. Switch between options to review their milestones; edits to each option
   remain preserved. There are no milestone or step checkboxes.
5. Select **Save chosen pathway** to save all 3-5 milestones in that pathway.
   The other options are not recorded. Saving is unavailable until an option is
   chosen and locks the choice and content after success. Generate new options
   or discard the draft to start again.

Generating, editing, regenerating, and discarding do not write to the database.
Drafts, edits, and the pathway choice exist only in page memory: reloading or
leaving the page clears anything that has not been saved. Discarding removes the
draft but keeps the current topic input.
Generation validates exactly three options, each with 3-5 milestones,
2-3 outcomes, 3-5 consecutively ordered
steps, 1-2 suggested readings, and exactly one complete scenario assignment each.
Readings are names only; responses containing extra resource fields such as URLs
are rejected. The model is told to name only works it is confident exist, but
AI-suggested references can still be wrong, so check them before assigning. IDs are consecutive
starting at 1 within each option. Saving validates one complete chosen pathway
and writes all its milestones in a single
atomic insert, including the topic title and description on every selected row.
The topic is captured when generation succeeds: changing the input fields later
does not change the source topic associated with the existing draft.
Neither the topic nor milestones are stored before explicit saving.

GSAP provides scoped entrance, staggered card, and selection transitions.
Animations clean up on unmount and respect `prefers-reduced-motion`.

Input titles are limited to 200 characters and descriptions to 5000 characters.
Generation has a 60-second timeout and a 32768 output-token budget for the larger
three-option response. Choose a model supporting this output budget, and configure your hosting request timeout
accordingly. Errors are shown in the UI, and unsuccessful saves preserve the draft.
This prototype has no authentication or rate limiting; add both before making
the generation endpoint publicly accessible.

UI components live in `src/components/`, organized by atomic design:

- `atoms/`: shared buttons, headings, and typography.
- `molecules/`: labeled form fields, topic form, milestone cards, and draft review.
  `molecules/milestone-card/` holds the card's sections (summary, outcomes,
  steps, suggested reading, scenario assignment), each switching between
  reading and edit mode.
- `organisms/MilestoneForm.tsx`: UI composition and scoped GSAP animations.
- `src/hooks/useMilestoneForm.ts`: generation, editing, pathway selection,
  approval, and feedback workflow.

Server actions live in `src/actions/`. They validate requests and call services in
`src/server/services/`; only services call repositories in `src/server/repos/`.
For example, saving flows from `saveMilestoneDraft` to `saveChosenPathway` and
then `insertMilestones`. The page remains a Server Component; only
the form organism and its dependencies are included in the interactive client UI.

Run `npm run test:milestones` for generation and validation tests. These exercise
the Gemini SDK and DeepSeek chat API with mocked network responses and do not send external requests
or require an API key.
Run `npm run test:components` to check the topic and draft-review rendering,
field validation attributes, and pending/saved controls.
