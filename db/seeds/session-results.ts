import { session_results, sessions } from "../schema";
import { and, eq, inArray, lt } from "drizzle-orm";
import { openF1Fetch } from "./openf1";
import type { SeedContext } from "./types";

type SessionRef = {
  session_key: number;
  meeting_key: number | null;
};

type OpenF1SessionResult = {
  dnf: boolean | null;
  dns: boolean | null;
  dsq: boolean | null;
  driver_number: number;
  duration: number | string | null;
  gap_to_leader: number | string | null;
  number_of_laps: number | null;
  position: number | null;
  meeting_key?: number | null;
  session_key?: number | null;
};

const INSERT_CHUNK_SIZE = 2000;

function toDecimal3(value: number | string | null | undefined) {
  if (value == null) return null;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;

  return parsed.toFixed(3);
}

function chunkArray<T>(rows: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

async function insertSessionResultRows(
  db: SeedContext["db"],
  rows: {
    dnf: boolean;
    dns: boolean;
    dsq: boolean;
    driver_number: number;
    duration: string | null;
    gap_to_leader: string | null;
    number_of_laps: number | null;
    meeting_key: number | null;
    position: number | null;
    session_key: number;
  }[]
) {
  for (const chunk of chunkArray(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(session_results)
      .values(chunk)
      .onConflictDoNothing({
        target: [session_results.session_key, session_results.driver_number],
      });
  }
}

export async function seedSessionResultsFullHistory({ db, log }: Omit<SeedContext, "year">) {
  const rows = await openF1Fetch<OpenF1SessionResult[]>("/session_result");

  if (rows.length === 0) {
    log("session_results(full): no rows returned");
    return { inserted: 0 };
  }

  const mappedRows = rows
    .filter((row) => row.session_key != null && row.driver_number != null)
    .map((row) => ({
      dnf: row.dnf ?? false,
      dns: row.dns ?? false,
      dsq: row.dsq ?? false,
      driver_number: row.driver_number,
      duration: toDecimal3(row.duration),
      gap_to_leader: toDecimal3(row.gap_to_leader),
      number_of_laps: row.number_of_laps,
      meeting_key: row.meeting_key ?? null,
      position: row.position,
      session_key: row.session_key as number,
    }));

  await insertSessionResultRows(db, mappedRows);

  log(`session_results(full): inserted ${mappedRows.length} rows from base endpoint`);
  return { inserted: mappedRows.length };
}

export async function seedSessionResults({ db, year, log }: SeedContext) {
  const sessionRows = await db
    .select({
      session_key: sessions.session_key,
      meeting_key: sessions.meeting_key,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.year, year),
        lt(sessions.date_end, new Date().toISOString())
      )
    );

  if (sessionRows.length === 0) {
    log(`session_results: no completed sessions for ${year}, skipping`);
    return { inserted: 0 };
  }

  const existing = await db
    .select({ session_key: session_results.session_key })
    .from(session_results)
    .where(inArray(session_results.session_key, sessionRows.map((s) => s.session_key)));

  const seededSessionKeys = new Set(existing.map((row) => row.session_key));
  const pendingSessions = sessionRows.filter((row) => !seededSessionKeys.has(row.session_key));

  if (pendingSessions.length === 0) {
    log(`session_results: all ${sessionRows.length} sessions already seeded for ${year}`);
    return { inserted: 0 };
  }

  let seen = 0;
  const toInsert: {
    dnf: boolean;
    dns: boolean;
    dsq: boolean;
    driver_number: number;
    duration: string | null;
    gap_to_leader: string | null;
    number_of_laps: number | null;
    meeting_key: number | null;
    position: number | null;
    session_key: number;
  }[] = [];

  for (const session of pendingSessions as SessionRef[]) {
    const endpoint = `/session_result?session_key=${session.session_key}`;

    let rows: OpenF1SessionResult[];
    try {
      rows = await openF1Fetch<OpenF1SessionResult[]>(endpoint);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // OpenF1 returns 404 for sessions that have no published results yet.
      if (message.includes("(404)") && message.includes("No results found")) {
        log(`session_results: no published results for session ${session.session_key}, skipping`);
        continue;
      }

      throw error;
    }

    if (rows.length === 0) {
      continue;
    }

    seen += rows.length;

    toInsert.push(
      ...rows.map((row) => ({
        dnf: row.dnf ?? false,
        dns: row.dns ?? false,
        dsq: row.dsq ?? false,
        driver_number: row.driver_number,
        duration: toDecimal3(row.duration),
        gap_to_leader: toDecimal3(row.gap_to_leader),
        number_of_laps: row.number_of_laps,
        meeting_key: session.meeting_key,
        position: row.position,
        session_key: session.session_key,
      }))
    );
  }

  await insertSessionResultRows(db, toInsert);

  log(`session_results: inserted ${seen} rows from ${pendingSessions.length}/${sessionRows.length} sessions`);
  return { inserted: seen };
}
