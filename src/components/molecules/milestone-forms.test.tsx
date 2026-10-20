import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import DraftReview from "./DraftReview";
import TopicForm from "./TopicForm";
import MilestoneCard from "./MilestoneCard";
import {
  milestoneDraftSchema,
  milestoneSelectionSchema,
} from "../../server/shared/milestones";

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
  onSelect: () => {},
  onToggleEdit: () => {},
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

test("draft review defaults to read-only selectable cards with saving disabled", () => {
  const html = renderToStaticMarkup(
    <DraftReview
      draft={draft}
      saved={[]}
      selected={[]}
      editing={[]}
      pending={false}
      {...handlers}
    />,
  );
  assert.equal((html.match(/<h2/g) ?? []).length, 3);
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<textarea/);
  assert.match(html, /Learning milestone 1/);
  assert.match(html, /Learning activity 3/);
  assert.match(html, /aria-label="Select milestone 1"/);
  assert.match(html, /aria-label="Edit milestone 3"/);
  assert.match(html, /type="submit" disabled=""[^>]*>Save selected \(0\)/);
  assert.match(html, /type="button"[^>]*>Discard unsaved drafts/);
});

test("pending and fully saved reviews are disabled and saved content cannot be resubmitted", () => {
  const pendingHtml = renderToStaticMarkup(
    <DraftReview
      draft={draft}
      saved={[]}
      selected={[0]}
      editing={[]}
      pending
      {...handlers}
    />,
  );
  assert.match(pendingHtml, /<fieldset disabled=""/);
  const savedHtml = renderToStaticMarkup(
    <DraftReview
      draft={draft}
      saved={[0, 1, 2]}
      selected={[]}
      editing={[]}
      pending={false}
      {...handlers}
    />,
  );
  assert.match(savedHtml, /<fieldset disabled=""/);
  assert.match(savedHtml, /Your saved milestones/);
  assert.doesNotMatch(
    savedHtml,
    /Save selected|Discard unsaved drafts|Edit milestone/,
  );
  assert.match(savedHtml, /Learning milestone 1/);
});

test("only editing cards expose inputs and partial saves leave other drafts available", () => {
  const html = renderToStaticMarkup(
    <DraftReview
      draft={draft}
      saved={[0]}
      selected={[2]}
      editing={[2]}
      pending={false}
      {...handlers}
    />,
  );
  assert.equal((html.match(/<textarea/g) ?? []).length, 1);
  assert.match(html, /for="milestone-title-2"/);
  assert.match(html, /for="milestone-description-2"/);
  assert.match(html, /aria-label="Done editing milestone 3"/);
  assert.match(html, /Save selected \(1\)/);
  assert.match(html, /1 selected · 1 saved/);
  assert.doesNotMatch(html, /aria-label="Edit milestone 1"/);
});

test("unselected edited cards do not block selected cards with native required validation", () => {
  const html = renderToStaticMarkup(
    <MilestoneCard
      milestone={draft.milestones[0]}
      index={0}
      selected={false}
      editing
      saved={false}
      pending={false}
      {...handlers}
    />,
  );
  assert.doesNotMatch(html, /required=""/);
});

test("saving permits one to three milestones while generation still requires exactly three", () => {
  for (const count of [0, 1, 2, 3, 4]) {
    const value = {
      milestones: Array.from({ length: count }, () => draft.milestones[0]),
    };
    assert.equal(
      milestoneSelectionSchema.safeParse(value).success,
      count >= 1 && count <= 3,
    );
    assert.equal(milestoneDraftSchema.safeParse(value).success, count === 3);
  }
  assert.equal(
    milestoneSelectionSchema.safeParse({
      milestones: [{ title: " ", description: "Valid description" }],
    }).success,
    false,
  );
});
