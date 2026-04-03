import { meetings } from "../schema";
import { and, eq, inArray, lt } from "drizzle-orm";
import { openF1Fetch } from "./openf1";
import type { SeedContext } from "./types";

type OpenF1Meetings = {
  meeting_key: number | null;
  circuit_key: number | null;
  circuit_image: string | null;
  circuit_info_url: string | null;
  circuit_short_name: string | null;
  circuit_type: string | null;
  country_code: string | null;
  country_flag: string | null;
  country_name: string | null;
  date_end: string | null;
  date_start: string | null;
  gmt_offset: string | null;
  location: string | null;
  meeting_name: string | null;
  meeting_official_name: string | null;
  year: number | null;
};

const INSERT_CHUNK_SIZE = 2000;

function chunkArray<T>(rows: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

async function insertMeetingRows(
  db: SeedContext["db"],
  rows: {
    meeting_key: number;
    circuit_key: number;
    circuit_image: string;
    circuit_info_url: string;
    circuit_short_name: string;
    circuit_type: string;
    country_code: string;
    country_flag: string;
    country_name: string;
    date_end: string;
    date_start: string;
    gmt_offset: string;
    location: string;
    meeting_name: string;
    meeting_official_name: string;
    year: number;
  }[]
) {
  for (const chunk of chunkArray(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(meetings)
      .values(chunk)
      .onConflictDoNothing({
        target: [meetings.meeting_key],
      });
  }
}

export async function seedMeetingsFullHistory({ db, log }: Omit<SeedContext, "year">) {
  const rows = await openF1Fetch<OpenF1Meetings[]>("/meetings");

  if (rows.length === 0) {
    log("meetings(full): no rows returned");
    return { inserted: 0 };
  }

  const mappedRows = rows
    .filter(
      (row): row is OpenF1Meetings & { meeting_key: number; circuit_key: number; year: number } =>
        row.meeting_key != null && row.year != null && row.circuit_key != null
    )
    .map((row) => ({
      meeting_key: row.meeting_key,
      circuit_key: row.circuit_key,
      circuit_image: row.circuit_image ?? "",
      circuit_info_url: row.circuit_info_url ?? "",
      circuit_short_name: row.circuit_short_name ?? "",
      circuit_type: row.circuit_type ?? "",
      country_code: row.country_code ?? "",
      country_flag: row.country_flag ?? "",
      country_name: row.country_name ?? "",
      date_end: row.date_end ?? "",
      date_start: row.date_start ?? "",
      gmt_offset: row.gmt_offset ?? "",
      location: row.location ?? "",
      meeting_name: row.meeting_name ?? "",
      meeting_official_name: row.meeting_official_name ?? "",
      year: row.year,
    }));

  await insertMeetingRows(db, mappedRows);

  log(`meetings(full): inserted ${mappedRows.length} rows from base endpoint`);
  return { inserted: mappedRows.length };
}

export async function seedMeetings({ db, year, log }: SeedContext) {
  const meetingRows = await db
    .select({
      meeting_key: meetings.meeting_key,
    })
    .from(meetings)
    .where(
      and(
        eq(meetings.year, year),
        lt(meetings.date_start, new Date().toISOString())
      )
    );

  if (meetingRows.length === 0) {
    log(`meetings: no completed sessions for ${year}, skipping`);
    return { inserted: 0 };
  }

  const existing = await db
    .select({ meeting_key: meetings.meeting_key })
    .from(meetings)
    .where(inArray(meetings.meeting_key, meetingRows.map((s) => s.meeting_key)));

  const seededMeetingKeys = new Set(existing.map((row) => row.meeting_key));
  const pendingMeetings = meetingRows.filter((row) => !seededMeetingKeys.has(row.meeting_key));

  if (pendingMeetings.length === 0) {
    log(`meetings: all ${meetingRows.length} meetings already seeded for ${year}`);
    return { inserted: 0 };
  }

  let seen = 0;
  const toInsert: {
    meeting_key: number;
    circuit_key: number;
    circuit_image: string;
    circuit_info_url: string;
    circuit_short_name: string;
    circuit_type: string;
    country_code: string;
    country_flag: string;
    country_name: string;
    date_end: string;
    date_start: string;
    gmt_offset: string;
    location: string;
    meeting_name: string;
    meeting_official_name: string;
    year: number;
  }[] = [];

  for (const meeting of pendingMeetings) {
    const endpoint = `/meetings?meeting_key=${meeting.meeting_key}`;
    const rows = await openF1Fetch<OpenF1Meetings[]>(endpoint);

    if (rows.length === 0) {
      continue;
    }

    seen += rows.length;

    const validRows = rows.filter(
      (row): row is OpenF1Meetings & { meeting_key: number; circuit_key: number; year: number } =>
        row.meeting_key != null && row.circuit_key != null && row.year != null
    );

    toInsert.push(
      ...validRows.map((row) => ({
        meeting_key: meeting.meeting_key,
        circuit_key: row.circuit_key,
        circuit_image: row.circuit_image ?? "",
        circuit_info_url: row.circuit_info_url ?? "",
        circuit_short_name: row.circuit_short_name ?? "",
        circuit_type: row.circuit_type ?? "",
        country_code: row.country_code ?? "",
        country_flag: row.country_flag ?? "",
        country_name: row.country_name ?? "",
        date_end: row.date_end ?? "",
        date_start: row.date_start ?? "",
        gmt_offset: row.gmt_offset ?? "",
        location: row.location ?? "",
        meeting_name: row.meeting_name ?? "",
        meeting_official_name: row.meeting_official_name ?? "",
        year: row.year,
      }))
    );
  }

  await insertMeetingRows(db, toInsert);

  log(`meetings: inserted ${seen} rows from ${pendingMeetings.length}/${meetingRows.length} meetings`);
  return { inserted: seen };
}
