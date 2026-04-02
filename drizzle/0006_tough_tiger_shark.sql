ALTER TABLE "constructor_championships" ALTER COLUMN "meeting_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "constructor_championships" ALTER COLUMN "session_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_championships" ALTER COLUMN "driver_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_championships" ALTER COLUMN "meeting_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_championships" ALTER COLUMN "position_current" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_championships" ALTER COLUMN "session_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "meeting_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "session_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session_results" ALTER COLUMN "driver_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "meeting_key" SET NOT NULL;--> statement-breakpoint
CREATE VIEW "public"."drivers_latest" AS (select "drivers"."session_key", "drivers"."driver_number", "drivers"."first_name", "drivers"."last_name", "drivers"."headshot_url", "drivers"."team_name", "drivers"."team_colour", "drivers"."name_acronym" from "drivers" inner join (select "session_key" from "sessions" where 
          "sessions"."year" = extract(year from now())::int
          and "sessions"."date_end":: timestamptz < now()
         order by "sessions"."date_start"::timestamptz desc limit 1) "latest_session" on "drivers"."session_key" = "latest_session"."session_key");