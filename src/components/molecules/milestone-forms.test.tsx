import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import DraftReview from "./DraftReview";
import TopicForm from "./TopicForm";

const draft = {
  milestones: [1, 2, 3].map((position) => ({
    title: `Learning milestone ${position}`,
    description: `Learning activity ${position}`,
  })),
};

const handlers = {
  onSubmit: () => {},
  onEdit: () => {},
  onDiscard: () => {},
};

test("topic form preserves accessible fields and native validation", () => {
  const html = renderToStaticMarkup(
    <TopicForm pending={false} hasDraft={false} onSubmit={handlers.onSubmit} />,
  );
  assert.match(html, /for="title"/);
  assert.match(
    html,
    /<input(?=[^>]*name="title")(?=[^>]*required="")(?=[^>]*maxLength="200")/,
  );
  assert.match(html, /for="description"/);
  assert.match(
    html,
    /<textarea[^>]*name="description"[^>]*required=""[^>]*maxLength="5000"/,
  );
  assert.match(html, /type="submit"/);
  assert.match(html, /Generate three milestones/);
  assert.doesNotMatch(html, /<fieldset disabled/);
});

test("pending topic form disables submission and offers regeneration for a draft", () => {
  const pendingHtml = renderToStaticMarkup(
    <TopicForm pending hasDraft onSubmit={handlers.onSubmit} />,
  );
  assert.match(pendingHtml, /<fieldset disabled=""/);
  assert.match(pendingHtml, /Working\.\.\./);
  const readyHtml = renderToStaticMarkup(
    <TopicForm pending={false} hasDraft onSubmit={handlers.onSubmit} />,
  );
  assert.match(readyHtml, /Generate a new draft/);
});

test("draft review renders three editable cards with approval and discard controls", () => {
  const html = renderToStaticMarkup(
    <DraftReview draft={draft} saved={false} pending={false} {...handlers} />,
  );
  assert.equal((html.match(/<h2/g) ?? []).length, 3);
  assert.equal((html.match(/<input/g) ?? []).length, 3);
  assert.equal((html.match(/<textarea/g) ?? []).length, 3);
  assert.match(html, /value="Learning milestone 1"/);
  assert.match(html, /Learning activity 3/);
  assert.match(html, /for="milestone-title-0"/);
  assert.match(html, /for="milestone-description-2"/);
  assert.match(html, /Approve and save all three/);
  assert.match(html, /type="button"[^>]*>Discard draft/);
});

test("pending and saved reviews are disabled and saved content cannot be resubmitted", () => {
  const pendingHtml = renderToStaticMarkup(
    <DraftReview draft={draft} saved={false} pending {...handlers} />,
  );
  assert.match(pendingHtml, /<fieldset disabled=""/);
  const savedHtml = renderToStaticMarkup(
    <DraftReview draft={draft} saved pending={false} {...handlers} />,
  );
  assert.match(savedHtml, /<fieldset disabled=""/);
  assert.match(savedHtml, /Saved milestones/);
  assert.doesNotMatch(savedHtml, /Approve and save|Discard draft/);
  assert.match(savedHtml, /Learning milestone 1/);
});
