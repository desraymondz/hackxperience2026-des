/** Prize copy:synced with Notion Prizes page. */

export type PrizeTier = {
  label: string;
  amount: string;
  note?: string;
};

export type PrizeAward = {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  tiers: readonly PrizeTier[];
  criteria: readonly string[];
  informal?: boolean;
};

export const HACKATHON_PRIZES: readonly PrizeAward[] = [
  {
    id: "care-forward",
    emoji: "👐",
    title: "Care Forward Track",
    summary: "Best overall project under the Care Forward track.",
    tiers: [
      { label: "Winner", amount: "S$300" },
      { label: "Runner-up", amount: "S$150" },
    ],
    criteria: [
      "Creativity & impact (25%):fresh take on care; improves quality of life or wellbeing",
      "Agentic depth (30%):autonomous reasoning, multi-step execution, or tool use",
      "Technical execution (25%):functional, polished, technically sound",
      "Presentation quality (20%):clear and engaging delivery",
    ],
  },
  {
    id: "friction-to-flow",
    emoji: "🖥️",
    title: "Friction To Flow Track",
    summary: "Best overall project under the Friction To Flow track.",
    tiers: [
      { label: "Winner", amount: "S$300" },
      { label: "Runner-up", amount: "S$150" },
    ],
    criteria: [
      "Creativity & impact (25%):novel productivity solution; reduces friction or saves time",
      "Agentic depth (30%):autonomous decisions, task orchestration, intelligent automation",
      "Technical execution (25%):functional, polished, technically sound",
      "Presentation quality (20%):clear and engaging delivery",
    ],
  },
  {
    id: "microsoft-stack",
    emoji: "☁️",
    title: "Best Use of Microsoft Stack",
    summary: "Sponsor choice:most meaningful use of the Microsoft AI ecosystem for a working agentic solution.",
    tiers: [
      {
        label: "Winner",
        amount: "S$700",
        note: "S$200 cash + Microsoft Certification access (S$500)",
      },
    ],
    criteria: [
      "Depth of integration (30%):Azure AI Foundry, Fabric, or Azure AI beyond surface-level API calls",
      "Tool orchestration (30%):chains tools, data sources, or agent actions on the Microsoft stack",
      "Technical soundness (40%):stable, well-architected implementation",
    ],
  },
  {
    id: "entrepreneurial",
    emoji: "🚀",
    title: "Best Entrepreneurial Award",
    summary: "Sponsor choice:systems thinking, consultative approach, and product mindset.",
    tiers: [{ label: "Winner", amount: "S$100" }],
    criteria: [
      "Problem framing (40%):real, well-understood user or client pain point",
      "Systems thinking (20%):edge cases, integrations, scalability, failure handling",
      "Consultative approach (20%):trade-offs articulated as if to a client",
      "Product mindset (20%):something a real user would want, not just a demo",
    ],
  },
  {
    id: "community-choice",
    emoji: "🗳️",
    title: "Community Choice Award",
    summary: "Voted by HackXperience participants:most support from the community.",
    tiers: [{ label: "Winner", amount: "S$50" }],
    criteria: ["Determined by participant voting on the HackXperience voting page"],
  },
  {
    id: "game-prize",
    emoji: "🎮",
    title: "Game Prize",
    summary: "Informal award:details to be confirmed.",
    tiers: [{ label: "Winner", amount: "S$50" }],
    criteria: ["To be confirmed"],
  },
] as const;

export const PRIZE_POOL_TOTAL = "S$1,800+";
export const PRIZE_CURRENCY_NOTE = "All prize amounts are in SGD.";
