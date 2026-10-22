import type { LearningMilestone } from "../../../shared/milestones";

export interface MilestoneSectionProps {
  milestone: LearningMilestone;
  index: number;
  editable: boolean;
  onChange: (milestone: LearningMilestone) => void;
}
