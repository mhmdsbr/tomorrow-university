import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createPathwayFixture } from "../../server/shared/pathway-fixtures";
import {
  milestoneSessionSchema,
  restoreMilestoneSession,
} from "../organisms/milestone-session";
import DraftReview from "./DraftReview";
import PathwayOptions from "./PathwayOptions";
import TopicForm from "./TopicForm";

const handlers = {
  onSubmit: () => {},
  onEdit: () => {},
  onToggleEdit: () => {},
};
const draft = createPathwayFixture(5);
const session = {
  version: 3,
  topicInput: draft.topic,
  draftTopic: draft.topic,
  draft,
  selectedPathwayId: 3,
  saved: false,
  editing: [4],
  legacy: false,
};

test("three alternatives have exactly three mutually exclusive radio controls", () => {
  const html = renderToStaticMarkup(
    <PathwayOptions
      options={draft.pathway_options}
      selectedId={2}
      disabled={false}
      onChoose={() => {}}
    />,
  );
  assert.equal((html.match(/type="radio"/g) ?? []).length, 3);
  assert.equal((html.match(/checked=""/g) ?? []).length, 1);
  assert.equal((html.match(/name="pathway-choice"/g) ?? []).length, 3);
  for (const option of draft.pathway_options) {
    assert.match(html, new RegExp(option.title));
    assert.match(html, new RegExp(option.focus));
  }
  assert.match(html, /independent alternatives/);
});

test("chosen pathway renders all sequential milestones without internal selection controls", () => {
  const html = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[1]}
      saved={false}
      editing={[]}
      pending={false}
      {...handlers}
    />,
  );
  assert.equal((html.match(/data-milestone-card/g) ?? []).length, 5);
  assert.doesNotMatch(html, /type="checkbox"|type="radio"|<textarea/);
  assert.match(html, /Sequential milestones/);
  assert.match(html, /Pathway 2 milestone 5/);
  assert.doesNotMatch(html, /Pathway 1 milestone/);
  assert.match(html, /Save chosen pathway \(5 milestones\)/);
  assert.equal((html.match(/Scenario assignment/g) ?? []).length, 5);
});

test("edit unlocks outcomes, steps and scenario, while saved pathway cannot be resubmitted", () => {
  const editing = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[0]}
      saved={false}
      editing={[4]}
      pending={false}
      {...handlers}
    />,
  );
  assert.match(editing, /milestone-4-outcome-0/);
  assert.match(editing, /milestone-4-step-0-title/);
  assert.match(editing, /milestone-4-assignment-student_output/);
  assert.match(editing, /Done editing milestone 5/);
  const saved = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[0]}
      saved
      editing={[]}
      pending={false}
      {...handlers}
    />,
  );
  assert.match(saved, /<fieldset disabled=""/);
  assert.doesNotMatch(saved, /Save chosen pathway|Edit milestone/);
});

test("topic form retains native validation and displays new option generation action", () => {
  const html = renderToStaticMarkup(
    <TopicForm pending={false} hasDraft={false} onSubmit={handlers.onSubmit} />,
  );
  assert.match(html, /for="title"/);
  assert.match(html, /for="description"/);
  assert.match(html, /maxLength="200"/);
  assert.match(html, /maxLength="5000"/);
  assert.match(html, /Generate three pathway options/);
  const pending = renderToStaticMarkup(
    <TopicForm pending hasDraft onSubmit={handlers.onSubmit} />,
  );
  assert.match(pending, /<fieldset disabled=""/);
});

test("partially saved legacy drafts are archived without claiming every milestone was saved", () => {
  const html = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[0]}
      saved
      archived
      editing={[]}
      pending={false}
      {...handlers}
    />,
  );
  assert.match(html, /Your archived legacy draft/);
  assert.match(html, /Some or all milestones/);
  assert.doesNotMatch(
    html,
    /all its milestones have been saved|Save chosen pathway|Edit milestone/,
  );
});

test("session preserves choice, per-option edits, unfinished fields and saved lock", () => {
  const state = structuredClone(session);
  state.draft.pathway_options[2].milestones[4].title = "";
  assert.deepEqual(
    milestoneSessionSchema.parse(JSON.parse(JSON.stringify(state))),
    state,
  );
  assert.equal(
    milestoneSessionSchema.safeParse({ ...state, selectedPathwayId: 4 })
      .success,
    false,
  );
  assert.equal(
    milestoneSessionSchema.safeParse({ ...state, selectedPathwayId: null })
      .success,
    false,
  );
  assert.equal(
    milestoneSessionSchema.safeParse({ ...state, saved: true }).success,
    false,
  );
  assert.equal(
    milestoneSessionSchema.safeParse({ ...state, saved: true, editing: [] })
      .success,
    true,
  );
  assert.equal(
    milestoneSessionSchema.safeParse({ ...state, draft: null }).success,
    false,
  );
});

test("legacy single pathways remain one archived option, not fabricated alternatives", () => {
  const previous = {
    version: 2,
    topicInput: draft.topic,
    draftTopic: draft.topic,
    draft: {
      topic: draft.topic,
      duration: draft.duration,
      milestones: draft.pathway_options[0].milestones,
    },
    saved: [0],
    selected: [4],
    editing: [4],
  };
  const { state, migrated } = restoreMilestoneSession(previous);
  assert.equal(migrated, true);
  assert.equal(state.version, 3);
  assert.equal(state.legacy, true);
  assert.equal(state.draft?.pathway_options.length, 1);
  assert.deepEqual(
    state.draft?.pathway_options[0].milestones,
    previous.draft.milestones,
  );
  assert.equal(state.saved, true);
  assert.deepEqual(state.editing, []);
  assert.deepEqual(restoreMilestoneSession(state).state, state);
});

test("oldest sessions retain steps and leave missing academic content blank", () => {
  const old = {
    version: 1,
    topicInput: draft.topic,
    draftTopic: draft.topic,
    saved: [],
    selected: [],
    editing: [1],
    draft: {
      milestones: draft.pathway_options[0].milestones
        .slice(0, 3)
        .map((milestone) => ({
          title: milestone.title,
          description: milestone.description,
          steps: milestone.steps.map(({ title, description }) => ({
            title,
            description,
          })),
        })),
    },
  };
  const { state } = restoreMilestoneSession(old);
  assert.equal(state.saved, false);
  assert.deepEqual(
    state.draft?.pathway_options[0].milestones[0].learning_outcomes,
    ["", ""],
  );
  assert.equal(
    state.draft?.pathway_options[0].milestones[0].scenario_assignment.task,
    "",
  );
});
