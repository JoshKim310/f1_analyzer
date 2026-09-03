import { constructor_championships, driver_championships } from "../schema";
import { openF1Fetch } from "./openf1";
import type { DbClient } from "./types";

type OpenF1DriverChampionship = {
  driver_number: number;
  meeting_key: number;
  points_current: number | null;
  points_start: number | null;
  position_current: number;
  position_start: number | null;
  session_key: number;
};

type OpenF1ConstructorChampionship = {
  meeting_key: number | null;
  points_current: number | null;
  points_start: number | null;
  position_current: number | null;
  position_start: number | null;
  session_key: number;
  team_name: string;
};
type ConstructorChampionshipInsert = {
  meeting_key: number;
  points_current: number | null;
  points_start: number | null;
  position_current: number | null;
  position_start: number | null;
  session_key: number;
  team_name: string;
};

const INSERT_CHUNK_SIZE = 500;

async function fetchOpenF1RowsOrEmpty<T>(
  endpoint: string,
  log: (message: string) => void,
  label: string,
) {
  try {
    return await openF1Fetch<T[]>(endpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // OpenF1 sometimes returns 404 with "No results found" while data is not published yet.
    if (message.includes("(404)") && message.includes("No results found")) {
      log(`${label}: no rows from ${endpoint}, skipping`);
      return [] as T[];
    }

    throw error;
  }
}

function chunkArray<T>(rows: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

function normalizeDriverRows(rows: OpenF1DriverChampionship[]) {
  return rows
    .filter(
      (row): row is OpenF1DriverChampionship & {
        meeting_key: number;
        position_current: number;
      } =>
        row.meeting_key != null &&
        row.position_current != null,
    );
}

async function insertDriverChampionshipRows(db: DbClient, rows: OpenF1DriverChampionship[]) {
  for (const chunk of chunkArray(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(driver_championships)
      .values(chunk)
      .onConflictDoNothing({
        target: [driver_championships.session_key, driver_championships.driver_number],
      });
  }
}

function normalizeConstructorRows(rows: OpenF1ConstructorChampionship[]) {
  return rows
    .map((row) => ({
      ...row,
      team_name: row.team_name?.trim() ?? null,
    }))
    .filter((row): row is ConstructorChampionshipInsert => row.team_name != null && row.team_name.length > 0);
}

async function insertConstructorChampionshipRows(db: DbClient, rows: ConstructorChampionshipInsert[]) {
  for (const chunk of chunkArray(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(constructor_championships)
      .values(chunk)
      .onConflictDoNothing({
        target: [constructor_championships.session_key, constructor_championships.team_name],
      });
  }
}

export async function seedChampionships(db: DbClient, log: (message: string) => void) {
  const [driverRows, constructorRows] = await Promise.all([
    fetchOpenF1RowsOrEmpty<OpenF1DriverChampionship>(
      "/championship_drivers?session_key=latest",
      log,
      "championships"
    ),
    fetchOpenF1RowsOrEmpty<OpenF1ConstructorChampionship>(
      "/championship_teams?session_key=latest",
      log,
      "championships"
    ),
  ]);

  const validDriverRows = normalizeDriverRows(driverRows);

  if (validDriverRows.length > 0) {
    await insertDriverChampionshipRows(db, validDriverRows);
  }

  const validConstructorRows = normalizeConstructorRows(constructorRows);
  const droppedConstructorRows = constructorRows.length - validConstructorRows.length;

  if (droppedConstructorRows > 0) {
    log(`championships: dropped ${droppedConstructorRows} constructor rows with null/blank team_name`);
  }

  if (validConstructorRows.length > 0) {
    await insertConstructorChampionshipRows(db, validConstructorRows);
  }

  log(`championships: inserted driver=${driverRows.length}, constructor=${validConstructorRows.length}`);
  return {
    driver: driverRows.length,
    constructor: validConstructorRows.length,
  };
}

export async function seedChampionshipsFullHistory(db: DbClient, log: (message: string) => void) {
  const [driverRows, constructorRows] = await Promise.all([
    fetchOpenF1RowsOrEmpty<OpenF1DriverChampionship>(
      "/championship_drivers",
      log,
      "championships(full)"
    ),
    fetchOpenF1RowsOrEmpty<OpenF1ConstructorChampionship>(
      "/championship_teams",
      log,
      "championships(full)"
    ),
  ]);

  if (driverRows.length > 0) {
    await insertDriverChampionshipRows(db, driverRows);
  }

  const validConstructorRows = normalizeConstructorRows(constructorRows);
  const droppedConstructorRows = constructorRows.length - validConstructorRows.length;

  if (droppedConstructorRows > 0) {
    log(`championships(full): dropped ${droppedConstructorRows} constructor rows with null/blank team_name`);
  }

  if (validConstructorRows.length > 0) {
    await insertConstructorChampionshipRows(db, validConstructorRows);
  }

  log(`championships(full): inserted driver=${driverRows.length}, constructor=${validConstructorRows.length}`);
  return {
    driver: driverRows.length,
    constructor: validConstructorRows.length,
  };
}
