import type { Metadata } from "next";
import ProjectPageLayout from "@/components/project-page-layout";

export const metadata: Metadata = {
  title: "ws-chat — Theo Learns Go",
  description: "A fullstack real-time chat app built with WebSockets.",
};

export default function WsChatPage() {
  return (
    <ProjectPageLayout
      id={2}
      title="ws-chat"
      subtitle="A fullstack real-time chat app built with WebSockets."
      tags={["Go", "WebSockets", "fullstack"]}
      status="complete"
      date="Feb 2025"
      github="https://github.com/"
    >
      {/* ── Write your entry here ── */}
      <p className="font-mono text-sm text-muted-foreground/30 italic">
        {"// nothing here yet — write something."}
      </p>
    </ProjectPageLayout>
  );
}
