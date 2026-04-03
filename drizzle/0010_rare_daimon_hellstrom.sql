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
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_driver_number_session_key_pk" PRIMARY KEY("driver_number","session_key");