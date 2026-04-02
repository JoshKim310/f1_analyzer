DROP VIEW "public"."constructor_standings_latest";--> statement-breakpoint
DROP VIEW "public"."driver_standings_latest";--> statement-breakpoint
CREATE VIEW "public"."constructor_standings_latest" AS (select "constructor_championships"."session_key", "constructor_championships"."team_name", "constructor_championships"."points_current", "constructor_championships"."points_start", "constructor_championships"."position_current", "constructor_championships"."position_start" from "constructor_championships" inner join (select "session_key" from "sessions" where 
          "sessions"."year" = extract(year from now())::int
          and "sessions"."date_end":: timestamptz < now()
         order by "sessions"."date_start"::timestamptz desc limit 1) "latest_session" on "constructor_championships"."session_key" = "latest_session"."session_key");--> statement-breakpoint
CREATE VIEW "public"."driver_standings_latest" AS (select "driver_championships"."session_key", "driver_championships"."driver_number", "driver_championships"."points_current", "driver_championships"."points_start", "driver_championships"."position_current", "driver_championships"."position_start" from "driver_championships" inner join (select "session_key" from "sessions" where 
          "sessions"."year" = extract(year from now())::int
          and "sessions"."date_end":: timestamptz < now()
         order by "sessions"."date_start"::timestamptz desc limit 1) "latest_session" on "driver_championships"."session_key" = "latest_session"."session_key");