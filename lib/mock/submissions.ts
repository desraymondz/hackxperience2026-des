// Mock admin submissions — placeholder data until the admin portal is wired
// to Supabase. Types live in @/lib/types.
import type { AdminSubmission } from "@/lib/types";

export const mockSubmissions: AdminSubmission[] = [
  {
    id: "HX26-001",
    projectAccessKey: "7b9e24a1-8c3d-4f5b-9a12-e3d4c5b6a7f8",
    projectName: "project_name1",
    teamName: "team_name1",
    teamId: "TEAM-001",
    track: "AI / ML",
    status: "pending",
    submittedAt: "XX June 2026, 21:08",
    updatedAt: "XX June 2026, 21:45",
    description: "An AI-powered tool that helps students discover study resources tailored to their learning style and course requirements.",
    shortPitch:
      "Most students waste hours searching for study materials that don't match how they learn. Our platform uses adaptive AI to surface the right resources at the right time, cutting prep time in half.",
    techStack: ["NODE.JS", "OPEN AI API", "SUPABASE", "NEXT.JS"],
    githubUrl: "https://github.com/example/project-alpha",
    liveUrl: "https://project-alpha.vercel.app",
    pitchDeckUrl: "https://pitch.com/v/alpha-deck",
    pitchDeckFileUrl: null,
    videoDemoUrl: "https://youtube.com/watch?v=abc123demo",
    members: [
      { name: "Bob Tan", email: "bob@example.com" },
      { name: "Bobby Lim", email: "bobby@example.com" },
    ],
    additionalNotes: "The team has prior experience in edtech. Prototype was tested with 30 students from SIM.",
    scores: [
      { judgeId: "judge1", score: 74 },
      { judgeId: "judge2", score: null },
      { judgeId: "judge3", score: null },
    ],
  },
  {
    id: "HX26-002",
    projectAccessKey: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    projectName: "project_name2_maybe_also_long_like_this",
    teamName: "team_name_is_very_long_like_this_or_maybe_longer",
    teamId: "TEAM-002",
    track: "IoT / Hardware",
    status: "approved",
    submittedAt: "XX June 2026, 21:08",
    updatedAt: "XX June 2026, 22:30",
    description: "A campus sustainability dashboard that aggregates energy and water usage data from IoT sensors across SIM buildings.",
    shortPitch:
      "GreenCampus turns raw sensor data into actionable insights. Facilities teams get live alerts, students get a leaderboard — both groups end up caring about energy use in a way they never did before.",
    techStack: ["REACT NATIVE", "ARDUINO", "FIREBASE", "PYTHON"],
    githubUrl: "https://github.com/example/greencampus",
    liveUrl: null,
    pitchDeckUrl: "https://pitch.com/v/greencampus-deck",
    pitchDeckFileUrl: "https://files.example.com/greencampus.pdf",
    videoDemoUrl: null,
    members: [
      { name: "Alice Wong", email: "alice@example.com" },
      { name: "Alex Ng", email: "alex@example.com" },
      { name: "Andrea Cruz", email: "andrea@example.com" },
    ],
    additionalNotes: null,
    scores: [
      { judgeId: "judge1", score: 82 },
      { judgeId: "judge2", score: 88 },
      { judgeId: "judge3", score: 91 },
    ],
  },
];
