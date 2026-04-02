import { db } from "@/db";
import { constructor_standings_latest, driver_standings_latest, drivers_latest, session_results, sessions } from "@/db/schema";
import { asc, desc, sql } from "drizzle-orm";

export type DriverStanding = {
  driverNumber: number;
  position: number;
  points: number;
  wins: number;
  fullName: string;
  teamName: string;
  teamColor: string;
  nameAcronym: string;
};

export type ConstructorStanding = {
  teamName: string;
  position: number;
  points: number;
  teamColor: string;
};

export type CurrentStandings = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
};

export async function getCurrentStandings(): Promise<CurrentStandings> {
  const driverChampionshipData = await db
    .select({
      driver_number: driver_standings_latest.driver_number,
      position_current: driver_standings_latest.position_current,
      points_current: driver_standings_latest.points_current,
    })
    .from(driver_standings_latest)
    .orderBy(asc(driver_standings_latest.position_current));

  const constructorChampionshipData = await db
    .select({
      team_name: constructor_standings_latest.team_name,
      position_current: constructor_standings_latest.position_current,
      points_current: constructor_standings_latest.points_current,
    })
    .from(constructor_standings_latest)
    .orderBy(asc(constructor_standings_latest.position_current));

  const driverData = await db
    .select({
      driver_number: drivers_latest.driver_number,
      first_name: drivers_latest.first_name,
      last_name: drivers_latest.last_name,
      team_name: drivers_latest.team_name,
      team_colour: drivers_latest.team_colour,
      name_acronym: drivers_latest.name_acronym,
    })
    .from(drivers_latest);

  const completedRaces = await db
    .select({
      session_key: sessions.session_key,
    })
    .from(sessions)
    .where(
      sql`
        ${sessions.year} = extract(year from now())::int
        and ${sessions.session_name} = 'Race'
        and ${sessions.date_end}:: timestamptz < now()
      `
    );

  // Gets the session winner for each completed race
  const sessionResults = await Promise.all(
    completedRaces.map(async (race) => {
      const result = await db
        .select({
          driverNumber: session_results.driver_number,
        })
        .from(session_results)
        .where(
          sql` ${session_results.session_key} = ${race.session_key} and ${session_results.position} = 1`
        );
      return result[0]?.driverNumber;
    })
  );
  console.log(completedRaces);
  // Count wins for each driver
  const winsByDriver = new Map<number, number>();

  for (const r of sessionResults) {
    if (r == null) {
      continue;
    }
    winsByDriver.set(
        r,
        (winsByDriver.get(r) ?? 0) + 1
    )
  }

  // create lookups
  const driverMap = new Map(
    driverData.map((d) => [d.driver_number, d])
  );
  const teamColorMap = new Map(
    driverData.map((d) => [d.team_name, d.team_colour])
  );
  
  const drivers: CurrentStandings["drivers"] = driverChampionshipData
    .map((d) => {
      const driver = driverMap.get(d.driver_number);

      return {
        driverNumber: d.driver_number,
        position: d.position_current ?? 0,
        points: d.points_current ?? 0,
        wins: winsByDriver.get(d.driver_number) ?? 0,
        fullName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
        teamName: driver?.team_name ?? "Unknown",
        teamColor: driver?.team_colour ?? "",
        nameAcronym: driver?.name_acronym ?? "Unknown",
      };
    });

  const constructors: CurrentStandings["constructors"] = constructorChampionshipData
    .map((d) => {
      return {
      teamName: d.team_name ?? "",
      position: d.position_current ?? 0,
      points: d.points_current ?? 0,
      teamColor: teamColorMap.get(d.team_name) ?? "",
      };      
    });

  return { drivers, constructors };
}