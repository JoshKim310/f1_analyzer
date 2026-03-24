import { openF1Fetch } from "@/lib/openf1";

type driverChampionshipData = {
  driver_number: number;
  position_current: number;
  points_current: number;
};

type Driver = {
  driver_number: number;
  first_name: string;
  last_name: string;
  team_name: string;
  team_colour: string;
  name_acronym: string;
};

type Team = {
  team_name: string;
  position_current: number;
  points_current: number;
  team_color: string;
};

export async function getCurrentStandings() {
  const [driverChampionshipData, driverData, sessionData, constructorData] = await Promise.all([
    openF1Fetch("/championship_drivers?session_key=latest") as Promise<driverChampionshipData[]>,
    openF1Fetch("/drivers?session_key=latest") as Promise<Driver[]>,
    openF1Fetch(`/sessions?session_name=Race&year=${new Date().getFullYear()}`) as Promise<any>,
    openF1Fetch("/championship_teams?session_key=latest") as Promise<Team[]>,
  ]);

  const completedRaces = sessionData.filter((s: any) => {return new Date(s.date_start) < new Date()});

  // Gets the session winner for each completed race
  const sessionResults = await Promise.all(
    completedRaces.map(async(race: any) => {
      const result = await openF1Fetch(
        `/session_result?session_key=${race.session_key}&position=1`
      );
      return {
        driverNumber: result[0].driver_number,
      };
    })
  );

  // Count wins for each driver
  const winsByDriver = new Map<number, number>();

  for (const r of sessionResults) {
    winsByDriver.set(
        r.driverNumber,
        (winsByDriver.get(r.driverNumber) ?? 0) + 1
    )
  }

  console.log("Wins by Driver:", winsByDriver);

  // create lookups
  const driverMap = new Map(
    driverData.map((d) => [d.driver_number, d])
  );
  const teamColorMap = new Map(
    driverData.map((d) => [d.team_name, d.team_colour])
  );
  
  const drivers = driverChampionshipData
    .sort((a: any, b: any) => a.position_current - b.position_current)
    .map((d: any) => {
      const driver = driverMap.get(d.driver_number);

      return {
        driverNumber: d.driver_number,
        position: d.position_current,
        points: d.points_current,
        wins: winsByDriver.get(d.driver_number),
        fullName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
        teamName: driver ? driver.team_name : "Unknown",
        teamColor: driver ? driver.team_colour : "",
        nameAcronym: driver ? driver.name_acronym : "Unknown",
      };
    });

  const constructors = constructorData
    .sort((a: any, b: any) => a.position_current - b.position_current)
    .map((d: any) => {
      return {
      teamName: d.team_name,
      position: d.position_current,
      points: d.points_current,
      teamColor: teamColorMap.get(d.team_name) ?? "",
      };      
    });

  return { drivers, constructors };
}