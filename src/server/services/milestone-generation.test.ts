import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { milestoneDraftSchema, milestoneSchema } from "../shared/milestones";
import { generateMilestones, MILESTONE_PROMPT } from "./milestone-generation";

const topic = {
  title: "Sustainable food systems",
  description: "Explore the impacts of campus food systems.",
};
const draft = {
  milestones: [
    { title: "Understand", description: "Map key impacts." },
    { title: "Apply", description: "Analyze a campus food system." },
    { title: "Evaluate", description: "Design and justify improvements." },
  ],
};
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

test("validates exactly three non-empty milestones and trims approved text", () => {
  assert.equal(milestoneDraftSchema.safeParse(draft).success, true);
  for (const count of [0, 1, 2, 4]) {
    const milestones = Array.from({ length: count }, () => draft.milestones[0]);
    assert.equal(milestoneDraftSchema.safeParse({ milestones }).success, false);
  }
  assert.equal(
    milestoneSchema.safeParse({ ...topic, title: "  " }).success,
    false,
  );
  assert.equal(
    milestoneSchema.safeParse({ ...topic, description: "  " }).success,
    false,
  );
  assert.equal(
    milestoneSchema.safeParse({ ...topic, title: "a".repeat(201) }).success,
    false,
  );
  assert.equal(
    milestoneSchema.safeParse({ ...topic, description: "a".repeat(5001) })
      .success,
    false,
  );
  assert.deepEqual(
    milestoneSchema.parse({ title: " Title ", description: " Description " }),
    { title: "Title", description: "Description" },
  );
});

test("requests structured Gemini output with a server-side prompt", async () => {
  const fetchMock = mockResponse(draft);
  assert.deepEqual(await generateMilestones(topic), draft);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.ok(options);
  assert.match(String(url), /models\/test-model:generateContent$/);
  assert.equal(new Headers(options.headers).get("x-goog-api-key"), "test-key");
  const request = JSON.parse(String(options.body));
  assert.equal(request.systemInstruction.parts[0].text, MILESTONE_PROMPT);
  assert.deepEqual(JSON.parse(request.contents[0].parts[0].text), topic);
  assert.equal(request.generationConfig.responseMimeType, "application/json");
  const schema =
    request.generationConfig.responseJsonSchema.properties.milestones;
  assert.equal(schema.minItems, 3);
  assert.equal(schema.maxItems, 3);
  assert.equal(options.cache, "no-store");
});

test("rejects invalid generated counts and incomplete responses", async () => {
  mockResponse({ milestones: draft.milestones.slice(0, 2) });
  await assert.rejects(generateMilestones(topic));
  mock.restoreAll();
  mockResponse(draft, "MAX_TOKENS");
  await assert.rejects(generateMilestones(topic));
});

test("rejects malformed JSON, blocked output and HTTP failures", async () => {
  mockResponse(draft);
  mock.method(globalThis, "fetch", async () =>
    Response.json({
      candidates: [
        {
          finishReason: "STOP",
          content: { parts: [{ text: "not JSON" }] },
        },
      ],
    }),
  );
  await assert.rejects(generateMilestones(topic), SyntaxError);
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () =>
    Response.json({ candidates: [] }),
  );
  await assert.rejects(generateMilestones(topic));
  mock.restoreAll();
  mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 429 }),
  );
  await assert.rejects(generateMilestones(topic), /HTTP 429/);
});

test("propagates network failures and rejects missing server configuration", async () => {
  mockResponse(draft);
  mock.method(globalThis, "fetch", async () => {
    throw new DOMException("Request timed out", "TimeoutError");
  });
  await assert.rejects(generateMilestones(topic), /timed out/);
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(generateMilestones(topic), /GEMINI_API_KEY/);
});
