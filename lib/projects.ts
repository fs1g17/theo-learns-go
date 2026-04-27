export type ProjectStatus = "complete" | "in-progress" | "idea";

export interface Project {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  status: ProjectStatus;
  date: string;
  body: string;
  github?: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Hello, World",
    subtitle: "First steps — syntax, types, and getting comfortable with the Go toolchain.",
    tags: ["fundamentals", "toolchain"],
    status: "complete",
    date: "Jan 2025",
    body: "",
  },
  {
    id: 2,
    title: "A CLI Tool",
    subtitle: "Flags, arguments, and building something that's actually useful.",
    tags: ["CLI", "os", "flag"],
    status: "complete",
    date: "Feb 2025",
    body: "",
  },
  {
    id: 3,
    title: "An HTTP Server",
    subtitle: "Routing, handlers, middleware — the web from scratch in Go.",
    tags: ["HTTP", "net/http", "routing"],
    status: "in-progress",
    date: "Mar 2025",
    body: "",
  },
  {
    id: 4,
    title: "Goroutines & Channels",
    subtitle: "Learning to think concurrently. This one broke my brain a little.",
    tags: ["concurrency", "goroutines", "channels"],
    status: "idea",
    date: "Coming soon",
    body: "",
  },
];
