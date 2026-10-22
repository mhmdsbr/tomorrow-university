import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import {
  pathwaySuggestionsSchema,
  pathwaySaveSchema,
  topicSchema,
} from "../../shared/milestones";
import { createPathwayFixture } from "../../test/pathway-fixtures";
import { MILESTONE_PROMPT } from "./constant";
import { generateMilestones } from "./milestone-generation";

const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;
const originalProvider = process.env.LLM_PROVIDER;
const originalDeepSeekKey = process.env.DEEPSEEK_API_KEY;
const originalDeepSeekModel = process.env.DEEPSEEK_MODEL;
beforeEach(() => {
  delete process.env.LLM_PROVIDER;
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_MODEL;
});
afterEach(() => {
  mock.restoreAll();
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = originalModel;
  if (originalProvider === undefined) delete process.env.LLM_PROVIDER;
  else process.env.LLM_PROVIDER = originalProvider;
  if (originalDeepSeekKey === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = originalDeepSeekKey;
  if (originalDeepSeekModel === undefined) delete process.env.DEEPSEEK_MODEL;
  else process.env.DEEPSEEK_MODEL = originalDeepSeekModel;
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

function mockDeepSeekResponse(output: unknown, finishReason = "stop") {
  process.env.LLM_PROVIDER = "deepseek";
  process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
  const response: typeof fetch = async () =>
    Response.json({
      choices: [
        {
          finish_reason: finishReason,
          message: { content: JSON.stringify(output) },
        },
      ],
    });
  return mock.method(globalThis, "fetch", response);
}

test("DeepSeek sends the same prompt with JSON output and thinking disabled", async () => {
  const draft = createPathwayFixture();
  const fetchMock = mockDeepSeekResponse(draft);
  assert.deepEqual(await generateMilestones(draft.topic), draft);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "https://api.deepseek.com/chat/completions");
  assert.ok(options);
  assert.equal(
    new Headers(options.headers).get("Authorization"),
    "Bearer test-deepseek-key",
  );
  assert.equal(
    new Headers(options.headers).get("Content-Type"),
    "application/json",
  );
  assert.equal(options.method, "POST");
  assert.equal(options.cache, "no-store");
  assert.ok(options.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(String(options.body)), {
    model: "deepseek-flash",
    messages: [
      { role: "system", content: MILESTONE_PROMPT },
      { role: "user", content: JSON.stringify(draft.topic) },
    ],
    max_tokens: 32768,
    response_format: { type: "json_object" },
    thinking: { type: "disabled" },
    temperature: 0,
    stream: false,
  });
});

test("DeepSeek supports a configured model", async () => {
  const draft = createPathwayFixture();
  const fetchMock = mockDeepSeekResponse(draft);
  process.env.DEEPSEEK_MODEL = "deepseek-v4-pro";
  await generateMilestones(draft.topic);
  const [, options] = fetchMock.mock.calls[0].arguments;
  const request = JSON.parse(String(options?.body));
  assert.equal(request.model, "deepseek-v4-pro");
  assert.equal(request.messages[0].content, MILESTONE_PROMPT);
});

test("DeepSeek rejects truncated output, invalid pathway structures and malformed responses", async () => {
  const draft = createPathwayFixture();
  for (const reason of ["length", "content_filter", "tool_calls", ""]) {
    mockDeepSeekResponse(draft, reason);
    await assert.rejects(generateMilestones(draft.topic));
    mock.restoreAll();
  }
  mockDeepSeekResponse({
    ...draft,
    pathway_options: draft.pathway_options.slice(0, 2),
  });
  await assert.rejects(generateMilestones(draft.topic));
  mock.restoreAll();
  process.env.LLM_PROVIDER = "deepseek";
  for (const response of [
    { choices: [] },
    { choices: [{ finish_reason: "stop", message: { content: null } }] },
    { choices: [{ finish_reason: "stop", message: { content: "not JSON" } }] },
    {
      choices: [
        { finish_reason: "stop", message: { content: "```json\n{}\n```" } },
      ],
    },
  ]) {
    mock.method(globalThis, "fetch", async () => Response.json(response));
    await assert.rejects(generateMilestones(draft.topic));
    mock.restoreAll();
  }
});

test("DeepSeek exposes HTTP and network errors without falling back to Gemini", async () => {
  const draft = createPathwayFixture();
  mockDeepSeekResponse(draft);
  mock.restoreAll();
  for (const status of [401, 429, 500]) {
    const fetchMock = mock.method(
      globalThis,
      "fetch",
      async () => new Response("Provider error", { status }),
    );
    await assert.rejects(
      generateMilestones(draft.topic),
      new RegExp(`HTTP ${status}`),
    );
    assert.equal(fetchMock.mock.calls.length, 1);
    mock.restoreAll();
  }
  mock.method(globalThis, "fetch", async () => {
    throw new DOMException("Request timed out", "TimeoutError");
  });
  await assert.rejects(generateMilestones(draft.topic), /timed out/);
});

test("invalid provider configuration fails before making a network request", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  const topic = createPathwayFixture().topic;
  process.env.LLM_PROVIDER = "unknown";
  await assert.rejects(generateMilestones(topic), /LLM_PROVIDER/);
  process.env.LLM_PROVIDER = "nvidia";
  await assert.rejects(generateMilestones(topic), /LLM_PROVIDER/);
  process.env.LLM_PROVIDER = "llm7";
  await assert.rejects(generateMilestones(topic), /LLM_PROVIDER/);
  process.env.LLM_PROVIDER = "deepseek";
  await assert.rejects(generateMilestones(topic), /DEEPSEEK_API_KEY/);
  process.env.DEEPSEEK_API_KEY = " ";
  await assert.rejects(generateMilestones(topic), /DEEPSEEK_API_KEY/);
  process.env.DEEPSEEK_API_KEY = "test-key";
  process.env.DEEPSEEK_MODEL = " ";
  await assert.rejects(generateMilestones(topic), /DEEPSEEK_MODEL/);
  assert.equal(fetchMock.mock.calls.length, 0);
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
  for (const count of [0, 1, 2, 3]) {
    const draft = createPathwayFixture();
    draft.pathway_options[0].milestones[1].resources = Array.from(
      { length: count },
      () => ({ title: "A book", author_or_publisher: "An author" }),
    );
    assert.equal(
      pathwaySuggestionsSchema.safeParse(draft).success,
      count >= 1 && count <= 2,
    );
  }
  const linked = createPathwayFixture();
  Object.assign(linked.pathway_options[0].milestones[0].resources[0], {
    url: "https://example.com",
  });
  assert.equal(pathwaySuggestionsSchema.safeParse(linked).success, false);
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
