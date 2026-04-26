import { cache } from "react";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

type Meeting = {
  meeting_key: number;
  circuit_key: number;
  circuit_image: string;
  circuit_info_url: string;
  circuit_short_name: string;
  circuit_type: string;
  country_code: string;
  country_flag: string;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
};

type MeetingRule = {
  matches: (meeting: Meeting) => boolean;
  transform: (meeting: Meeting) => Meeting;
};

const meetingRules: MeetingRule[] = [
  {
    matches: (meeting) => meeting.country_name === "United States",
    transform: (meeting) => ({
      ...meeting,
      country_name: meeting.meeting_name.replace(" Grand Prix", ""),
    }),
  },
  {
    matches: (meeting) => meeting.meeting_name === "Barcelona Grand Prix",
    transform: (meeting) => ({
      ...meeting,
      country_name: meeting.location + "-" + meeting.circuit_short_name,
    }),
  },
  {
    matches: (meeting) => meeting.meeting_name === "British Grand Prix",
    transform: (meeting) => ({
      ...meeting,
      country_name: "Great Britain",
    }),
  },
  {
    matches: (meeting) => meeting.meeting_name === "Abu Dhabi Grand Prix",
    transform: (meeting) => ({
      ...meeting,
      country_name: "Abu Dhabi",
    }),
  },
];

function applyMeetingRules(meeting: Meeting): Meeting {
  return meetingRules.reduce((currentMeeting, rule) => {
    return rule.matches(currentMeeting) ? rule.transform(currentMeeting) : currentMeeting;
  }, meeting);
}

export const getMeetingsByYear = cache(async (year: number): Promise<Meeting[]> => {
  const meetingsByYear = await db
    .select()
    .from(meetings)
    .where(eq(meetings.year, year));

  return meetingsByYear.map(applyMeetingRules);
});