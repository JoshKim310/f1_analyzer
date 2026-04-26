import { CalendarGrid } from "@/components/calendar-grid";
import { getRecentRaceResults, getUpcomingRaces } from "@/services/sessions-data";

export default async function RaceCalendarPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, index) => 2023 + index);

  const [recentResultsByYear, upcomingRacesByYear] = await Promise.all([
    Promise.all(years.map((year) => getRecentRaceResults(year))),
    Promise.all(years.map((year) => getUpcomingRaces(year))),
  ]);

  const recentResults = recentResultsByYear.flat();
  const upcomingRaces = upcomingRacesByYear.flat();

  return (
    <div>
      <CalendarGrid recentResults={recentResults} upcomingRaces={upcomingRaces} />
    </div>
  );
}