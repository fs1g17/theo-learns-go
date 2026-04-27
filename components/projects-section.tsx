"use client";

import { useState, useEffect, useCallback } from "react";
import { projects, type Project } from "@/lib/projects";
import { X, ArrowUpRight } from "lucide-react";

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
  const [selected, setSelected] = useState<Project | null>(null);
  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, close]);

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
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onClick={() => setSelected(project)}
          />
        ))}
      </div>

      {selected && <ProjectModal project={selected} onClose={close} />}
    </>
  );
}

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const status = STATUS[project.status];

  return (
    <button
      onClick={onClick}
      style={{
        animationDelay: `${index * 70}ms`,
        animationFillMode: "both",
      }}
      className="group relative flex flex-col p-6 text-left rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-3"
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
    </button>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const status = STATUS[project.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground/30">
              {String(project.id).padStart(2, "0")}
            </span>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${status.className}`}
            >
              {status.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground/30">
              {project.date}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-7 py-7 flex-1">
          <h2 className="text-2xl font-semibold text-foreground mb-1.5 leading-snug">
            {project.title}
          </h2>
          <p className="text-muted-foreground text-sm mb-5">{project.subtitle}</p>

          <div className="flex flex-wrap gap-1.5 mb-7">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] text-muted-foreground/60 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="min-h-28">
            {project.body ? (
              <p className="text-foreground/80 text-sm leading-7 whitespace-pre-wrap">
                {project.body}
              </p>
            ) : (
              <p className="font-mono text-sm text-muted-foreground/30 italic">
                {"// nothing here yet — write something."}
              </p>
            )}
          </div>

          {project.github && (
            <div className="mt-8 pt-6 border-t border-border">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:text-primary/70 transition-colors"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden>
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
