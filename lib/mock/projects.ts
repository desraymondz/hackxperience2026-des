// Mock gallery projects — placeholder data for the public gallery until it is
// populated from approved submissions. Types live in @/lib/types.
import type { Project } from "@/lib/types";

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'OmniTool Analytics',
    description: 'A comprehensive dashboard for tracking student productivity across multiple campus platforms.',
    longDescription: 'OmniTool Analytics provides students with a unified view of their academic performance, campus activity, and resource usage. Built during the 2024 Omnitool Hackathon, it leverages real-time data to offer personalized insights.',
    image: '/OmniTool1.jpg',
    year: '2024',
    teamName: 'The Analysts',
    tags: ['Next.js', 'Supabase', 'D3.js'],
    achievements: ['Best Tech Award', 'Most Practical'],
    rank: 'WINNER',
    links: {
      github: 'https://github.com',
      demo: 'https://demo.com'
    },
    createdAt: '2024-05-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'GreenCampus',
    description: 'An IoT-based solution for monitoring and reducing energy consumption in campus dormitories.',
    longDescription: 'GreenCampus uses low-power sensors to monitor energy usage in real-time. Students can track their consumption through a mobile app and compete in "energy-saving challenges" to win rewards.',
    image: '/PastYear1.jpg',
    year: '2025',
    teamName: 'EcoWarriors',
    tags: ['React Native', 'IoT', 'Node.js'],
    achievements: ['1st Runner Up', 'Sustainability Award'],
    rank: 'RUNNER_UP',
    links: {
      github: 'https://github.com'
    },
    createdAt: '2025-05-22T14:30:00Z'
  },
  {
    id: '3',
    title: 'StudyBuddy Finder',
    description: 'A matching platform that connects students based on their study habits and course schedules.',
    longDescription: 'StudyBuddy Finder uses a custom algorithm to pair students who share similar academic goals and availability. It includes a built-in chat system and collaborative note-taking tools.',
    image: '/PastYear2.jpg',
    year: '2025',
    teamName: 'Coders Collective',
    tags: ['Firebase', 'React', 'Tailwind'],
    achievements: ['People\'s Choice'],
    rank: 'SECOND_RUNNER_UP',
    links: {
      demo: 'https://demo.com'
    },
    createdAt: '2025-05-23T09:15:00Z'
  },
  {
    id: '4',
    title: 'CampusWayfinder',
    description: 'An AR-powered navigation app for new students to navigate the complex campus layout.',
    longDescription: 'CampusWayfinder helps new students find classrooms, labs, and facilities using augmented reality. It also features "historical hotspots" that provide trivia about campus landmarks.',
    image: '/OmniTool3.jpg',
    year: '2024',
    teamName: 'AR Architects',
    tags: ['Unity', 'ARCore', 'C#'],
    achievements: ['Most Innovative'],
    rank: 'SPECIAL_MENTION',
    links: {
      github: 'https://github.com'
    },
    createdAt: '2024-05-21T11:45:00Z'
  },
  {
    id: '5',
    title: 'FoodFlow',
    description: 'A surplus food distribution network connecting campus cafeterias with students in need.',
    image: '/OmniTool4.jpg',
    year: '2024',
    teamName: 'ZeroWaste',
    tags: ['Python', 'Django', 'Google Maps API'],
    createdAt: '2024-05-21T16:20:00Z'
  },
  {
    id: '6',
    title: 'SkillSwap',
    description: 'A peer-to-peer learning platform where students trade technical skills and project help.',
    image: '/PastYear3.JPG',
    year: '2025',
    teamName: 'Knowledge Hub',
    tags: ['PostgreSQL', 'Express', 'React'],
    createdAt: '2025-05-22T11:10:00Z'
  },
  {
    id: '7',
    title: 'EventRadar',
    description: 'A real-time aggregator for all campus events, workshops, and student club activities.',
    image: '/OmniTool5.jpg',
    year: '2024',
    teamName: 'Pulse',
    tags: ['TypeScript', 'GraphQL', 'Next.js'],
    createdAt: '2024-05-20T08:30:00Z'
  },
  {
    id: '8',
    title: 'SecureGate',
    description: 'A blockchain-based digital ID system for seamless and secure campus facility access.',
    image: '/PastYear4.JPG',
    year: '2025',
    teamName: 'ChainBlockers',
    tags: ['Solidity', 'Ethereum', 'Web3.js'],
    createdAt: '2025-05-23T15:45:00Z'
  },
  {
    id: '9',
    title: 'NoteSync',
    description: 'An AI-powered tool that summarizes lecture recordings into structured study notes.',
    image: '/PastYear5.JPG',
    year: '2025',
    teamName: 'AI Academics',
    tags: ['OpenAI', 'Python', 'Flask'],
    createdAt: '2025-05-22T19:00:00Z'
  }
];
