import { getCurrentStandings } from "@/services/standings";
import { getRaceProgressInfo, getRecentRaceResults, getUpcomingRaces } from "@/services/sessions-data";
import { StandingsCard } from "@/components/standings-card";
import { SeasonOverviewCard } from "@/components/season-overview-card";

export default async function Home() {
  const [{ drivers, constructors }, raceProgress, recentResults, upcomingRaces] = await Promise.all([
    getCurrentStandings(),
    getRaceProgressInfo(),
    getRecentRaceResults(new Date().getFullYear(), 3),
    getUpcomingRaces(new Date().getFullYear(), 3),
  ]);
  
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 min-[1181px]:grid-cols-3 min-[1181px]:p-8">
      <StandingsCard driverStandings={drivers} constructorStandings={constructors} className="min-w-0 min-[1181px]:col-span-2" />
        {<SeasonOverviewCard raceProgress={raceProgress} recentResults={recentResults} upcomingRaces={upcomingRaces} className="self-start h-fit" />}
    </div>
  );
}
