import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { seedChampionships, seedChampionshipsFullHistory } from "./seeds/championships";
import { seedDrivers, seedDriversFullHistory } from "./seeds/drivers";
import { seedSessionResults, seedSessionResultsFullHistory } from "./seeds/session-results";
import { seedSessions, seedSessionsFullHistory } from "./seeds/sessions";
import { seedMeetings, seedMeetingsFullHistory } from "./seeds/meetings";

function parseArgs() {
	const arg = process.argv[2];
	const current = new Date().getFullYear();

	if (!arg) return { years: [current], mode: "maintenance" as const };
	if (arg === "recent") return { years: [current - 1, current], mode: "maintenance" as const };
	if (arg === "full") return { years: [current], mode: "full" as const };
	if (arg === "results:full") return { years: [current], mode: "resultsFull" as const };

	const parsed = Number(arg);
	if (!Number.isInteger(parsed)) {
		throw new Error(`Invalid year argument: ${arg}`);
	}

	return { years: [parsed], mode: "maintenance" as const };
}

async function runSeed() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not set");
	}

	const { years, mode } = parseArgs();

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
			await seedSessionsFullHistory({ db, log });
			await seedDriversFullHistory({ db, log });
			await seedSessionResultsFullHistory({ db, log });
			await seedChampionshipsFullHistory(db, log);
			await seedMeetingsFullHistory({ db, log });
			log("finished full-history seed");
			return;
		}

		for (const year of years) {
			log(`starting year ${year}`);
			await seedSessions({ db, year, log });
			await seedDrivers({ db, year, log });
			await seedSessionResults({ db, year, log });
			await seedMeetings({ db, year, log });
			log(`finished year ${year}`);
		}

		await seedChampionships(db, log);
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

