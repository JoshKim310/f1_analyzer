CREATE TABLE "constructor_championships" (
	"meeting_key" integer,
	"points_current" integer,
	"points_start" integer,
	"position_current" integer,
	"position_start" integer,
	"session_key" integer,
	"team_name" varchar(50),
	CONSTRAINT "constructor_championships_session_key_team_name_pk" PRIMARY KEY("session_key","team_name")
);
--> statement-breakpoint
CREATE TABLE "driver_championships" (
	"driver_number" integer,
	"meeting_key" integer,
	"points_current" integer,
	"points_start" integer,
	"position_current" integer,
	"position_start" integer,
	"session_key" integer,
	CONSTRAINT "driver_championships_session_key_driver_number_pk" PRIMARY KEY("session_key","driver_number")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"driver_number" integer PRIMARY KEY NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"team_name" varchar(100),
	"team_colour" varchar(10),
	"headshot_url" varchar(255),
	"name_acronym" varchar(3),
	"meeting_key" varchar(50),
	"session_key" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "session_results" (
	"dnf" boolean DEFAULT false,
	"dns" boolean DEFAULT false,
	"dsq" boolean DEFAULT false,
	"driver_number" integer,
	"duration" numeric(10, 3),
	"gap_to_leader" integer,
	"number_of_laps" integer,
	"meeting_key" integer,
	"position" integer,
	"session_key" integer,
	CONSTRAINT "session_results_session_key_driver_number_pk" PRIMARY KEY("session_key","driver_number")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_key" varchar(50) PRIMARY KEY NOT NULL,
	"circuit_key" integer,
	"circuit_short_name" varchar(20),
	"country_code" varchar(3),
	"country_name" varchar(50),
	"date_start" varchar(50),
	"date_end" varchar(50),
	"gmt_offset" varchar(10),
	"location" varchar(50),
	"meeting_key" integer,
	"session_name" varchar(30),
	"session_type" varchar(30),
	"year" integer
);
