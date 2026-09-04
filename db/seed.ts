import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { seedChampionships, seedChampionshipsFullHistory } from "./seeds/championships";
import { seedDrivers, seedDriversFullHistory } from "./seeds/drivers";
import { seedSessionResults, seedSessionResultsFullHistory } from "./seeds/session-results";
import { seedSessions, seedSessionsFullHistory } from "./seeds/sessions";
import { seedMeetings, seedMeetingsFullHistory } from "./seeds/meetings";
import { runMaintenanceSeed } from "./seeds";

function parseArgs() {
	const arg = process.argv[2];
	const current = new Date().getFullYear();

	if (!arg) return { year: current, mode: "maintenance" as const };
	if (arg === "full") return { mode: "full" as const };

	const parsed = Number(arg);
	if (!Number.isInteger(parsed)) {
		throw new Error(`Invalid year argument: ${arg}`);
	}

	return { year: parsed, mode: "maintenance" as const };
}

async function runSeed() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not set");
	}

	const { year, mode } = parseArgs();

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});
	const db = drizzle(pool);

	const log = (message: string) => {
		console.log(`[seed] ${message}`);
	};

	try {
		if (mode === "full") {
			log("starting full-history seed");
			await seedMeetingsFullHistory({ db, log });
			await seedSessionsFullHistory({ db, log });
			await seedSessionResultsFullHistory({ db, log });
			await seedDriversFullHistory({ db, log });
			await seedChampionshipsFullHistory(db, log);
			log("finished full-history seed");
			return;
		}

		log("starting maintenance seed");
		await runMaintenanceSeed(db, year, log);
		log("finished maintenance seed");
	} finally {
		await pool.end();
	}
}

runSeed()
	.then(() => {
		console.log("Done");
	})
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exit(1);
	});

