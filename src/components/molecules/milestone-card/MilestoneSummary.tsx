import { Typography } from "../../atoms";
import FormField from "../FormField";
import type { MilestoneSectionProps } from "./types";

export default function MilestoneSummary({
  milestone,
  index,
  editable,
  onChange,
}: MilestoneSectionProps) {
  return editable ? (
    <div className="flex flex-col gap-4">
      <FormField
        label="Title"
        id={`milestone-title-${index}`}
        value={milestone.title}
        onChange={(event) =>
          onChange({ ...milestone, title: event.target.value })
        }
        required
        maxLength={200}
      />
      <FormField
        multiline
        label="Description"
        id={`milestone-description-${index}`}
        value={milestone.description}
        onChange={(event) =>
          onChange({ ...milestone, description: event.target.value })
        }
        required
        maxLength={5000}
        rows={5}
      />
    </div>
  ) : (
    <Typography size="sm" color="inherit" leading="relaxed">
      <span className="wrap-break-word">{milestone.description}</span>
    </Typography>
  );
}
