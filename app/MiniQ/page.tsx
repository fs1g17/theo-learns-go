import type { Metadata } from "next";
import ProjectPageLayout from "@/components/project-page-layout";

export const metadata: Metadata = {
  title: "MiniQ — Theo Learns Go",
  description: "A simple persistent queue built with Go and Postgres.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

export default function MiniQPage() {
  return (
    <ProjectPageLayout
      id={1}
      title="MiniQ"
      subtitle="A simple persistent queue built with Go and Postgres."
      tags={["Go", "PostgreSQL", "queue", "long polling", "goroutines"]}
      status="complete"
      date="Jan 2025"
      github="https://github.com/fs1g17/MiniQ"
    >
      <div className="space-y-5 text-sm text-foreground/75 leading-7">
        <p>
          The idea was simple: a small Go server that acts as a job queue, backed
          by PostgreSQL for persistence. There are only two endpoints —{" "}
          <Code>POST /addJob</Code> and <Code>GET /pollJob</Code> — and the whole
          thing is held together with long polling and a map of channels.
        </p>

        <p>
          When a worker calls <Code>/pollJob</Code>, the server creates a channel
          for that connection and registers it in a <Code>clients</Code> map. The
          request just hangs there. The channel isn&apos;t carrying the job itself
          — it&apos;s only used to ping the goroutine once something gets added to
          the queue. Think of it as a doorbell, not a mailbox.
        </p>

        <p>
          On the other side, <Code>POST /addJob</Code> expects a JSON body with a
          single <Code>data</Code> field typed as <Code>map[string]any</Code> —
          deliberately loose, to keep the server generic. When the endpoint is
          hit, the job gets written to a PostgreSQL <Code>jobs</Code> table and
          enqueued in memory. The queue uses a mutex to keep enqueue and dequeue
          operations thread-safe. Once that&apos;s done, the server loops over the
          registered clients and pings them — the first one to respond gets the
          job.
        </p>

        <p>
          If a job is already waiting when a worker calls <Code>/pollJob</Code>,
          it gets dequeued immediately: the job status is updated to{" "}
          <Code>in_progress</Code> in Postgres and returned with a 200. If the
          queue is empty, the request stays open. If it times out before anything
          arrives, the worker just retries — reconnecting and waiting again. This
          keeps things reactive without any polling delay: the right worker gets
          the job the moment it&apos;s available.
        </p>

        <p>
          It&apos;s a toy, but it forced me to actually think about goroutines,
          mutexes, and channel signaling rather than just reading about them.
          Getting the first-available-worker assignment right took a few attempts
          — the initial version would occasionally assign the same job to two
          workers when they both happened to poll at the same time.
        </p>
      </div>
    </ProjectPageLayout>
  );
}
