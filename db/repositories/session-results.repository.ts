import { cache } from "react";
import { db } from "@/db";
import { session_results } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const getSessionResults = cache(async (sessionKey: number) => {
  return db
    .select()
    .from(session_results)
    .where(eq(session_results.session_key, sessionKey))
});

export const getRaceWinnerBySessionKey = cache(async (sessionKey: number) => {
  return db
    .select({
      driverNumber: session_results.driver_number,
    })
    .from(session_results)
    .where(
      sql` ${session_results.session_key} = ${sessionKey} and ${session_results.position} = 1`
    );
});