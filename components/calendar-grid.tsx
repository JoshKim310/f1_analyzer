"use client"
import { Card, CardContent } from "@/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import { RecentRaceResult, TestingRaceInfo, UpcomingRaceInfo } from "@/services/sessions-data";
import { formatRaceDateRange } from "@/lib/date-utils";
import { ChevronDown } from "lucide-react";
import React from "react";
import NextRaceBanner from "./ui/next-race-banner";

type CalendarCard = {
  round: number;
  grandPrixName: string;
  countryName: string;
  countryFlag: string;
  dateStart: string;
  dateRange: string;
  status: "Completed" | "Upcoming" | "Testing";
  podium?: Array<{
    position: number;
    driverAcronym: string;
    time: string;
    teamColor: string;
  }>;
  circuitImage?: string;
  circuitShortName: string;
};

function getOrdinal(position: number) {
  if (position === 1) return "1ST";
  if (position === 2) return "2ND";
  if (position === 3) return "3RD";
  return `${position}TH`;
}

function buildCalendarCards(
  recentResults: RecentRaceResult[],
  upcomingRaces: UpcomingRaceInfo[],
  testingRaces: TestingRaceInfo[]
): CalendarCard[] {
  const recentByRound = new Map(recentResults.map((race) => [race.round, race]));
  const upcomingByRound = new Map(upcomingRaces.map((race) => [race.round, race]));

  const rounds = Array.from(
    new Set([...recentResults.map((race) => race.round), ...upcomingRaces.map((race) => race.round)])
  ).sort((a, b) => a - b);

  const raceCards = rounds.flatMap((round) => {
    const recent = recentByRound.get(round);
    if (recent) {
      return {
        round,
        grandPrixName: recent.grandPrixName,
        countryName: recent.countryName,
        countryFlag: recent.countryFlag,
        dateStart: recent.dateStart,
        dateRange: formatRaceDateRange(recent.dateStart, recent.dateEnd),
        status: "Completed" as const,
        podium: recent.podium,
        circuitShortName: recent.circuitShortName,
      };
    }

    const upcoming = upcomingByRound.get(round);
    if (upcoming) {
      return {
        round,
        grandPrixName: upcoming.grandPrixName,
        countryName: upcoming.countryName,
        countryFlag: upcoming.countryFlag,
        dateStart: upcoming.dateStart,
        dateRange: formatRaceDateRange(upcoming.dateStart, upcoming.dateEnd),
        status: "Upcoming" as const,
        circuitImage: upcoming.circuitImage,
        circuitShortName: upcoming.circuitShortName,
      };
    }

    return [];
  });

  const testingCards = testingRaces.map((race) => ({
    round: 0,
    grandPrixName: race.grandPrixName,
    countryName: race.countryName,
    countryFlag: race.countryFlag,
    dateStart: race.dateStart,
    dateRange: formatRaceDateRange(race.dateStart, race.dateEnd),
    status: "Testing" as const,
    circuitImage: race.circuitImage,
    circuitShortName: race.circuitShortName,
  }));

  return [...raceCards, ...testingCards].sort(
    (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
  );
}

export function CalendarGrid({
    recentResults,
    upcomingRaces,
    testingRaces,
} : {
    recentResults: RecentRaceResult[];
    upcomingRaces: UpcomingRaceInfo[];
    testingRaces: TestingRaceInfo[];
}) {
  const years = Array.from({ length: new Date().getFullYear() - 2023 + 1 }, (_, i) => 2023 + i).reverse();
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const filteredRecentResults = recentResults.filter((race) => race.year === selectedYear);
  const filteredUpcomingRaces = upcomingRaces.filter((race) => race.year === selectedYear);
  const filteredTestingRaces = testingRaces.filter((race) => race.year === selectedYear);
  const grandPrixCards = buildCalendarCards(
    filteredRecentResults,
    filteredUpcomingRaces,
    filteredTestingRaces
  );
  const nextRace = filteredUpcomingRaces.filter((race) => race.dateEnd > new Date().toISOString())[0];

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-20">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl tracking-wide">{selectedYear} Race Calendar</h1>
        <p className="font-pixel text-xs uppercase tracking-wide text-white/60 py-4">
          {filteredRecentResults.length + "/" + (grandPrixCards.length - filteredTestingRaces.length)} races
        </p>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" className="h-8 gap-1.5 px-2.5 text-sm">
              {selectedYear}
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-0">
            {years.map((year) => (
              <DropdownMenuItem key={year} onSelect={() => setSelectedYear(year)}>
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <NextRaceBanner nextRace={nextRace} />
      <section className="grid gap-6 min-[700px]:grid-cols-2 min-[1293px]:grid-cols-3">
        {grandPrixCards.map((race) => {
          return (
            <Card 
              key={`${race.status}-${race.round}-${race.dateStart}`}
              className={nextRace && formatRaceDateRange(nextRace.dateStart, nextRace.dateEnd) === race.dateRange
              ? "h-full min-h-[240px] ring-f1-red" : "h-full min-h-[240px]"}
            >
              <CardContent className="flex h-full flex-col gap-6 px-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-muted-foreground">
                    {race.status === "Testing" ? "TESTING" : `ROUND ${race.round}`}
                  </p>
                  <p className="text-sm font-pixel">{race.dateRange}</p>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={race.countryFlag}
                    alt={race.countryName}
                    className="h-6 w-8 rounded-sm object-cover"
                  />
                  <p className="text-2xl leading-none font-heading">{race.countryName}</p>
                </div>

                <p className="pb-2 text-sm text-muted-foreground">{race.grandPrixName}</p>

                {race.status === "Completed" ? (
                  <div className="mt-auto flex items-end justify-between">
                    <div className="ml-auto grid w-full max-w-[280px] grid-cols-3 gap-2">
                      {(race.podium ?? []).map((placement) => (
                        <div
                          key={`${race.round}-${placement.position}`}
                          className="min-h-[40px] rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] leading-tight"
                        >
                          <p className="truncate">
                            <span className="text-xs">{getOrdinal(placement.position)}</span>
                            <span className="font-title" style={{ color: placement.teamColor }}>
                              {" " + placement.driverAcronym}
                            </span>
                          </p>
                          <p className="truncate text-muted-foreground">{placement.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto flex items-end justify-end">
                    <img
                      src={race.circuitImage}
                      alt={`${race.grandPrixName} circuit`}
                      className="ml-auto h-16 w-24 shrink-0 rounded-md object-contain invert"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}