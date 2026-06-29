// Gallery / past-showcase project type.
// This is a distinct entity from a hackathon `Submission`: it represents a
// finished, ranked project shown in the public gallery of previous events.

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  /** Scannable key-feature bullets for the detail modal. */
  features?: string[];
  image: string;
  year: "2025" | "2024";
  teamName: string;
  /** Actual technologies used (e.g. ["React", "Tailwind"]). */
  tags: string[];
  links?: {
    github?: string;
    demo?: string;
  };
  achievements?: string[];
  rank?: "WINNER" | "RUNNER_UP" | "SECOND_RUNNER_UP" | "SPECIAL_MENTION";
  createdAt: string; // ISO date string for sorting
}
