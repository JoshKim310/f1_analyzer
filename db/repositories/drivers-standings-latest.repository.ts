import { cache } from "react";
import { db } from "@/db";
import { driver_standings_latest } from "@/db/schema";
import { asc } from "drizzle-orm";

export const getDriverStandingsLatest = cache(async () => {
  return db
    .select()
    .from(driver_standings_latest)
    .orderBy(asc(driver_standings_latest.position_current))
});