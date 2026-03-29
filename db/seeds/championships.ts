import { constructor_championships, driver_championships } from "../schema";
import { openF1Fetch } from "./openf1";
import type { DbClient } from "./types";

type OpenF1DriverChampionship = {
  driver_number: number;
  meeting_key: number | null;
  points_current: number | null;
  points_start: number | null;
  position_current: number | null;
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
  meeting_key: number | null;
  points_current: number | null;
  points_start: number | null;
  position_current: number | null;
  position_start: number | null;
  session_key: number;
  team_name: string;
};

const INSERT_CHUNK_SIZE = 500;

function chunkArray<T>(rows: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
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
    openF1Fetch<OpenF1DriverChampionship[]>("/championship_drivers?session_key=latest"),
    openF1Fetch<OpenF1ConstructorChampionship[]>("/championship_teams?session_key=latest"),
  ]);

  if (driverRows.length > 0) {
    await insertDriverChampionshipRows(db, driverRows);
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
    openF1Fetch<OpenF1DriverChampionship[]>("/championship_drivers"),
    openF1Fetch<OpenF1ConstructorChampionship[]>("/championship_teams"),
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
