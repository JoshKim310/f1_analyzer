import { openF1Fetch } from "@/lib/openf1";
import { cache } from "react";

type Meeting = {
  meeting_key: number;
  meeting_name: string;
  country_name: string;
  country_flag: string;
  date_start: string;
  date_end: string;
  meeting_official_name: string;
  gmt_offset: string;
  circuit_image: string;
};

type Session = {
  session_key: number;
  session_name: string;
};

type SessionResult = {
  position: number;
  driver_number: number;
  duration?: number;
  gap_to_leader?: number;
};

type Driver = {
  driver_number: number;
  name_acronym: string;
  team_colour?: string;
};

export type NextRaceInfo = {
  meeting_name: string;
  countryName: string;
  countryFlag: string;
  dateStart: string;
  gmtOffset: string;
}

export type RaceProgressInfo = {
  year: number;
  totalRaces: number;
  completedRaces: number;
  remainingRaces: number;
};

export type RecentRaceResult = {
  countryName: string;
  countryFlag: string;
  round: number;
  dateStart: string;
  dateEnd: string;
  grandPrixName: string;
  podium: {
    position: number;
    driverAcronym: string;
    time: string;
    teamColor: string;
  }[];
};

export type UpcomingRaceInfo = {
  countryName: string;
  countryFlag: string;
  round: number;
  dateStart: string;
  dateEnd: string;
  grandPrixName: string;
  circuitImage: string;
};

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${hrs}:${String(mins).padStart(2, "0")}:${secs}`;
}

function normalizeTeamColor(teamColor?: string) {
  if (!teamColor) return "";
  return teamColor.startsWith("#") ? teamColor : `#${teamColor}`;
}

const getMeetingsByYear = cache(async (year: number): Promise<Meeting[]> => {
  const meetings = (await openF1Fetch(`/meetings?year=${year}`)) as Meeting[];
  
  return meetings.map((meeting) => 
    meeting.country_name === "United States"
      ? { ...meeting, country_name: meeting.meeting_name.replace(" Grand Prix", "") }
      : meeting
  );
});

const getRaceByMeetingKey = cache(async (meetingKey: number) => {
  return openF1Fetch(`/sessions?meeting_key=${meetingKey}&session_name=Race`) as Promise<Session[]>;
});

function getChampionshipRaces(meetings: Meeting[]) {
  return meetings
    .filter((m) => m.meeting_name !== "Pre-Season Testing")
    .filter((m) => m.meeting_name !== "Saudi Arabian Grand Prix")
    .filter((m) => m.meeting_name !== "Bahrain Grand Prix");
}

export async function getNextRaceInfo(): Promise<NextRaceInfo | null> {
  const year = new Date().getFullYear();
  const meetings = await getMeetingsByYear(year);
  const now = new Date();
  const nextMeeting = meetings.find((m) => new Date(m.date_start) > now);

  if (!nextMeeting) {
    return null;
  }

  return {
    meeting_name: nextMeeting.meeting_name,
    countryName: nextMeeting.country_name,
    countryFlag: nextMeeting.country_flag,
    dateStart: nextMeeting.date_start,
    gmtOffset: nextMeeting.gmt_offset,
  };
}

export async function getRaceProgressInfo(year = new Date().getFullYear()): Promise<RaceProgressInfo> {
  const meetings = await getMeetingsByYear(year);
  const now = new Date();

  const races = getChampionshipRaces(meetings);

    const completedRaces = races
    .filter((m) => new Date(m.date_start) < now).length;

  const totalRaces = races.length;

  return {
    year,
    totalRaces,
    completedRaces,
    remainingRaces: Math.max(totalRaces - completedRaces, 0),
  };
}

export async function getRecentRaceResults(
  year = new Date().getFullYear(),
  limit = 3
): Promise<RecentRaceResult[]> {
  const meetings = await getMeetingsByYear(year);
  const now = new Date();

  const racesAscending = getChampionshipRaces(meetings).sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );

  const completedWithRounds = racesAscending
    .map((race, index) => ({ race, round: index + 1 }))
    .filter(({ race }) => new Date(race.date_start) < now);

  const recent = completedWithRounds
    .sort(
      (a, b) =>
        new Date(b.race.date_start).getTime() - new Date(a.race.date_start).getTime()
    )
    .slice(0, limit);

  return Promise.all(
    recent.map(async ({ race, round }) => {
      const raceSessions = await getRaceByMeetingKey(race.meeting_key);
      const raceSession = raceSessions[0];

      let podium: RecentRaceResult["podium"] = [];

      if (raceSession?.session_key) {
        const [results, drivers] = await Promise.all([
          openF1Fetch(`/session_result?session_key=${raceSession.session_key}`) as Promise<SessionResult[]>,
          openF1Fetch(`/drivers?session_key=${raceSession.session_key}`) as Promise<Driver[]>,
        ]);

        const acronymByDriver = new Map(
          drivers.map((d) => [d.driver_number, d.name_acronym])
        );
        const teamColorByDriver = new Map(
          drivers.map((d) => [d.driver_number, normalizeTeamColor(d.team_colour)])
        );

        podium = results
          .filter((r) => r.position >= 1 && r.position <= 3)
          .sort((a, b) => a.position - b.position)
          .map((r) => ({
            position: r.position,
            driverAcronym: acronymByDriver.get(r.driver_number) ?? String(r.driver_number),
            teamColor: teamColorByDriver.get(r.driver_number) ?? "",
            time:
              r.position === 1 && typeof r.duration === "number"
                ? formatDuration(r.duration)
                : typeof r.gap_to_leader === "number"
                  ? `+${r.gap_to_leader.toFixed(3)}s`
                  : typeof r.duration === "number"
                    ? formatDuration(r.duration)
                    : "-",
          }));
      }

      return {
      countryName: race.country_name,
      countryFlag: race.country_flag,
      round,
      dateStart: race.date_start,
      dateEnd: race.date_end ?? race.date_start,
      grandPrixName: race.meeting_official_name,
      podium,
      };
    })
  );
}

export async function getUpcomingRaces(
  year = new Date().getFullYear(),
  limit = 3
): Promise<UpcomingRaceInfo[]> {
  const meetings = await getMeetingsByYear(year);
  const now = new Date();
  const racesAscending = getChampionshipRaces(meetings).sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );

  const upcoming = racesAscending
    .map((race, index) => ({ race, round: index + 1 }))
    .filter(({ race }) => new Date(race.date_start) > now)
    .slice(0, limit);
  
  return (
    upcoming.map( ({ race, round }) => {
      return {
        countryName: race.country_name,
        countryFlag: race.country_flag,
        round,
        dateStart: race.date_start,
        dateEnd: race.date_end,
        grandPrixName: race.meeting_official_name,
        circuitImage: race.circuit_image,
      }
    })
  );
}