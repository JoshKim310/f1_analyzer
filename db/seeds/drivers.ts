import { drivers } from "../schema";
import { openF1Fetch } from "./openf1";
import type { SeedContext } from "./types";

type OpenF1Driver = {
  driver_number: number;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
  team_colour: string | null;
  headshot_url: string | null;
  name_acronym: string | null;
  meeting_key?: number | null;
  session_key?: number | null;
};

const INSERT_CHUNK_SIZE = 500;

function chunkArray<T>(rows: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

function mapDriverRow(row: OpenF1Driver) {
  return {
    driver_number: row.driver_number,
    first_name: row.first_name,
    last_name: row.last_name,
    team_name: row.team_name,
    team_colour: row.team_colour,
    headshot_url: row.headshot_url,
    name_acronym: row.name_acronym,
    meeting_key: row.meeting_key ?? null,
    session_key: row.session_key ?? null,
  };
}

async function insertDriverRows(db: SeedContext["db"], rows: ReturnType<typeof mapDriverRow>[]) {
  for (const chunk of chunkArray(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(drivers)
      .values(chunk)
      .onConflictDoNothing({
        target: drivers.driver_number,
      });
  }
}

export async function seedDriversFullHistory({ db, log }: Omit<SeedContext, "year">) {
  const rows = await openF1Fetch<OpenF1Driver[]>("/drivers");

  if (rows.length === 0) {
    log("drivers(full): no rows returned");
    return { inserted: 0 };
  }

  await insertDriverRows(
    db,
    rows.map(mapDriverRow)
  );

  log(`drivers(full): inserted ${rows.length} rows from base endpoint`);
  return { inserted: rows.length };
}

export async function seedDrivers({ db, year, log }: SeedContext) {
  const rows = await openF1Fetch<OpenF1Driver[]>("/drivers?session_key=latest");

  if (rows.length === 0) {
    log(`drivers: no rows returned for ${year}`);
    return { inserted: 0 };
  }

  await insertDriverRows(
    db,
    rows.map(mapDriverRow)
  );

  log(`drivers: inserted ${rows.length} rows from latest snapshot`);
  return { inserted: rows.length };
}
