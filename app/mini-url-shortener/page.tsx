import type { Metadata } from "next";
import ProjectPageLayout from "@/components/project-page-layout";

export const metadata: Metadata = {
  title: "Mini-URL-Shortener — Theo Learns Go",
  description:
    "A URL shortener with click analytics, built with Go and PostgreSQL.",
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

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 mb-4 space-y-1.5 marker:text-primary/50">
      {children}
    </ul>
  );
}

export default function MiniUrlShortenerPage() {
  return (
    <ProjectPageLayout
      id={4}
      title="Mini-URL-Shortener"
      subtitle="A URL shortener with click analytics, built with Go and PostgreSQL."
      tags={["Go", "PostgreSQL", "SQL", "window functions", "time zones"]}
      status="complete"
      date="Oct 2026"
      github="https://github.com/fs1g17/Mini-URL-Shortener"
    >
      <div className="text-sm text-foreground/75 leading-7">
        <p className="mb-4">
          The goal of this one was to get properly into PostgreSQL. The setup is
          the same as before — a Go backend and a Postgres database — and the app
          is deliberately small: users sign up, shorten links (optionally with an
          expiry or a click limit), and get click analytics back. There are only
          three tables, and the interesting part is the SQL.
        </p>

        <SectionHeading>Designing the slug</SectionHeading>

        <p className="mb-2">
          My first idea was a deterministic slug: the last 6 characters of a hash
          of the URL. Two problems showed up straight away:
        </p>

        <List>
          <li>
            Two users shortening the same URL would get the same slug, so
            looking up a slug could return several rows.
          </li>
          <li>A single user couldn&apos;t shorten the same URL twice.</li>
        </List>

        <p className="mb-4">
          A random slug fixes both. If one ever collides with an existing slug,
          the <Code>UNIQUE</Code> constraint rejects the insert and the user can
          just retry. (Retrying automatically in Go would be easy, but it was out
          of scope.)
        </p>

        <CodeBlock lang="go">{`func generateSlug() string {
	b := make([]byte, 4)
	rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}`}</CodeBlock>

        <p className="mb-2">Why 4 bytes come out as 6 characters:</p>

        <List>
          <li>4 bytes is 32 bits.</li>
          <li>Each base64 character encodes 6 bits.</li>
          <li>32 / 6 ≈ 5.3, so it takes 6 characters.</li>
        </List>

        <p className="mb-4">
          Changing bases is always a little tricky, and two details are easy to
          miss. First, the <em>Raw</em> in <Code>RawURLEncoding</Code>: standard
          base64 pads its output to a multiple of 4 characters, so these 4 bytes
          would come out as 8 (<Code>xxxxxx==</Code>) and wouldn&apos;t fit the{" "}
          <Code>CHAR(6)</Code> column. (The <em>URL</em> part swaps{" "}
          <Code>+</Code> and <Code>/</Code> for <Code>-</Code> and{" "}
          <Code>_</Code>, which are safe in a path.) Second, 32 bits don&apos;t
          split evenly into 6-bit characters, so the last character only carries
          2 bits — every slug ends in <Code>A</Code>, <Code>Q</Code>,{" "}
          <Code>g</Code> or <Code>w</Code>, and there are 2³² (about 4.3 billion)
          possible slugs rather than 64⁶.
        </p>

        <SectionHeading>The schema</SectionHeading>

        <CodeBlock lang="schema">{`users
  id             SERIAL       PRIMARY KEY
  username       TEXT         NOT NULL UNIQUE
  password_hash  TEXT         NOT NULL

links
  id             SERIAL       PRIMARY KEY
  slug           CHAR(6)      NOT NULL UNIQUE      -- public lookup key
  redirect_url   TEXT         NOT NULL
  click_count    INTEGER      NOT NULL DEFAULT 0   -- denormalised counter
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
  click_limit    INTEGER                           -- NULL = unlimited
  expires        TIMESTAMPTZ                       -- NULL = never
  owner_id       INTEGER      NOT NULL REFERENCES users(id)

click_events
  id             SERIAL       PRIMARY KEY
  link_id        INTEGER      NOT NULL REFERENCES links(id)
  clicked_at     TIMESTAMPTZ  NOT NULL DEFAULT now()

users 1 ──< links 1 ──< click_events`}</CodeBlock>

        <p className="mb-4">
          <Code>click_count</Code> duplicates what <Code>click_events</Code>{" "}
          already knows. It&apos;s denormalised on purpose, so a redirect can
          check the click limit without counting rows. The interesting SQL is in
          three queries.
        </p>

        <SectionHeading>1. Redirects</SectionHeading>

        <p className="mb-4">
          When someone visits a short link, <Code>GetRedirectURL</Code> has to
          check the link hasn&apos;t expired or hit its click limit, and count the
          click. Doing that as a <Code>SELECT</Code>, a check in Go, then an{" "}
          <Code>UPDATE</Code> has a race: two simultaneous clicks on a link with
          one click left can both pass the check. So the lookup, the validation
          and the increment all happen in a single statement:
        </p>

        <CodeBlock lang="sql">{`UPDATE links
SET click_count = click_count + 1
WHERE
    slug = $1 AND
    (click_limit IS NULL OR click_count < click_limit) AND
    (expires IS NULL OR now() < expires)
RETURNING redirect_url, id;`}</CodeBlock>

        <p className="mb-4">
          If the slug is wrong, the link has expired or the limit is reached, the{" "}
          <Code>WHERE</Code> clause matches nothing, no row comes back, and the
          handler returns a 404. Because <Code>UPDATE</Code> locks the row, a
          concurrent click waits its turn and then re-checks the{" "}
          <Code>WHERE</Code> clause against the new count, so the limit can&apos;t
          be overshot. On success, a row also goes into{" "}
          <Code>click_events</Code>, which is what the analytics run on.
        </p>

        <SectionHeading>2. Hits per day</SectionHeading>

        <p className="mb-4">
          <Code>GetHitsPerDay</Code> returns one link&apos;s clicks per day over a
          date range:
        </p>

        <CodeBlock lang="sql">{`SELECT g::date AS day, COALESCE(c.total_count, 0) AS total_count
FROM generate_series(
    $1 AT TIME ZONE 'UTC',
    $2 AT TIME ZONE 'UTC',
    '1 day'::interval
) AS g
LEFT JOIN (
    SELECT date(clicked_at AT TIME ZONE 'UTC') AS day, count(clicked_at) AS total_count
    FROM click_events
    WHERE clicked_at >= $1 AND clicked_at < $2 + interval '1 day'
      AND link_id = $3
    GROUP BY 1
) AS c
ON g.g::date = c.day
ORDER BY day;`}</CodeBlock>

        <p className="mb-4">
          The catch is that a day with no clicks has no rows in{" "}
          <Code>click_events</Code>, so a plain <Code>GROUP BY</Code> would just
          skip it. <Code>generate_series</Code> builds a row for every day from{" "}
          <Code>from</Code> to <Code>to</Code>, and <Code>LEFT JOIN</Code>-ing the
          counts onto it with <Code>COALESCE(…, 0)</Code> fills the gaps with
          zeros:
        </p>

        <CodeBlock lang="output">{`day          total_count
----------   -----------
2026-10-01   3
2026-10-02   0             <- no clicks, still listed
2026-10-03   5
2026-10-04   1`}</CodeBlock>

        <p className="mb-4">
          The other subtlety is time zones. A <Code>timestamptz</Code> is stored
          as an instant in UTC (microseconds since the epoch), but when you read
          one back, Postgres converts it to the session&apos;s time zone. So
          which day a click lands on depends on the connection&apos;s settings: a
          click at 23:30 UTC belongs to the next day for a session in UTC+4.
          Converting with <Code>AT TIME ZONE &apos;UTC&apos;</Code> before taking
          the date means the buckets are always UTC days, whatever the session
          says.
        </p>

        <SectionHeading>3. Ranking links</SectionHeading>

        <p className="mb-4">
          <Code>GetLinkRanks</Code> ranks all of a user&apos;s links by clicks
          within a date range, along with each link&apos;s share of the total. My
          first plan was to use <Code>click_count</Code> on <Code>links</Code>,
          but that&apos;s an all-time total and can&apos;t be filtered by date,
          so the counts have to come from <Code>click_events</Code>.
        </p>

        <CodeBlock lang="sql">{`SELECT
    links.slug AS slug,
    COUNT(click_events.id),
    DENSE_RANK() OVER (
        ORDER BY COUNT(click_events.id) DESC
    ),
    COALESCE(
        100.0 * COUNT(click_events.id) / NULLIF(SUM(COUNT(click_events.id)) OVER (), 0),
        0
    ) AS percent
FROM links
LEFT JOIN click_events
    ON links.id = click_events.link_id
    AND clicked_at >= $2 AND clicked_at < $3::timestamptz + interval '1 day'
WHERE links.owner_id = $1
GROUP BY links.id
ORDER BY dense_rank, slug;`}</CodeBlock>

        <CodeBlock lang="output">{`slug     count   dense_rank   percent
------   -----   ----------   -------
aB3x_Q   12      1            60.0
k9Fx-g   4       2            20.0
pL2_wA   4       2            20.0
xM8bVw   0       3            0.0`}</CodeBlock>

        <p className="mb-2">A few things are going on here:</p>

        <List>
          <li>
            <Code>DENSE_RANK</Code> gives tied links the same rank without
            leaving gaps: 1, 2, 2, 3, where <Code>RANK</Code> would give 1, 2, 2,
            4.
          </li>
          <li>
            <Code>SUM(COUNT(…)) OVER ()</Code> looks odd, but it works because
            window functions run after <Code>GROUP BY</Code>.{" "}
            <Code>COUNT</Code> gives each link&apos;s clicks, and the empty{" "}
            <Code>OVER ()</Code> sums them across all rows to get the total.
          </li>
          <li>
            If there were no clicks at all, that total is 0.{" "}
            <Code>NULLIF</Code> turns it into <Code>NULL</Code>, so the division
            returns <Code>NULL</Code> instead of a division-by-zero error, and{" "}
            <Code>COALESCE</Code> turns that back into 0.
          </li>
        </List>

        <p>
          Finally, the date filter lives in the <Code>ON</Code> clause, not{" "}
          <Code>WHERE</Code>, because I wanted every link listed, even ones with
          no clicks in the range. With the condition in <Code>ON</Code>, such a
          link still produces one row, padded with <Code>NULL</Code>, and{" "}
          <Code>COUNT(click_events.id)</Code> skips <Code>NULL</Code> values,
          giving 0.
          Put the same condition in <Code>WHERE</Code> and it runs after the
          join: <Code>clicked_at</Code> is <Code>NULL</Code> on those padded
          rows, so they get filtered out, and the <Code>LEFT JOIN</Code> quietly
          behaves like an inner join.
        </p>
      </div>
    </ProjectPageLayout>
  );
}
