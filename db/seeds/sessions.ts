import { sessions } from "../schema";
import { openF1Fetch } from "./openf1";
import type { SeedContext } from "./types";

type OpenF1Session = {
  session_key: number;
  circuit_key: number | null;
  circuit_short_name: string | null;
  country_code: string | null;
  country_name: string | null;
  date_start: string | null;
  date_end: string | null;
  gmt_offset: string | null;
  location: string | null;
  meeting_key: number | null;
  session_name: string | null;
  session_type: string | null;
  year: number | null;
};

const INSERT_CHUNK_SIZE = 1500;

function chunkArray<T>(rows: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

function mapSessionRow(row: OpenF1Session, fallbackYear: number | null) {
  return {
    session_key: row.session_key,
    circuit_key: row.circuit_key,
    circuit_short_name: row.circuit_short_name,
    country_code: row.country_code,
    country_name: row.country_name,
    date_start: row.date_start,
    date_end: row.date_end,
    gmt_offset: row.gmt_offset,
    location: row.location,
    meeting_key: row.meeting_key,
    session_name: row.session_name,
    session_type: row.session_type,
    year: row.year ?? fallbackYear,
  };
}

async function insertSessionRows(db: SeedContext["db"], rows: ReturnType<typeof mapSessionRow>[]) {
  for (const chunk of chunkArray(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(sessions)
      .values(chunk)
      .onConflictDoNothing({
        target: sessions.session_key,
      });
  }
}

export async function seedSessionsFullHistory({ db, log }: Omit<SeedContext, "year">) {
  const rows = await openF1Fetch<OpenF1Session[]>("/sessions");

  if (rows.length === 0) {
    log("sessions(full): no rows returned");
    return { inserted: 0 };
  }

  await insertSessionRows(
    db,
    rows.map((row) => mapSessionRow(row, null))
  );

  log(`sessions(full): inserted ${rows.length} rows from base endpoint`);
  return { inserted: rows.length };
}

export async function seedSessions({ db, year, log }: SeedContext) {
  const rows = await openF1Fetch<OpenF1Session[]>(`/sessions?year=${year}`);

  if (rows.length === 0) {
    log(`sessions: no rows for ${year}`);
    return { inserted: 0 };
  }

  await insertSessionRows(
    db,
    rows.map((row) => mapSessionRow(row, year))
  );

  log(`sessions: upserted ${rows.length} rows for ${year}`);
  return { inserted: rows.length };
}
