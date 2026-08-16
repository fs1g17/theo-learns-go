import type { Metadata } from "next";
import ProjectPageLayout from "@/components/project-page-layout";

export const metadata: Metadata = {
  title: "Mini-Redis — Theo Learns Go",
  description: "A Redis clone in Go, speaking RESP over raw TCP.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

function CodeBlock({ children, lang }: { children: string; lang?: string }) {
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

export default function MiniRedisPage() {
  return (
    <ProjectPageLayout
      id={3}
      title="Mini-Redis"
      subtitle="A Redis clone in Go, speaking RESP over raw TCP."
      tags={["Go", "TCP", "RESP", "parsing", "mutexes", "testing"]}
      status="complete"
      date="Aug 2026"
      github="https://github.com/fs1g17/Mini-Redis"
    >
      <div className="text-sm text-foreground/75 leading-7">
        <p className="mb-4">
          This one goes underneath <Code>net/http</Code> entirely. Redis
          doesn&apos;t expose a RESTful API — it defines its own Redis
          Serialization Protocol (RESP) and pushes bytes straight over TCP. So
          before any of the interesting key-value work, there&apos;s a more basic
          question to answer: reading a stream of bytes, how do you know when a
          message has actually finished arriving? That problem is called{" "}
          <em>framing</em>.
        </p>

        <SectionHeading>Framing</SectionHeading>

        <p className="mb-4">
          There are three common approaches. <strong>Fixed length</strong> is the
          simplest — every frame is exactly N bytes, which is what UDP headers
          do. <strong>Delimiter separated</strong> means reading until you hit a
          marker, like the blank line that ends HTTP headers; the cost is that
          the marker can never appear in the payload, which is where escaping
          comes from. <strong>Length prefix</strong> skips the guesswork by
          telling the reader up front how many bytes to expect, which is how
          WebSocket frames work.
        </p>

        <p className="mb-4">
          Most real protocols mix them. HTTP is delimiter separated for headers
          and length prefixed for the body via <Code>Content-Length</Code>. RESP
          picks the same two.
        </p>

        <CodeBlock lang="resp">{`Type            Prefix   Example encoding
-------------   ------   ------------------------------------
Simple String   +        +OK\\r\\n
Error           -        -ERR unknown command\\r\\n
Integer         :        :42\\r\\n
Bulk String     $        $5\\r\\nhello\\r\\n   ($-1\\r\\n = null)
Array           *        *2\\r\\n$3\\r\\nGET\\r\\n$3\\r\\nfoo\\r\\n`}</CodeBlock>

        <p className="mb-4">
          Simple strings, errors and integers are trivial — and they only ever
          appear in <em>responses</em>. The two interesting types are bulk
          strings and arrays, and both combine a length prefix with CRLF
          delimiters. Commands are <em>always</em> sent as arrays of bulk
          strings, so that&apos;s the only shape the parser has to ingest.
        </p>

        <p className="mb-2">The subset of commands I implemented:</p>

        <CodeBlock lang="commands">{`PING                liveness            +PONG (or echo arg)
ECHO <msg>          return the arg      bulk string of <msg>
SET <k> <v>         store, no expiry    +OK
GET <k>             fetch               bulk string of value
DEL <k> [k...]      delete keys         :<count deleted>
EXISTS <k> [k...]   count existing      :<count>
INCR <k>            atomic +1, init 1   :<new value>
EXPIRE <k> <secs>   set TTL             :1 set, :0 no such key
TTL <k>             seconds left        :<n>, :-1 no TTL, :-2 no key`}</CodeBlock>

        <SectionHeading>Parsing bulk strings</SectionHeading>

        <p className="mb-4">
          A bulk string like <Code>$5\r\nhello\r\n</Code> is: a <Code>$</Code>,
          the length N written as base-10 digits (one byte each), a CRLF, N bytes
          of payload, and a closing CRLF.
        </p>

        <p className="mb-4">
          My first attempt was to scan for the first CRLF and split there. That
          turned out to be wrong: a malformed frame can be missing its length
          CRLF entirely while the <em>payload</em> happens to contain one, and
          the parser would happily cut in the wrong place. The correct approach
          is to walk the bytes deliberately — assert the leading <Code>$</Code>,
          read digits one at a time until CR, verify the CR is followed by LF,
          validate the length is a positive integer, and only then read the
          payload.
        </p>

        <CodeBlock lang="go">{`// read length until we get CR
i := 1
for i = 1; i < len(buff); i++ {
	if buff[i] >= '0' && buff[i] <= '9' {
		continue // it is a digit
	} else if buff[i] == '\\r' {
		break
	} else {
		return nil, 0, invalidDataErr
	}
}

lengthEnd := i // position of \\r
if lengthEnd == 1 {
	return nil, 0, invalidDataErr // missing length: $\\r\\n
}

// now we are at \\r - need to validate next byte is \\n
i++
if i >= len(buff) {
	return nil, 0, nil // buffer too small, incomplete data
}
if buff[i] != '\\n' {
	return nil, 0, invalidDataErr
}

length, err := strconv.Atoi(string(buff[1:lengthEnd]))`}</CodeBlock>

        <p className="mb-4">
          <Code>ParseData</Code> returns the payload, the total number of bytes
          consumed from the buffer (always more than the payload length), and an
          error — so <Code>$4\r\nPING\r\n</Code> yields{" "}
          <Code>[]byte(&quot;PING&quot;), 10, nil</Code>. Tracking bytes consumed
          is what lets the caller keep reading from the right offset.
        </p>

        <p className="mb-4">
          Getting every edge case right here was genuinely tedious, and it took a
          lot of tests. The payoff is a clean three-way distinction between
          valid, <em>invalid</em>, and merely <em>incomplete</em> data — which
          the read loop later depends on entirely. One thing worth noting: the
          length is user supplied, so something like{" "}
          <Code>$10000000000</Code> would have the server reading forever. Real
          Redis caps it, and adding the same guard is trivial.
        </p>

        <SectionHeading>Parsing arrays</SectionHeading>

        <p className="mb-4">
          Once bulk strings work, arrays are nearly free.{" "}
          <Code>*2\r\n$4\r\nECHO\r\n$5\r\nhello\r\n</Code> is a <Code>*</Code>, a
          base-10 length, a CRLF, then N bulk strings back to back. So{" "}
          <Code>ParseMessage</Code> reads the length exactly the same way and
          then calls <Code>ParseData</Code> in a loop, returning a{" "}
          <Code>[][]byte</Code>, the bytes consumed, and an error. That example
          parses to <Code>[[]byte(&quot;ECHO&quot;), []byte(&quot;hello&quot;)]</Code>{" "}
          with 25 bytes consumed.
        </p>

        <SectionHeading>The store</SectionHeading>

        <p className="mb-4">
          The easiest part: a <Code>map[string]string</Code> behind a mutex. The
          only real design question was expiry. My first instinct was to spin up
          a goroutine per expiring key to delete it later, which is wildly
          wasteful. The simpler answer is <em>lazy</em> expiration — keep a
          second map of expiry timestamps and check it on access.
        </p>

        <CodeBlock lang="go">{`type RedisStore struct {
	mu     sync.RWMutex
	data   map[string]string
	expire map[string]int64
	now    func() time.Time
}

func (r *RedisStore) checkExpire(key string) {
	now := r.now().Unix()

	if expiration, toBeExpired := r.expire[key]; toBeExpired && now >= expiration {
		delete(r.data, key)
		delete(r.expire, key)
	}
}

func (r *RedisStore) Get(key string) (string, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.checkExpire(key)

	value, exists := r.data[key]
	return value, exists
}`}</CodeBlock>

        <p>
          Real Redis does both: lazy checks on access, plus a sweeper that
          samples keys with a TTL roughly ten times a second, so keys that are
          set and never touched again still get reclaimed eventually.
        </p>

        <SectionHeading>Responder</SectionHeading>

        <p>
          The glue between parser and store. Every message has the same shape —{" "}
          <Code>COMMAND args</Code> — so the responder is a switch over the first
          element that validates the argument count, calls the matching store
          method, and encodes the reply. Nothing clever, which is the point.
        </p>

        <SectionHeading>Buffered read loop</SectionHeading>

        <p className="mb-4">
          This is where the parser&apos;s return values earn their keep. A single{" "}
          <Code>conn.Read</Code> can hand you less than one message, exactly one,
          or several at once. <Code>ParseMessage</Code> consumes at most one, so
          the loop is: parse from the buffer; if bytes consumed is greater than
          zero, reslice the buffer past the message and break; otherwise read
          more from the connection and try again. A non-nil error means the data
          is invalid and the connection dies; a nil error with zero bytes
          consumed just means the frame hasn&apos;t fully arrived yet.
        </p>

        <CodeBlock lang="go">{`func RedisConnection(conn net.Conn, kv responder.Store) {
	defer conn.Close()

	buff := make([]byte, 0, 1024)
	for {
		var message [][]byte
		for {
			// read buff first - in case more than 1 message came
			readMessage, bytesRead, err := parser.ParseMessage(buff)
			if err != nil {
				log.Printf("Got error parsing: %v\\n", err)
				return
			}

			if bytesRead > 0 {
				newBuff := make([]byte, 0, 1024)
				buff = append(newBuff, buff[bytesRead:]...) // reslice
				message = readMessage
				break
			}

			data := make([]byte, 1024)
			n, err := conn.Read(data)
			if err != nil {
				log.Printf("Got error reading: %v\\n", err)
				return
			}
			buff = append(buff, data[:n]...)
		}

		response, err := responder.GetResponse(message, kv)
		if err != nil {
			return
		}

		if _, err = conn.Write(response); err != nil {
			return
		}
	}
}`}</CodeBlock>

        <p>
          <Code>main</Code> itself is barely anything: open a TCP listener, and
          hand each accepted connection to this function in its own goroutine.
        </p>

        <SectionHeading>Testing</SectionHeading>

        <p className="mb-4">
          Two findings worth keeping. The first is time. Coming from JavaScript,
          my reflex is to fake the clock globally and remember to restore it. In
          Go the neater option is the <Code>now func() time.Time</Code> field on
          the store — tests inject their own. Testing a 5-second TTL becomes
          moving the fake clock forward 5 seconds instead of actually sleeping
          for them.
        </p>

        <p className="mb-4">
          The second is concurrency. I added a test that fires <Code>INCR</Code>{" "}
          from 100 goroutines and asserts the counter landed exactly 100 higher,
          and ran the suite with <Code>-race</Code> to let the built-in race
          detector flag unsynchronised writes.
        </p>

        <p>
          The interesting bit is what the race detector <em>couldn&apos;t</em>{" "}
          catch. My memory access was correctly guarded by mutexes — clean under{" "}
          <Code>-race</Code> — but the logic was still wrong:{" "}
          <Code>INCR</Code> on a missing key returned 0 instead of initialising
          to 1. Only the assertion on the final value caught it. Synchronisation
          and correctness are separate problems.
        </p>
      </div>
    </ProjectPageLayout>
  );
}
