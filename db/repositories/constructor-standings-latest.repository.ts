import { cache } from "react"
import { db } from "@/db"
import { constructor_standings_latest } from "@/db/schema"
import { asc } from "drizzle-orm"

export const getConstructorStandingsLatest = cache(async () => {
  return db
    .select({
      team_name: constructor_standings_latest.team_name,
      position_current: constructor_standings_latest.position_current,
      points_current: constructor_standings_latest.points_current,
    })
    .from(constructor_standings_latest)
    .orderBy(asc(constructor_standings_latest.position_current))
});