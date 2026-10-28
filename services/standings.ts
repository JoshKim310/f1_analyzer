import {
  getConstructorStandingsByYear,
  getConstructorStandingsLatest,
} from "@/db/repositories/constructor-standings.repository";
import {
  getDriversBySeason,
  getDriversCurrentSeason,
} from "@/db/repositories/driver-latest.repository";
import { getDriverStandingsByYear, getDriverStandingsLatest } from "@/db/repositories/drivers-standings.repository";
import { getRaceWinnerBySessionKey } from "@/db/repositories/session-results.repository";
import { getCompletedRacesByYear, getCompletedRacesCurrentYear } from "@/db/repositories/sessions.repository";

export type DriverStanding = {
  driverNumber: number;
  positionCurrent: number;
  positionStart: number;
  points: number;
  wins: number;
  fullName: string;
  teamName: string;
  teamColor: string;
  nameAcronym: string;
  headshotUrl: string;
};

export type ConstructorStanding = {
  teamName: string;
  positionCurrent: number;
  positionStart: number;
  points: number;
  teamColor: string;
};

export type CurrentStandings = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
};

export async function getDriverStandings(year: number): Promise<DriverStanding[]> {
  const driverChampionshipData = await getDriverStandingsByYear(year);
  const driverData = await getDriversBySeason(year);
  const completedRaces = await getCompletedRacesByYear(year);

  const sessionResults = await Promise.all(
    completedRaces.map(async (race) => {
      const result = await getRaceWinnerBySessionKey(race.session_key);
      return result[0]?.driverNumber;
    })
  );

  const winsByDriver = new Map<number, number>();
  for (const driverNumber of sessionResults) {
    if (driverNumber == null) continue;
    winsByDriver.set(driverNumber, (winsByDriver.get(driverNumber) ?? 0) + 1);
  }

  const driverMap = new Map<number, (typeof driverData)[0]>();
  for (const driver of driverData) {
    if (!driverMap.has(driver.driver_number)) {
      driverMap.set(driver.driver_number, driver);
    }
  }

  return driverChampionshipData.map((standing) => {
    const driver = driverMap.get(standing.driver_number);
    return {
      driverNumber: standing.driver_number,
      positionCurrent: standing.position_current ?? 0,
      positionStart: standing.position_start ?? 0,
      points: standing.points_current ?? 0,
      wins: winsByDriver.get(standing.driver_number) ?? 0,
      fullName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
      teamName: driver?.team_name ?? "Unknown",
      teamColor: driver?.team_colour ?? "",
      nameAcronym: driver?.name_acronym ?? "Unknown",
      headshotUrl: driver?.headshot_url ?? "",
    };
  });
}

export async function getConstructorStandings(year: number): Promise<ConstructorStanding[]> {
  const [constructorData, drivers] = await Promise.all([
    getConstructorStandingsByYear(year),
    getDriverStandings(year),
  ]);
  const teamColorMap = new Map(drivers.map((driver) => [driver.teamName, driver.teamColor]));

  return constructorData.map((standing) => ({
    teamName: standing.team_name ?? "",
    positionCurrent: standing.position_current ?? 0,
    positionStart: standing.position_start ?? 0,
    points: standing.points_current ?? 0,
    teamColor: teamColorMap.get(standing.team_name ?? "") ?? "",
  }));
}

export async function getCurrentStandings(): Promise<CurrentStandings> {
  const driverChampionshipData = await getDriverStandingsLatest();
  const constructorChampionshipData = await getConstructorStandingsLatest();
  const driverData = await getDriversCurrentSeason();
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
  const driverMap = new Map<number, (typeof driverData)[0]>();

  for (const driver of driverData) {
    if (!driverMap.has(driver.driver_number)) {
      driverMap.set(driver.driver_number, driver);
    }
  }

  const teamColorMap = new Map(
    driverData.map((d) => [d.team_name, d.team_colour])
  );
  
  const drivers: CurrentStandings["drivers"] = driverChampionshipData
    .map((d) => {
      const driver = driverMap.get(d.driver_number);

      return {
        driverNumber: d.driver_number,
        positionCurrent: d.position_current ?? 0,
        positionStart: d.position_start ?? 0,
        points: d.points_current ?? 0,
        wins: winsByDriver.get(d.driver_number) ?? 0,
        fullName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
        teamName: driver?.team_name ?? "Unknown",
        teamColor: driver?.team_colour ?? "",
        nameAcronym: driver?.name_acronym ?? "Unknown",
        headshotUrl: driver?.headshot_url ?? "",
      };
    });

  const constructors: CurrentStandings["constructors"] = constructorChampionshipData
    .map((d) => {
      return {
      teamName: d.team_name ?? "",
      positionCurrent: d.position_current ?? 0,
      positionStart: d.position_start ?? 0,
      points: d.points_current ?? 0,
      teamColor: teamColorMap.get(d.team_name) ?? "",
      };      
    });

  return { drivers, constructors };
}