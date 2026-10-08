export type ProjectStatus = "complete" | "in-progress" | "idea";

export interface Project {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  status: ProjectStatus;
  date: string;
  href: string;
  github?: string;
}

// Newest first — add new projects at the top with the next id.
export const projects: Project[] = [
  {
    id: 4,
    title: "Mini-URL-Shortener",
    subtitle: "A URL shortener with click analytics, built with Go and PostgreSQL.",
    tags: ["Go", "PostgreSQL", "SQL"],
    status: "complete",
    date: "Oct 2026",
    href: "/mini-url-shortener",
    github: "https://github.com/fs1g17/Mini-URL-Shortener",
  },
  {
    id: 3,
    title: "Mini-Redis",
    subtitle: "A Redis clone in Go, speaking RESP over raw TCP.",
    tags: ["Go", "TCP", "protocols"],
    status: "complete",
    date: "Aug 2026",
    href: "/mini-redis",
    github: "https://github.com/fs1g17/Mini-Redis",
  },
  {
    id: 2,
    title: "ws-chat",
    subtitle: "A fullstack real-time chat app built with WebSockets.",
    tags: ["Go", "WebSockets", "fullstack"],
    status: "complete",
    date: "Feb 2026",
    href: "/ws-chat",
    github: "https://github.com/fs1g17/ws-chat",
  },
  {
    id: 1,
    title: "MiniQ",
    subtitle: "A simple persistent queue built with Go and Postgres.",
    tags: ["Go", "PostgreSQL", "queue"],
    status: "complete",
    date: "Jan 2026",
    href: "/MiniQ",
    github: "https://github.com/fs1g17/MiniQ",
  },
];
