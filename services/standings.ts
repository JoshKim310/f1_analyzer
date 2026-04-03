import { getConstructorStandingsLatest } from "@/db/repositories/constructor-standings-latest.repository";
import { getDriversLatest } from "@/db/repositories/driver-latest.repository";
import { getDriverStandingsLatest } from "@/db/repositories/drivers-standings-latest.repository";
import { getRaceWinnerBySessionKey } from "@/db/repositories/session-results.repository";
import { getCompletedRacesCurrentYear } from "@/db/repositories/sessions.repository";

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
  const driverChampionshipData = await getDriverStandingsLatest();
  const constructorChampionshipData = await getConstructorStandingsLatest();
  const driverData = await getDriversLatest();
  const completedRaces = await getCompletedRacesCurrentYear();

  // Gets the session winner for each completed race
  const sessionResults = await Promise.all(
    completedRaces.map(async (race) => {
      const result = await getRaceWinnerBySessionKey(race.session_key);
      return result[0]?.driverNumber;
    })
  );

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