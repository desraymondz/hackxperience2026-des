// Mock judge projects — placeholder data for the judge scoring view until it is
// wired to approved submissions. Types live in @/lib/types.
import type { JudgeProject } from "@/lib/types";

export const MOCK_JUDGE_PROJECTS: JudgeProject[] = [
  {
    id: "1", name: "OmniTool Analytics", teamId: "TEAM-001", teamName: "The Analysts",
    category: "Web Development", track: "AI / ML",
    description: "A comprehensive dashboard for tracking student productivity across multiple campus platforms.",
    pitch: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vestibulum lectus at consectetur placerat. Suspendisse id maximus velit. Maecenas eu tristique lectus. Mauris non hendrerit odio. Pellentesque habitant morbi tristique senectus et netus et malesuada.",
    techStack: ["NODE.JS", "OPEN API", "SUPABASE"],
    githubUrl: "https://github.com/example/omnitool", liveUrl: "https://omnitool.vercel.app",
    pitchDeckUrl: "https://pitch.com/deck", pitchDeckFileUrl: "https://files.example.com/deck.pdf",
    videoDemoUrl: "https://youtube.com/watch?v=abc123",
    members: [
      { name: "Bob",    email: "bob@gmail.com" },
      { name: "Bobby",  email: "bobby@gmail.com" },
      { name: "Bobber", email: "bobber@gmail.com" },
      { name: "Bobson", email: "bobson@gmail.com" },
    ],
    notes: "The team has extensive industry experience. Please consider the project scope when scoring.",
    submittedAt: "2026-01-17T13:30:00", updatedAt: "2026-01-17T13:45:00",
  },
  {
    id: "2", name: "GreenCampus", teamId: "TEAM-002", teamName: "EcoWarriors",
    category: "Sustainability", track: "IoT / Hardware",
    description: "IoT-based solution for monitoring and reducing energy consumption in campus dormitories.",
    pitch: "GreenCampus uses low-power sensors to monitor energy usage in real-time. Students can track their consumption through a mobile app and compete in energy-saving challenges to win rewards.",
    techStack: ["REACT NATIVE", "ARDUINO", "NODE.JS"],
    githubUrl: "https://github.com/example/greencampus", liveUrl: null,
    pitchDeckUrl: "https://pitch.com/greendeck", pitchDeckFileUrl: null, videoDemoUrl: null,
    members: [
      { name: "Alice",  email: "alice@gmail.com" },
      { name: "Alex",   email: "alex@gmail.com" },
      { name: "Andrea", email: "andrea@gmail.com" },
    ],
    notes: null, submittedAt: "2026-01-17T14:00:00", updatedAt: "2026-01-17T14:00:00",
  },
];
