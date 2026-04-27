import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { BookOpen } from "lucide-react";
import ProjectsSection from "@/components/projects-section";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Theo — Learning Go",
  description: "A developer's field notes on learning Go.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-mono text-sm text-muted-foreground">
          <span className="text-primary">$</span> theo-learns-go
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/30 bg-muted/20 border border-border/50 px-2.5 py-1 rounded-md">
          v0.1.0
        </span>
      </header>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 overflow-hidden">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.52 0.105 223.128 / 0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-2xl">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground/40 mb-6">
            whoami
          </p>

          <h1
            className={`${cormorant.className} text-[6rem] md:text-[7.5rem] font-semibold italic leading-none text-foreground mb-1`}
          >
            Theo.
          </h1>
          <p
            className={`${cormorant.className} text-3xl md:text-4xl italic text-muted-foreground mb-9`}
          >
            Learning to think in Go.
          </p>

          <p className="font-mono text-sm text-muted-foreground/70 leading-relaxed max-w-lg mb-8">
            {/* Replace this with your own bio */}A developer&apos;s field
            notes. This is where I document the things I build while learning
            Go — less portfolio, more diary. Everything here is a work in
            progress, and that&apos;s the point.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-4 font-mono text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-150"
            >
              {/* GitHub mark */}
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-4 font-mono text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-150"
            >
              {/* LinkedIn mark */}
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden>
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 h-9 px-4 font-mono text-xs rounded-lg border border-primary/30 text-primary hover:border-primary hover:bg-primary/10 transition-all duration-150"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Projects
            </a>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="max-w-5xl mx-auto px-6 pb-24">
        <ProjectsSection />
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-border">
        <p className="font-mono text-xs text-muted-foreground/25">
          {"// built while learning"}
        </p>
      </footer>
    </main>
  );
}
