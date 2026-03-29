import { drizzle } from "drizzle-orm/node-postgres";

export type DbClient = ReturnType<typeof drizzle>;

export type SeedContext = {
  db: DbClient;
  year: number;
  log: (message: string) => void;
};
