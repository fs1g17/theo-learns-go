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

export const projects: Project[] = [
  {
    id: 1,
    title: "MiniQ",
    subtitle: "A simple persistent queue built with Go and Postgres.",
    tags: ["Go", "PostgreSQL", "queue"],
    status: "complete",
    date: "Jan 2025",
    href: "/MiniQ",
    github: "https://github.com/fs1g17/MiniQ",
  },
  {
    id: 2,
    title: "ws-chat",
    subtitle: "A fullstack real-time chat app built with WebSockets.",
    tags: ["Go", "WebSockets", "fullstack"],
    status: "complete",
    date: "Feb 2025",
    href: "/ws-chat",
    github: "https://github.com/fs1g17/ws-chat",
  },
];
