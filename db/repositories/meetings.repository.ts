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

export const getMeetingsByYear = cache(async (year: number): Promise<Meeting[]> => {
  const meetingsByYear = await db
    .select()
    .from(meetings)
    .where(eq(meetings.year, year))

  return meetingsByYear.map((meeting) => 
    meeting.country_name === "United States"
      ? { ...meeting, country_name: meeting.meeting_name.replace(" Grand Prix", "") }
      : meeting
  );
});