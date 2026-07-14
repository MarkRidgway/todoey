export type Quadrant = "DO" | "SCHEDULE" | "DELEGATE" | "ELIMINATE";

export const QUADRANTS: { id: Quadrant; title: string; hint: string }[] = [
  { id: "DO", title: "Do", hint: "Urgent & Important" },
  { id: "SCHEDULE", title: "Schedule", hint: "Not Urgent & Important" },
  { id: "DELEGATE", title: "Delegate", hint: "Urgent & Not Important" },
  { id: "ELIMINATE", title: "Eliminate", hint: "Not Urgent & Not Important" },
];

export function toQuadrant(urgent: boolean, important: boolean): Quadrant {
  if (urgent && important) return "DO";
  if (!urgent && important) return "SCHEDULE";
  if (urgent && !important) return "DELEGATE";
  return "ELIMINATE";
}

export function fromQuadrant(quadrant: Quadrant): { urgent: boolean; important: boolean } {
  switch (quadrant) {
    case "DO":
      return { urgent: true, important: true };
    case "SCHEDULE":
      return { urgent: false, important: true };
    case "DELEGATE":
      return { urgent: true, important: false };
    case "ELIMINATE":
      return { urgent: false, important: false };
  }
}
