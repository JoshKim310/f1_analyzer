import { openF1Fetch } from "@/lib/openf1";

export type NextRaceInfo = {
    meeting_name: string;
    countryName: string;
    countryFlag: string;
    dateStart: string;
}

export async function getNextRaceInfo(): Promise<NextRaceInfo | null> {
  const meetings = await openF1Fetch(`/meetings?year=${new Date().getFullYear()}`);
  const nextMeeting = meetings.find((m: any) => new Date(m.date_start) > new Date());

  if (!nextMeeting) {
    return null;
  }

  return {
    meeting_name: nextMeeting.meeting_name,
    countryName: nextMeeting.country_name,
    countryFlag: nextMeeting.country_flag,
    dateStart: nextMeeting.date_start,
  };
}