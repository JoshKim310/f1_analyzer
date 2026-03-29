import {
  pgTable,
  integer,
  varchar,
  primaryKey,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

export const drivers = pgTable(
  "drivers",
  {
    driver_number: integer("driver_number").primaryKey(),
    first_name: varchar("first_name", { length: 50 }),
    last_name: varchar("last_name", { length: 50 }),
    team_name: varchar("team_name", { length: 100 }),
    team_colour: varchar("team_colour", { length: 10 }),
    headshot_url: varchar("headshot_url", { length: 255 }),
    name_acronym: varchar("name_acronym", { length: 3 }),
    meeting_key: integer("meeting_key"),
    session_key: integer("session_key"),
});

export const sessions = pgTable(
  "sessions",
  {
    session_key: integer("session_key").primaryKey(),
    circuit_key: integer("circuit_key"),
    circuit_short_name: varchar("circuit_short_name", { length: 20 }),
    country_code: varchar("country_code", { length: 3 }),
    country_name: varchar("country_name", { length: 50 }),
    date_start: varchar("date_start", { length: 50 }),
    date_end: varchar("date_end", { length: 50 }),
    gmt_offset: varchar("gmt_offset", { length: 10 }),
    location: varchar("location", { length: 50 }),
    meeting_key: integer("meeting_key"),
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
    driver_number: integer("driver_number"),
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
    driver_number: integer("driver_number"),
    meeting_key: integer("meeting_key"),
    points_current: integer("points_current"),
    points_start: integer("points_start"),
    position_current: integer("position_current"),
    position_start: integer("position_start"),
    session_key: integer("session_key"),
  },
  (table) => ({
    primary_key: primaryKey({ columns: [table.session_key, table.driver_number]}),
  })
);

export const constructor_championships = pgTable(
  "constructor_championships",
  {
    meeting_key: integer("meeting_key"),
    points_current: integer("points_current"),
    points_start: integer("points_start"),
    position_current: integer("position_current"),
    position_start: integer("position_start"),
    session_key: integer("session_key"),
    team_name: varchar("team_name", { length: 50 }),
  },
  (table) => ({
    primary_key: primaryKey({ columns: [table.session_key, table.team_name]}),
  })
);