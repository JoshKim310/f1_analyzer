import { cache } from "react";
import { db } from "@/db";
import { drivers } from "../schema";
import { eq } from "drizzle-orm";

export const getDriversBySessionKey = cache(async (sessionKey: number) => {
  return db
    .select()
    .from(drivers)
    .where(eq(drivers.session_key, sessionKey))
});
