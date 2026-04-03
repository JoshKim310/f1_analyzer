import { getCurrentStandings } from "@/services/standings";
import { getRaceProgressInfo, getRecentRaceResults, getUpcomingRaces } from "@/services/sessions-data";
import { StandingsCard } from "@/components/standings-card";
import { SeasonOverviewCard } from "@/components/season-overview-card";

export default async function Home() {
  const [{ drivers, constructors }, raceProgress, recentResults, upcomingRaces] = await Promise.all([
    getCurrentStandings(),
    getRaceProgressInfo(),
    getRecentRaceResults(),
    getUpcomingRaces(),
  ]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-8">
        <StandingsCard driverStandings={drivers} constructorStandings={constructors} className="md:col-span-2 lg:col-span-2" />
        {<SeasonOverviewCard raceProgress={raceProgress} recentResults={recentResults} upcomingRaces={upcomingRaces} />}
    </div>
  );
}
