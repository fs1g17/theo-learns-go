import type { Metadata } from "next";
import ProjectPageLayout from "@/components/project-page-layout";

export const metadata: Metadata = {
  title: "ws-chat — Theo Learns Go",
  description: "A fullstack real-time chat app built with WebSockets.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

function CodeBlock({
  children,
  lang,
}: {
  children: string;
  lang?: string;
}) {
  return (
    <div className="my-5 rounded-xl border border-border/60 bg-muted/20 overflow-x-auto">
      {lang && (
        <div className="px-4 pt-3 pb-2 border-b border-border/40">
          <span className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
            {lang}
          </span>
        </div>
      )}
      <pre className="px-4 py-4 font-mono text-xs text-foreground/70 leading-6 whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs tracking-[0.18em] uppercase text-muted-foreground/50 mt-10 mb-4 flex items-center gap-3">
      <span>{children}</span>
      <span className="flex-1 h-px bg-border/50" />
    </h2>
  );
}

export default function WsChatPage() {
  return (
    <ProjectPageLayout
      id={2}
      title="ws-chat"
      subtitle="A fullstack real-time chat app built with WebSockets."
      tags={["Go", "WebSockets", "goroutines", "channels", "React", "Vite"]}
      status="complete"
      date="Feb 2025"
      github="https://github.com/fs1g17/ws-chat"
    >
      <div className="text-sm text-foreground/75 leading-7">
        <SectionHeading>Backend</SectionHeading>

        <p className="mb-4">
          The backend uses the <Code>coder/websocket</Code> implementation of
          WebSockets, following the approach from the{" "}
          <Code>gorilla/websocket</Code> chat example. The core of it is two
          structs — <Code>Client</Code> and <Code>Hub</Code>.
        </p>

        <p className="mb-2">
          Each connected client is represented as:
        </p>

        <CodeBlock lang="go">{`type Client struct {
	hub    *Hub               // thing that ties it all together
	send   chan []byte        // channel for sending messages
	conn   *websocket.Conn   // websocket connection
	ctx    context.Context   // request context
	cancel context.CancelFunc // cancel func
}`}</CodeBlock>

        <p className="mb-2">
          The Hub ties all clients together and owns the broadcast logic:
        </p>

        <CodeBlock lang="go">{`type Hub struct {
	clients    map[*Client]bool // map of clients
	register   chan *Client     // channel to register client
	unregister chan *Client     // channel to unregister client
	message    chan []byte      // channel to broadcast message
}`}</CodeBlock>

        <p className="mb-4">
          Each client runs a read goroutine and a write goroutine. When a message
          arrives in the read goroutine, it gets forwarded to the hub&apos;s{" "}
          <Code>message</Code> channel. The hub then loops over all registered
          clients and drops the message into each client&apos;s{" "}
          <Code>send</Code> channel, where the write goroutine picks it up and
          pushes it down the WebSocket connection.
        </p>

        <p>
          Storing <Code>ctx</Code> and <Code>cancel</Code> directly in the client
          struct makes cleanup clean: if one goroutine errors, calling{" "}
          <Code>cancel()</Code> signals the other to stop as well. No need to
          coordinate them separately.
        </p>

        <SectionHeading>Frontend</SectionHeading>

        <p className="mb-4">
          The frontend is a Vite app with Tailwind and shadcn. All the WebSocket
          logic lives in a <Code>useEffect</Code> that creates the connection and
          attaches event handlers. The interesting part is reconnection — it
          happens inside the <Code>onClose</Code> handler:
        </p>

        <CodeBlock lang="javascript">{`const closeEventListener = (event) => {
  setStatus("closed");
  connection.current = null;
  console.log(\`OnClose: \${event.code} \${event.reason}\`);
  setTimeout(
    () => {
      console.log("retrying");
      setRetryCounter((prev) => prev + 1);
    },
    (1 + retryCounter) * 1000,
  );
};`}</CodeBlock>

        <p className="mb-4">
          <Code>retryCounter</Code> serves two purposes: it&apos;s used for
          exponential backoff on the delay, and incrementing it re-triggers the
          effect, which creates a fresh connection. The cleanup function is where
          the distinction between "server closed the connection" and "component
          unmounted" is made:
        </p>

        <CodeBlock lang="javascript">{`return () => {
  console.log("running cleanup");
  if (connection.current) {
    console.log("running close");
    connection.current.removeEventListener("close", closeEventListener);
    connection.current.close();
    connection.current = null;
  }
};`}</CodeBlock>

        <p>
          When the component unmounts, the cleanup removes the{" "}
          <Code>closeEventListener</Code> before closing the connection. This
          means the retry logic never fires — the close was intentional. When the
          server drops the connection, the listener is still attached, so the
          backoff retry kicks in automatically.
        </p>
      </div>
    </ProjectPageLayout>
  );
}
