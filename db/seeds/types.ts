import { drizzle } from "drizzle-orm/node-postgres";

export type DbClient = ReturnType<typeof drizzle>;

export type SeedContext = {
  db: DbClient;
  log: (message: string) => void;
};

export type YearSeedContext = SeedContext & {
  year: number;
};