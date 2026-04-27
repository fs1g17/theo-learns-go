import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ProjectStatus } from "@/lib/projects";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const STATUS: Record<ProjectStatus, { label: string; className: string }> = {
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
};

interface ProjectPageLayoutProps {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  status: ProjectStatus;
  date: string;
  github?: string;
  children: React.ReactNode;
}

export default function ProjectPageLayout({
  id,
  title,
  subtitle,
  tags,
  status,
  date,
  github,
  children,
}: ProjectPageLayoutProps) {
  const s = STATUS[status];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          theo-learns-go
        </Link>
        <span className="font-mono text-[10px] text-muted-foreground/30 bg-muted/20 border border-border/50 px-2.5 py-1 rounded-md">
          v0.1.0
        </span>
      </header>

      {/* Project header */}
      <section className="relative max-w-5xl mx-auto px-6 pt-12 pb-14 overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.52 0.105 223.128 / 0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-xs text-muted-foreground/30 tabular-nums">
              {String(id).padStart(2, "0")}
            </span>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${s.className}`}
            >
              {s.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground/30">
              {date}
            </span>
          </div>

          <h1
            className={`${cormorant.className} text-[4.5rem] md:text-[6rem] font-semibold italic leading-none text-foreground mb-2`}
          >
            {title}
          </h1>
          <p
            className={`${cormorant.className} text-2xl md:text-3xl italic text-muted-foreground mb-7`}
          >
            {subtitle}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] text-muted-foreground/60 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Content */}
      <article className="max-w-5xl mx-auto px-6 py-14">
        <div className="max-w-2xl prose-zone">{children}</div>
      </article>

      {/* GitHub link */}
      {github && (
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="max-w-2xl pt-8 border-t border-border">
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:text-primary/70 transition-colors"
            >
              <svg
                viewBox="0 0 16 16"
                className="w-3.5 h-3.5 fill-current"
                aria-hidden
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-border">
        <p className="font-mono text-xs text-muted-foreground/25">
          {"// built while learning"}
        </p>
      </footer>
    </main>
  );
}
