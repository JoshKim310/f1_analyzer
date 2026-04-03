CREATE TABLE "meetings" (
	"meeting_key" integer PRIMARY KEY NOT NULL,
	"circuit_key" integer,
	"circuit_image" varchar(255),
	"circuit_info_url" varchar(255),
	"circuit_short_name" varchar(50),
	"circuit_type" varchar(50),
	"country_code" varchar(3),
	"country_flag" varchar(255),
	"country_name" varchar(50),
	"date_end" varchar(50),
	"date_start" varchar(50),
	"gmt_offset" varchar(10),
	"location" varchar(50),
	"meeting_name" varchar(100),
	"meeting_official_name" varchar(255),
	"year" integer
);
