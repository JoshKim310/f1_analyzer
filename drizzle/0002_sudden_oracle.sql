ALTER TABLE "session_results" ALTER COLUMN "gap_to_leader" SET DATA TYPE numeric(10, 3) USING "gap_to_leader"::numeric(10, 3);
