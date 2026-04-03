DO $$
DECLARE
    drivers_pk_name text;
BEGIN
    SELECT tc.constraint_name
    INTO drivers_pk_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
        AND tc.table_name = 'drivers'
        AND tc.constraint_type = 'PRIMARY KEY'
    LIMIT 1;

    IF drivers_pk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE "drivers" DROP CONSTRAINT %I', drivers_pk_name);
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "circuit_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "circuit_image" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "circuit_info_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "circuit_short_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "circuit_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "country_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "country_flag" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "country_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "date_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "date_start" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "gmt_offset" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "meeting_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "meeting_official_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "year" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_driver_number_meeting_key_pk" PRIMARY KEY("driver_number","meeting_key");