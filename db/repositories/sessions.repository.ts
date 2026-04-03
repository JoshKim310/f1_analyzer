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
    return db
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
    )
});