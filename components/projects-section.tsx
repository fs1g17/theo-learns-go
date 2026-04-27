"use client";

import Link from "next/link";
import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { ArrowUpRight } from "lucide-react";

const STATUS = {
  complete: {
    label: "complete",
    className:
      "text-[color:var(--primary)] border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10",
  },
  "in-progress": {
    label: "in progress",
    className: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  },
  idea: {
    label: "idea",
    className:
      "text-[color:var(--muted-foreground)] border-[color:var(--border)] bg-[color:var(--muted)]/30",
  },
} as const;

export default function ProjectsSection() {
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <span className="font-mono text-xs tracking-[0.18em] uppercase text-muted-foreground/60">
          Projects
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-xs text-muted-foreground/30">
          {projects.length} entries
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const status = STATUS[project.status];

  return (
    <Link
      href={project.href}
      style={{
        animationDelay: `${index * 70}ms`,
        animationFillMode: "both",
      }}
      className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-start justify-between mb-5">
        <span className="font-mono text-xs text-muted-foreground/30 tabular-nums">
          {String(project.id).padStart(2, "0")}
        </span>
        <span
          className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-150 leading-snug">
        {project.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
        {project.subtitle}
      </p>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-muted-foreground/50 bg-muted/40 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/30 shrink-0">
          {project.date}
        </span>
      </div>

      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
    </Link>
  );
}
