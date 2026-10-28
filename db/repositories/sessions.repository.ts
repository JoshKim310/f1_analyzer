import { cache } from "react";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { sql } from "drizzle-orm";

export const getRaceByMeetingKey = cache(async (meetingKey: number) => {
  return db
    .select()
    .from(sessions)
    .where(
      sql`
        ${sessions.meeting_key} = ${meetingKey}
        and ${sessions.session_name} = 'Race'
      `
    )
});

export const getCompletedRacesCurrentYear = cache(async () => {
  return getCompletedRacesByYear(new Date().getFullYear());
});

export const getCompletedRacesByYear = cache(async (year: number) => {
    return db
    .select({
      session_key: sessions.session_key,
    })
    .from(sessions)
    .where(
      sql`
        ${sessions.year} = ${year}
        and ${sessions.session_name} = 'Race'
        and ${sessions.date_end}:: timestamptz < now()
      `
    )
});