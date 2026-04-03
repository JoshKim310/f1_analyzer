import { cache } from "react";
import { db } from "@/db";
import { driver_standings_latest } from "@/db/schema";
import { asc } from "drizzle-orm";

export const getDriverStandingsLatest = cache(async () => {
  return db
    .select({
      driver_number: driver_standings_latest.driver_number,
      position_current: driver_standings_latest.position_current,
      points_current: driver_standings_latest.points_current,
    })
    .from(driver_standings_latest)
    .orderBy(asc(driver_standings_latest.position_current))
});