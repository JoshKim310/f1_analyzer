import { cache } from "react";
import { db } from "@/db";
import { driver_championships, driver_standings_latest, sessions } from "@/db/schema";
import { asc, desc, sql } from "drizzle-orm";

export const getDriverStandingsLatest = cache(async () => {
  return db
    .select()
    .from(driver_standings_latest)
    .orderBy(asc(driver_standings_latest.position_current))
});

export const getDriverStandingsByYear = cache(async (year: number) => {
  const latestSession = db
    .select({ session_key: driver_championships.session_key })
    .from(driver_championships)
    .innerJoin(sessions, sql`${driver_championships.session_key} = ${sessions.session_key}`)
    .where(sql`
      ${sessions.year} = ${year}
      and ${sessions.date_end}::timestamptz < now()
    `)
    .orderBy(desc(sql`${sessions.date_start}::timestamptz`))
    .limit(1);

  return db
    .select()
    .from(driver_championships)
    .where(sql`
      ${driver_championships.session_key} = (${latestSession})
    `)
    .orderBy(asc(driver_championships.position_current));
});