"use client";

import { useActionState } from "react";
import { createMilestone, type MilestoneFormState } from "../actions/milestones";

const initialState: MilestoneFormState = {
  status: "idle",
  message: "",
  values: { title: "", description: "" },
};

export default function MilestoneForm() {
  const [state, formAction, pending] = useActionState(
    createMilestone,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={state.values.title}
          className="rounded-md border border-zinc-400 p-3"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="font-medium">
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          defaultValue={state.values.description}
          className="rounded-md border border-zinc-400 p-3"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-3 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving..." : "Save milestone"}
      </button>
      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
