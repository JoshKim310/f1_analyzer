import { desc, eq, sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  primaryKey,
  numeric,
  boolean,
  pgView,
} from "drizzle-orm/pg-core";

export const drivers = pgTable(
  "drivers",
  {
    driver_number: integer("driver_number").notNull(),
    first_name: varchar("first_name", { length: 50 }),
    last_name: varchar("last_name", { length: 50 }),
    team_name: varchar("team_name", { length: 100 }),
    team_colour: varchar("team_colour", { length: 10 }),
    headshot_url: varchar("headshot_url", { length: 255 }),
    name_acronym: varchar("name_acronym", { length: 3 }),
    meeting_key: integer("meeting_key").notNull(),
    session_key: integer("session_key").notNull(),
  },
  (table) => ({
    primary_key: primaryKey({ columns: [table.driver_number, table.session_key] }),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    session_key: integer("session_key").primaryKey().notNull(),
    circuit_key: integer("circuit_key"),
    circuit_short_name: varchar("circuit_short_name", { length: 20 }),
    country_code: varchar("country_code", { length: 3 }),
    country_name: varchar("country_name", { length: 50 }),
    date_start: varchar("date_start", { length: 50 }),
    date_end: varchar("date_end", { length: 50 }),
    gmt_offset: varchar("gmt_offset", { length: 10 }),
    location: varchar("location", { length: 50 }),
    meeting_key: integer("meeting_key").notNull(),
    session_name: varchar("session_name", { length: 30 }),
    session_type: varchar("session_type", { length: 30 }),
    year: integer("year"),
})

export const session_results = pgTable(
  "session_results",
  {
    dnf: boolean("dnf").default(false),
    dns: boolean("dns").default(false),
    dsq: boolean("dsq").default(false),
    driver_number: integer("driver_number").notNull(),
    duration: numeric("duration", { precision: 10, scale: 3 }),
    gap_to_leader: numeric("gap_to_leader", { precision: 10, scale: 3 }),
    number_of_laps: integer("number_of_laps"),
    meeting_key: integer("meeting_key"),
    position: integer("position"),
    session_key: integer("session_key"),
  },
  (table) => ({
    primary_key: primaryKey({ columns: [table.session_key, table.driver_number] }),
  })
);

export const driver_championships = pgTable(
  "driver_championships",
  {
    driver_number: integer("driver_number").notNull(),
    meeting_key: integer("meeting_key").notNull(),
    points_current: integer("points_current"),
    points_start: integer("points_start"),
    position_current: integer("position_current").notNull(),
    position_start: integer("position_start"),
    session_key: integer("session_key").notNull(),
  },
  (table) => ({
    primary_key: primaryKey({ columns: [table.session_key, table.driver_number]}),
  })
);

export const constructor_championships = pgTable(
  "constructor_championships",
  {
    meeting_key: integer("meeting_key").notNull(),
    points_current: integer("points_current"),
    points_start: integer("points_start"),
    position_current: integer("position_current"),
    position_start: integer("position_start"),
    session_key: integer("session_key").notNull(),
    team_name: varchar("team_name", { length: 50 }),
  },
  (table) => ({
    primary_key: primaryKey({ columns: [table.session_key, table.team_name]}),
  })
);

export const meetings = pgTable(
  "meetings",
  {
    meeting_key: integer("meeting_key").primaryKey().notNull(),
    circuit_key: integer("circuit_key").notNull(),
    circuit_image: varchar("circuit_image", { length: 255 }).notNull(),
    circuit_info_url: varchar("circuit_info_url", { length: 255 }).notNull(),
    circuit_short_name: varchar("circuit_short_name", { length: 50 }).notNull(),
    circuit_type: varchar("circuit_type", { length: 50 }).notNull(),
    country_code: varchar("country_code", { length: 3 }).notNull(),
    country_flag: varchar("country_flag", { length: 255 }).notNull(),
    country_name: varchar("country_name", { length: 50 }).notNull(),
    date_end: varchar("date_end", { length: 50 }).notNull(),
    date_start: varchar("date_start", { length: 50 }).notNull(),
    gmt_offset: varchar("gmt_offset", { length: 10 }).notNull(),
    location: varchar("location", { length: 50 }).notNull(),
    meeting_name: varchar("meeting_name", { length: 100 }).notNull(),
    meeting_official_name: varchar("meeting_official_name", { length: 255 }).notNull(),
    year: integer("year").notNull(),
  }
)

export const driver_standings_latest = pgView(
  "driver_standings_latest",
).as((qb) => {
  const latestSession = qb
    .select({
      session_key: sessions.session_key,
    })
    .from(sessions)
    .where(
        sql`
          ${sessions.year} = extract(year from now())::int
          and ${sessions.date_end}:: timestamptz < now()
        `
    )
    .orderBy(desc(sql`${sessions.date_start}::timestamptz`))
    .limit(1)
    .as("latest_session");
  
  return qb
    .select({
        session_key: driver_championships.session_key,
        driver_number: driver_championships.driver_number,
        points_current: driver_championships.points_current,
        points_start: driver_championships.points_start,
        position_current: driver_championships.position_current,
        position_start: driver_championships.position_start,
    })
    .from(driver_championships)
    .innerJoin(
      latestSession,
      eq(driver_championships.session_key, latestSession.session_key)
    )
});

export const constructor_standings_latest = pgView(
  "constructor_standings_latest",
).as((qb) => {
  const latestSession = qb
    .select({
      session_key: sessions.session_key,
    })
    .from(sessions)
    .where(
        sql`
          ${sessions.year} = extract(year from now())::int
          and ${sessions.date_end}:: timestamptz < now()
        `
    )
    .orderBy(desc(sql`${sessions.date_start}::timestamptz`))
    .limit(1)
    .as("latest_session");

  return qb
    .select({
        session_key: constructor_championships.session_key,
        team_name: constructor_championships.team_name,
        points_current: constructor_championships.points_current,
        points_start: constructor_championships.points_start,
        position_current: constructor_championships.position_current,
        position_start: constructor_championships.position_start,
    })
    .from(constructor_championships)
    .innerJoin(
        latestSession,
        eq(constructor_championships.session_key, latestSession.session_key)
    )
});

export const drivers_latest = pgView(
  "drivers_latest",
).as((qb) => {
  const latestSession = qb
    .select({
      session_key: sessions.session_key,
    })
    .from(sessions)
    .where(
        sql`
          ${sessions.year} = extract(year from now())::int
          and ${sessions.date_end}:: timestamptz < now()
        `
    )
    .orderBy(desc(sql`${sessions.date_start}::timestamptz`))
    .limit(1)
    .as("latest_session");

  return qb
    .select({
      session_key: drivers.session_key,
      driver_number: drivers.driver_number,
      first_name: drivers.first_name,
      last_name: drivers.last_name,
      headshot_url: drivers.headshot_url,
      team_name: drivers.team_name,
      team_colour: drivers.team_colour,
      name_acronym: drivers.name_acronym,
    })
    .from(drivers)
    .innerJoin(
      latestSession,
      eq(drivers.session_key, latestSession.session_key)
    )
});