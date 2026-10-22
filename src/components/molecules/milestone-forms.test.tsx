import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LEARNING_DOMAINS } from "../../shared/milestones";
import { createPathwayFixture } from "../../test/pathway-fixtures";
import DraftReview from "./DraftReview";
import PathwayOptions from "./PathwayOptions";
import TopicForm from "./TopicForm";
import TopicSummary from "./TopicSummary";
import DomainFitNotice from "./DomainFitNotice";

const handlers = {
  onSubmit: () => {},
  onEdit: () => {},
  onToggleEdit: () => {},
  onToggleExpand: () => {},
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
  assert.doesNotMatch(html, />Saved</);
});

test("saved options are marked but every option stays selectable", () => {
  const html = renderToStaticMarkup(
    <PathwayOptions
      options={draft.pathway_options}
      selectedId={2}
      savedIds={[1, 3]}
      disabled={false}
      onChoose={() => {}}
    />,
  );
  assert.equal((html.match(/>Saved</g) ?? []).length, 2);
  assert.match(html, /aria-label="Choose pathway 1: [^"]*\(saved\)"/);
  assert.doesNotMatch(html, /aria-label="Choose pathway 2: [^"]*\(saved\)"/);
  assert.doesNotMatch(html, /<fieldset disabled=""/);
});

test("chosen pathway lists all milestones as an accordion with one open", () => {
  const html = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[1]}
      saved={false}
      editing={[]}
      pending={false}
      expanded={0}
      {...handlers}
    />,
  );
  assert.equal((html.match(/data-milestone-card/g) ?? []).length, 5);
  assert.doesNotMatch(html, /type="checkbox"|type="radio"|<textarea/);
  assert.match(html, /Sequential milestones/);
  assert.match(html, /Pathway 2 milestone 5/);
  assert.doesNotMatch(html, /Pathway 1 milestone/);
  assert.match(html, /Save chosen pathway \(5 milestones\)/);
  assert.match(html, /data-save-bar[^>]*sticky bottom-4/);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 4);
  assert.match(html, /aria-controls="milestone-0-details"/);
  assert.match(html, /id="milestone-0-details"/);
  assert.doesNotMatch(html, /id="milestone-1-details"/);
  assert.equal((html.match(/Scenario assignment/g) ?? []).length, 1);
  assert.equal((html.match(/Suggested reading/g) ?? []).length, 1);
  assert.match(html, /<cite[^>]*>Reading 2\.1<\/cite>/);
  assert.match(
    html,
    /3 steps · 2 outcomes · (1 reading|2 readings) · 1 assignment/,
  );
  assert.doesNotMatch(html, /href=/);
  const collapsed = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[1]}
      saved={false}
      editing={[]}
      pending={false}
      expanded={null}
      {...handlers}
    />,
  );
  assert.doesNotMatch(collapsed, /aria-expanded="true"|Scenario assignment/);
});

test("edit unlocks outcomes, steps and scenario, while saved pathway cannot be resubmitted", () => {
  const editing = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[0]}
      saved={false}
      editing={[4]}
      pending={false}
      expanded={0}
      {...handlers}
    />,
  );
  assert.match(editing, /milestone-4-outcome-0/);
  assert.match(editing, /milestone-4-step-0-title/);
  assert.match(editing, /milestone-4-assignment-student_output/);
  assert.match(editing, /milestone-4-resource-0-author_or_publisher/);
  assert.match(editing, /Done editing milestone 5/);
  assert.match(
    editing,
    /aria-expanded="true" aria-controls="milestone-4-details" disabled=""/,
  );
  assert.match(editing, /id="milestone-0-details"/);
  const saved = renderToStaticMarkup(
    <DraftReview
      pathway={draft.pathway_options[0]}
      saved
      editing={[]}
      pending={false}
      expanded={0}
      {...handlers}
    />,
  );
  assert.doesNotMatch(
    saved,
    /Save chosen pathway|Edit milestone|<input|<textarea/,
  );
  assert.match(saved, /Scenario assignment/);
  assert.doesNotMatch(
    saved,
    /<fieldset disabled=""|aria-controls="[^"]*" disabled=""/,
  );
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
  assert.match(html, /<select id="domain" name="domain" required=""/);
  assert.match(
    html,
    /<option value="" disabled="" selected="">Choose a domain/,
  );
  for (const domain of LEARNING_DOMAINS)
    assert.match(
      html,
      new RegExp(`<option value="${domain.replace("&", "&amp;")}">`),
    );
  assert.equal((html.match(/<option /g) ?? []).length, 5);
  assert.match(html, /<textarea[^>]*rows="2"[^>]*field-sizing-content/);
  assert.doesNotMatch(html, />Cancel</);
  assert.match(
    renderToStaticMarkup(
      <TopicForm
        pending={false}
        hasDraft
        onSubmit={handlers.onSubmit}
        onCancel={() => {}}
      />,
    ),
    />Cancel</,
  );
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
        expanded={null}
        {...handlers}
      />,
    );
  assert.match(render(true), /animate-spin[^>]*><\/span>Saving\.\.\./);
  assert.doesNotMatch(render(false), /animate-spin|Saving\.\.\./);
});

test("topic summary collapses the input to one compact block", () => {
  const html = renderToStaticMarkup(
    <TopicSummary
      topic={{
        domain: "Business & Leadership",
        title: "Hybrid change",
        description: "Lead it.",
      }}
      duration="3 months"
      pending={false}
      onEditTopic={() => {}}
      onDiscard={() => {}}
    />,
  );
  assert.match(html, /Business &amp; Leadership · 3 months/);
  assert.match(html, /Hybrid change/);
  assert.match(html, /Edit topic \/ regenerate/);
  assert.match(html, /Discard draft/);
  assert.doesNotMatch(html, /<input|<textarea|<select/);
});

test("topic form explains the chosen domain and names it on the button", () => {
  const html = renderToStaticMarkup(
    <TopicForm
      pending={false}
      hasDraft={false}
      onSubmit={handlers.onSubmit}
      topic={{ domain: "Sustainability", title: "", description: "" }}
      onTopicChange={() => {}}
    />,
  );
  assert.match(html, /aria-describedby="domain-hint"/);
  assert.match(html, /id="domain-hint"[^>]*>Covers: Climate, environment/);
  assert.match(html, /Generate Sustainability pathways/);
  const empty = renderToStaticMarkup(
    <TopicForm
      pending={false}
      hasDraft
      onSubmit={handlers.onSubmit}
      topic={{ domain: "", title: "", description: "" }}
      onTopicChange={() => {}}
    />,
  );
  assert.match(empty, /Pick the domain that best matches your topic/);
  assert.match(empty, /Generate new pathway options/);
});

test("domain-fit notice offers to regenerate in the suggested domain or keep the choice", () => {
  const html = renderToStaticMarkup(
    <DomainFitNotice
      fit={{
        matches: false,
        suggested_domain: "Sustainability",
        reason: "The topic focuses on carbon reduction.",
      }}
      chosenDomain="Business & Leadership"
      pending={false}
      onRegenerate={() => {}}
      onKeep={() => {}}
    />,
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /closer to Sustainability than Business &amp; Leadership/);
  assert.match(html, /The topic focuses on carbon reduction\./);
  assert.match(html, />Regenerate as Sustainability</);
  assert.match(html, />Keep Business &amp; Leadership</);
});
