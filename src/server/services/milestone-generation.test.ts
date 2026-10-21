import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import {
  pathwaySuggestionsSchema,
  pathwaySaveSchema,
  topicSchema,
} from "../shared/milestones";
import { createPathwayFixture } from "../shared/pathway-fixtures";
import { generateMilestones, MILESTONE_PROMPT } from "./milestone-generation";

const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;
afterEach(() => {
  mock.restoreAll();
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = originalModel;
});

function mockResponse(output: unknown, finishReason = "STOP") {
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_MODEL = "test-model";
  const response: typeof fetch = async () =>
    Response.json({
      candidates: [
        {
          finishReason,
          content: { parts: [{ text: JSON.stringify(output) }] },
        },
      ],
    });
  return mock.method(globalThis, "fetch", response);
}

test("SDK requests the exact prompt and structured three-option schema", async () => {
  const draft = createPathwayFixture();
  const fetchMock = mockResponse(draft);
  assert.deepEqual(await generateMilestones(draft.topic), draft);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.ok(options);
  assert.match(String(url), /models\/test-model:generateContent$/);
  assert.equal(new Headers(options.headers).get("x-goog-api-key"), "test-key");
  const request = JSON.parse(String(options.body));
  assert.equal(request.systemInstruction.parts[0].text, MILESTONE_PROMPT);
  assert.match(
    MILESTONE_PROMPT,
    /three distinct alternative learning pathway suggestions/,
  );
  assert.deepEqual(request.contents, [
    { role: "user", parts: [{ text: JSON.stringify(draft.topic) }] },
  ]);
  assert.deepEqual(
    request.generationConfig.responseJsonSchema,
    pathwaySuggestionsSchema.toJSONSchema(),
  );
  assert.equal(request.generationConfig.responseMimeType, "application/json");
  assert.equal(request.generationConfig.maxOutputTokens, 32768);
  assert.ok(options.signal instanceof AbortSignal);
});

test("requires exactly three options, each with 3-5 sequential milestones", async () => {
  for (const count of [0, 1, 2, 3, 4]) {
    const draft = createPathwayFixture();
    draft.pathway_options = Array.from({ length: count }, (_, index) => ({
      ...draft.pathway_options[0],
      id: index + 1,
    }));
    assert.equal(
      pathwaySuggestionsSchema.safeParse(draft).success,
      count === 3,
    );
  }
  for (const count of [0, 1, 2, 3, 4, 5, 6]) {
    const draft = createPathwayFixture(count);
    mockResponse(draft);
    if (count >= 3 && count <= 5)
      assert.deepEqual(await generateMilestones(draft.topic), draft);
    else await assert.rejects(generateMilestones(draft.topic));
    mock.restoreAll();
  }
  const draft = createPathwayFixture();
  draft.pathway_options[1].id = 1;
  assert.equal(pathwaySuggestionsSchema.safeParse(draft).success, false);
  const unordered = createPathwayFixture();
  unordered.pathway_options[2].milestones.reverse();
  assert.equal(pathwaySuggestionsSchema.safeParse(unordered).success, false);
});

test("validates outcomes, ordered steps, single scenario and duration in every option", () => {
  for (const count of [0, 1, 2, 3, 4]) {
    const draft = createPathwayFixture();
    draft.pathway_options[2].milestones[1].learning_outcomes = Array.from(
      { length: count },
      () => "You explain concepts.",
    );
    assert.equal(
      pathwaySuggestionsSchema.safeParse(draft).success,
      count >= 2 && count <= 3,
    );
  }
  for (const count of [0, 1, 2, 3, 4, 5, 6]) {
    const draft = createPathwayFixture();
    draft.pathway_options[1].milestones[2].steps = Array.from(
      { length: count },
      (_, index) => ({
        order: index + 1,
        title: "Activity",
        description: "You map evidence.",
      }),
    );
    assert.equal(
      pathwaySuggestionsSchema.safeParse(draft).success,
      count >= 3 && count <= 5,
    );
  }
  for (const scenario_assignment of [
    undefined,
    {},
    [],
    [{ title: "Not an object" }],
  ]) {
    const draft = createPathwayFixture();
    const milestone = draft.pathway_options[0].milestones[0];
    assert.equal(
      pathwaySuggestionsSchema.safeParse({
        ...draft,
        pathway_options: [
          {
            ...draft.pathway_options[0],
            milestones: [
              { ...milestone, scenario_assignment },
              ...draft.pathway_options[0].milestones.slice(1),
            ],
          },
          ...draft.pathway_options.slice(1),
        ],
      }).success,
      false,
    );
  }
  const draft = createPathwayFixture();
  draft.pathway_options[0].milestones[0].steps.reverse();
  assert.equal(pathwaySuggestionsSchema.safeParse(draft).success, false);
  assert.equal(
    pathwaySuggestionsSchema.safeParse({
      ...createPathwayFixture(),
      duration: "6 months",
    }).success,
    false,
  );
});

test("save requires one complete pathway, not multiple options or too few milestones", () => {
  const draft = createPathwayFixture(5);
  for (const pathway of draft.pathway_options) {
    assert.equal(
      pathwaySaveSchema.safeParse({
        topic: draft.topic,
        duration: draft.duration,
        pathway,
      }).success,
      true,
    );
  }
  assert.equal(pathwaySaveSchema.safeParse(draft).success, false);
  assert.equal(
    pathwaySaveSchema.safeParse({
      topic: draft.topic,
      duration: draft.duration,
      pathway: {
        ...draft.pathway_options[0],
        milestones: draft.pathway_options[0].milestones.slice(0, 2),
      },
    }).success,
    false,
  );
  assert.equal(
    pathwaySaveSchema.safeParse({
      duration: draft.duration,
      pathway: draft.pathway_options[0],
    }).success,
    false,
  );
  assert.equal(
    topicSchema.safeParse({ title: " ", description: "Description" }).success,
    false,
  );
});

test("rejects incomplete, blocked and malformed SDK output", async () => {
  const draft = createPathwayFixture();
  mockResponse(draft, "MAX_TOKENS");
  await assert.rejects(generateMilestones(draft.topic));
  mock.restoreAll();
  mockResponse(draft);
  mock.method(globalThis, "fetch", async () =>
    Response.json({ candidates: [] }),
  );
  await assert.rejects(generateMilestones(draft.topic));
  mock.restoreAll();
  mockResponse(draft);
  mock.method(globalThis, "fetch", async () =>
    Response.json({
      candidates: [
        { finishReason: "STOP", content: { parts: [{ text: "not JSON" }] } },
      ],
    }),
  );
  await assert.rejects(generateMilestones(draft.topic), SyntaxError);
});

test("propagates API and timeout errors and requires server configuration", async () => {
  const draft = createPathwayFixture();
  mockResponse(draft);
  mock.method(globalThis, "fetch", async () => {
    throw new Error("HTTP 429");
  });
  await assert.rejects(generateMilestones(draft.topic), /429/);
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => {
    throw new DOMException("Request timed out", "TimeoutError");
  });
  await assert.rejects(generateMilestones(draft.topic), /timed out/);
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(generateMilestones(draft.topic), /GEMINI_API_KEY/);
  process.env.GEMINI_API_KEY = "test-key";
  delete process.env.GEMINI_MODEL;
  await assert.rejects(generateMilestones(draft.topic), /GEMINI_MODEL/);
});
