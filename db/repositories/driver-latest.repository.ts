import { cache } from "react";
import { db } from "@/db";
import { drivers_latest } from "../schema";

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