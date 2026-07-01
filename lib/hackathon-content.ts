/** Hackathon theme + track copy — single source for landing page and submission portals. */

export const HACKATHON_THEME = {
  title: "AI for Living",
  tagline:
    "Ease the tension between work and life. Build agentic AI that helps us live better, not just keep up.",
  intro:
    "In today's increasingly complex world, balancing work and everything beyond it is harder than ever. HackXperience 2026 challenges you to explore what agentic AI can do for real, everyday living.",
  closing:
    "Full track details and the judging panel will be announced at the pre-event on 17 July 2026.",
  introRevealed:
    "In today's increasingly complex world, we are constantly juggled between two essential tasks: our work, and our life beyond it. HackXperience 2026 challenges you to ease that tension, through care that nurtures a healthier life, or automation that brings flow back into the workday.",
  closingRevealed:
    "Choose the side that speaks to your team, because at the end of the day, the question is simple: how can AI help us live better, not just keep up?",
} as const;

export type HackathonSubTrack = {
  code: string;
  name: string;
  ideas: readonly string[];
};

export type HackathonMainTrack = {
  name: string;
  emoji: string;
  summary: string;
  subTracks: readonly HackathonSubTrack[];
};

export const HACKATHON_MAIN_TRACKS: readonly HackathonMainTrack[] = [
  {
    name: "Care Forward",
    emoji: "👐",
    summary:
      "Wellbeing isn't one thing: it's the mind staying steady and the body staying strong, both needing care every day. Reimagine care in our daily living environments and support a genuinely healthy lifestyle.",
    subTracks: [
      {
        code: "1A",
        name: "Mental Care",
        ideas: [
          "Social apps that help you reconnect and recharge",
          "Mental wellness tools",
          "Caregiver coordination tools",
          "Other solutions exploring mental wellbeing",
        ],
      },
      {
        code: "1B",
        name: "Physical Care",
        ideas: [
          "Fitness apps that track exercise movements",
          "Training and endurance apps (e.g. marathon prep)",
          "Daily exercise routines and reminders",
          "Other solutions exploring physical wellbeing",
        ],
      },
      {
        code: "1C",
        name: "Nutrition & Diet",
        ideas: [
          "Smart food label scanning and tagging",
          "Food trackers for hitting nutrition goals",
          "Nutrition apps that help users make better daily food decisions",
          "Daily meal planning or hydration trackers",
          "Other solutions exploring adult nutrition & diet",
        ],
      },
    ],
  },
  {
    name: "Friction To Flow",
    emoji: "🖥️",
    summary:
      "Every workday carries its own friction: scattered tasks, mundane chores, schedules that spiral into chaos. Smooth that friction into flow with agentic AI.",
    subTracks: [
      {
        code: "2A",
        name: "Task & Time Management",
        ideas: [
          "Smart task allocation agents that prioritize your day",
          "Calendar agents that auto-resolve scheduling conflicts",
          "Meeting summarizers and action-item extractors",
          "Focus/deep work assistants that block distractions",
          "Other solutions exploring task and productive time management",
        ],
      },
      {
        code: "2B",
        name: "Work Quality & Integrity",
        ideas: [
          "Plagiarism and AI-content checkers",
          "Citation and reference assistants",
          "Code review or documentation agents",
          "Resume and career coaching agents",
          "Other solutions exploring work quality and integrity",
        ],
      },
      {
        code: "2C",
        name: "Workflow Automation",
        ideas: [
          "Agents that automate repetitive admin (emails, data entry, reports)",
          "Cross-app workflow connectors (e.g. auto-sync between tools)",
          "Smart form-filling or document generation agents",
          "Personal \"chief of staff\" agents that manage multiple small tasks",
          "Other solutions exploring workflow automation",
        ],
      },
    ],
  },
] as const;

/** Flat track labels for submission forms, admin filters, and judging. */
export const HACKX_SUBMISSION_TRACKS = HACKATHON_MAIN_TRACKS.flatMap((track) =>
  track.subTracks.map((sub) => `${track.name} — ${sub.name}`),
) as readonly string[];
