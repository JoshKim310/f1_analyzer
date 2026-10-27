import { cache } from "react";
import { db } from "@/db";
import { drivers, drivers_latest, sessions } from "../schema";
import { desc, eq, sql } from "drizzle-orm";

export const getDriversLatest = cache(async () => {
  return db
    .select({
    driver_number: drivers_latest.driver_number,
    first_name: drivers_latest.first_name,
    last_name: drivers_latest.last_name,
    team_name: drivers_latest.team_name,
    team_colour: drivers_latest.team_colour,
    name_acronym: drivers_latest.name_acronym,
    })
    .from(drivers_latest)
});

export const getDriversCurrentSeason = cache(async () => {
  return db
    .select({
      driver_number: drivers.driver_number,
      first_name: drivers.first_name,
      last_name: drivers.last_name,
      team_name: drivers.team_name,
      team_colour: drivers.team_colour,
      name_acronym: drivers.name_acronym,
      session_key: drivers.session_key,
    })
    .from(drivers)
    .innerJoin(
      sessions,
      eq(drivers.session_key, sessions.session_key)
    )
    .where(sql`
      ${sessions.year} = extract(year from now())::int
    `)
    .orderBy(desc(sql`${sessions.date_start}::timestamptz`));
});