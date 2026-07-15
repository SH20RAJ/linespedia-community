export interface PromptChallenge {
  week: string; // e.g., "2026-W29"
  title: string;
  emotion: string;
  constraint: string;
  tag: string; // tag submissions must include, e.g. "prompt-2026-w29"
}

export const WEEKLY_PROMPTS: PromptChallenge[] = [
  {
    week: "2026-W29",
    title: "The Whispering Walls",
    emotion: "mystery",
    constraint: "Must start with the sentence: 'The dust had settled, but the shadow remained.'",
    tag: "prompt-2026-w29",
  },
  {
    week: "2026-W30",
    title: "Unspoken Goodbyes",
    emotion: "sadness",
    constraint: "Must not contain the letter 'e'.",
    tag: "prompt-2026-w30",
  },
  {
    week: "2026-W31",
    title: "Golden Hour Serenity",
    emotion: "peace",
    constraint: "Must contain exactly three stanzas of four lines each.",
    tag: "prompt-2026-w31",
  }
];

export function getCurrentPrompt(): PromptChallenge {
  // Return the active challenge based on the current week
  // For robustness, we fallback to the first prompt or select based on calendar dates
  return WEEKLY_PROMPTS[0];
}

export function getPromptByWeek(week: string): PromptChallenge | undefined {
  return WEEKLY_PROMPTS.find((p) => p.week.toUpperCase() === week.toUpperCase());
}
