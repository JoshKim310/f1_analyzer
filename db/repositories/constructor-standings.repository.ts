import { cache } from "react"
import { db } from "@/db"
import { constructor_championships, constructor_standings_latest, sessions } from "@/db/schema"
import { asc, desc, eq, sql } from "drizzle-orm"

export const getConstructorStandingsLatest = cache(async () => {
  return db
    .select()
    .from(constructor_standings_latest)
    .orderBy(asc(constructor_standings_latest.position_current))
});

export const getConstructorStandingsByYear = cache(async (year: number) => {
  const latestSession = db
    .select({ session_key: constructor_championships.session_key })
    .from(constructor_championships)
    .innerJoin(sessions, eq(constructor_championships.session_key, sessions.session_key))
    .where(sql`
      ${sessions.year} = ${year}
      and ${sessions.date_end}::timestamptz < now()
    `)
    .orderBy(desc(sql`${sessions.date_start}::timestamptz`))
    .limit(1);

  return db
    .select()
    .from(constructor_championships)
    .where(sql`${constructor_championships.session_key} = (${latestSession})`)
    .orderBy(asc(constructor_championships.position_current));
});