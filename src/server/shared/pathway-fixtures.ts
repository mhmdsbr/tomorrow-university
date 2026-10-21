export function createPathwayFixture(count = 3) {
  return {
    topic: {
      title: "Campus sustainability",
      description: "Explore sustainable campus decisions.",
    },
    duration: "3 months" as const,
    pathway_options: [1, 2, 3].map((id) => ({
      id,
      title: `Pathway ${id}`,
      focus: `Analytical focus ${id}`,
      description: `You explore a distinct approach ${id}.`,
      milestones: Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        title: `Pathway ${id} milestone ${index + 1}`,
        description: "You investigate a realistic sustainability problem.",
        learning_outcomes: [
          "You explain the key concepts.",
          "You evaluate the available evidence.",
        ],
        steps: [1, 2, 3].map((order) => ({
          order,
          title: `Activity ${order}`,
          description: "You map evidence and identify uncertainty.",
        })),
        scenario_assignment: {
          title: "Campus simulation",
          scenario: "You advise a university committee.",
          task: "You compare proposals using the previous milestone's output.",
          student_output: "You produce a justified recommendation.",
        },
      })),
    })),
  };
}
