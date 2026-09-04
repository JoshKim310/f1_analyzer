import type { DbClient } from "./types";

import { seedMeetings } from "./meetings";
import { seedSessions } from "./sessions";
import { seedSessionResults } from "./session-results";
import { seedDrivers } from "./drivers";
import { seedChampionships } from "./championships";

export async function runMaintenanceSeed(
  db: DbClient,
  year: number,
  log: (message: string) => void,
) {
  await seedMeetings({ db, log });
  await seedSessions({ db, log });
  await seedSessionResults({ db, year, log });
  await seedDrivers({ db, log });
  await seedChampionships(db, log);
}