import { getCurrentStandings } from "@/services/standings";
import { getNextRace, getRaceProgressInfo, getRecentRaceResults, getUpcomingRaces } from "@/services/sessions-data";
import { StandingsCard } from "@/components/standings-card";
import { SeasonOverviewCard } from "@/components/season-overview-card";
import NextRaceBanner from "@/components/ui/next-race-banner";

export default async function Home() {
  const [{ drivers, constructors }, raceProgress, recentResults, upcomingRaces, nextRace] = await Promise.all([
    getCurrentStandings(),
    getRaceProgressInfo(),
    getRecentRaceResults(new Date().getFullYear(), 3),
    getUpcomingRaces(new Date().getFullYear(), 3),
    getNextRace(),
  ]);
  
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 min-[1181px]:grid-cols-3 min-[1181px]:p-8">
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6 min-[1181px]:col-span-2">
        <NextRaceBanner nextRace={nextRace} />
        <StandingsCard
          driverStandings={drivers}
          constructorStandings={constructors}
          className="min-w-0"
        />
      </div>
      <SeasonOverviewCard
        raceProgress={raceProgress}
        recentResults={recentResults}
        upcomingRaces={upcomingRaces}
        className="self-start h-fit"
      />
    </div>
  );
}
