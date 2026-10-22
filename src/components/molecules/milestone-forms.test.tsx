import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createPathwayFixture } from "../../test/pathway-fixtures";
import DraftReview from "./DraftReview";
import PathwayOptions from "./PathwayOptions";
import TopicForm from "./TopicForm";

const handlers = {
  onSubmit: () => {},
  onEdit: () => {},
  onToggleEdit: () => {},
};
const draft = createPathwayFixture(5);

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
  assert.equal((html.match(/Suggested reading/g) ?? []).length, 5);
  assert.match(html, /<cite[^>]*>Reading 2\.1<\/cite>/);
  assert.doesNotMatch(html, /href=/);
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
  assert.match(editing, /milestone-4-resource-0-author_or_publisher/);
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
  assert.doesNotMatch(pending, /animate-spin|Generating pathways/);
  const generating = renderToStaticMarkup(
    <TopicForm pending generating hasDraft onSubmit={handlers.onSubmit} />,
  );
  assert.match(generating, /aria-hidden="true" class="[^"]*animate-spin/);
  assert.match(generating, /Generating pathways\.\.\./);
});

test("save button shows a spinner only while saving", () => {
  const render = (saving: boolean) =>
    renderToStaticMarkup(
      <DraftReview
        pathway={draft.pathway_options[0]}
        saved={false}
        editing={[]}
        pending
        saving={saving}
        {...handlers}
      />,
    );
  assert.match(render(true), /animate-spin[^>]*><\/span>Saving\.\.\./);
  assert.doesNotMatch(render(false), /animate-spin|Saving\.\.\./);
});
