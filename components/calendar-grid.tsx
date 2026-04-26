"use client"
import { Card, CardContent } from "@/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import { RecentRaceResult, UpcomingRaceInfo } from "@/services/sessions-data";
import { ChevronDown } from "lucide-react";
import React from "react";

type CalendarCard = {
  round: number;
  grandPrixName: string;
  countryName: string;
  countryFlag: string;
  dateRange: string;
  status: "Completed" | "Upcoming";
  podium?: Array<{
    position: number;
    driverAcronym: string;
    time: string;
    teamColor: string;
  }>;
  circuitImage?: string;
  circuitShortName: string;
};

const banners: Record<string, string> = {
  "Melbourne": "australia.png",
  "Shanghai": "china.png",
  "Suzuka": "japan.png",
  "Miami": "miami.png",
  "Montreal": "canada.png",
  "Monte Carlo": "monaco.png",
  "Barcelona": "barcelona.png",
  "Spielberg": "austria.png",
  "Silverstone": "british.png",
  "Spa-Francorchamps": "belgium.png",
  "Hungaroring": "hungary.png",
  "Zandvoort": "netherlands.png",
  "Monza": "monza.png",
  "Madring" : "madring.png",
  "Baku": "azerbaijan.png",
  "Singapore": "singapore.png",
  "Austin": "austin.png",
  "Mexico City": "mexico.png",
  "Interlagos": "brazil.png",
  "Las Vegas": "vegas.png",
  "Lusail": "qatar.png",
  "Yas Marina": "abudhabi.png",
}

function getOrdinal(position: number) {
  if (position === 1) return "1ST";
  if (position === 2) return "2ND";
  if (position === 3) return "3RD";
  return `${position}TH`;
}

function formatRaceDateRange(dateStart: string, dateEnd?: string) {
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : new Date(dateStart);

  if (Number.isNaN(start.getTime())) return "TBA";
  if (Number.isNaN(end.getTime())) {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(start);
  }

  const startDay = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(start);
  const endDay = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(end);
  const startMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(start);
  const endMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(end);

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

function buildCalendarCards(
  recentResults: RecentRaceResult[],
  upcomingRaces: UpcomingRaceInfo[]
): CalendarCard[] {
  const recentByRound = new Map(recentResults.map((race) => [race.round, race]));
  const upcomingByRound = new Map(upcomingRaces.map((race) => [race.round, race]));

  const rounds = Array.from(
    new Set([...recentResults.map((race) => race.round), ...upcomingRaces.map((race) => race.round)])
  ).sort((a, b) => a - b);

  return rounds.flatMap((round) => {
    const recent = recentByRound.get(round);
    if (recent) {
      return {
        round,
        grandPrixName: recent.grandPrixName,
        countryName: recent.countryName,
        countryFlag: recent.countryFlag,
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
        dateRange: formatRaceDateRange(upcoming.dateStart, upcoming.dateEnd),
        status: "Upcoming" as const,
        circuitImage: upcoming.circuitImage,
        circuitShortName: upcoming.circuitShortName,
      };
    }

    return [];
  });
}

export function CalendarGrid({
    recentResults,
    upcomingRaces,
} : {
    recentResults: RecentRaceResult[];
    upcomingRaces: UpcomingRaceInfo[];
}) {
  const years = Array.from({ length: new Date().getFullYear() - 2023 + 1 }, (_, i) => 2023 + i).reverse();
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const filteredRecentResults = recentResults.filter((race) => race.year === selectedYear);
  const filteredUpcomingRaces = upcomingRaces.filter((race) => race.year === selectedYear);
  const grandPrixCards = buildCalendarCards(filteredRecentResults, filteredUpcomingRaces);
  const nextRace = filteredUpcomingRaces.filter((race) => race.dateStart > new Date().toISOString())[0];

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-20">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl tracking-wide">{selectedYear} Race Calendar</h1>
        <p className="font-pixel text-xs uppercase tracking-wide text-white/60 py-4">
          {filteredRecentResults.length + "/" +grandPrixCards.length} races
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
      {nextRace &&
        <Card
          className="relative min-h-[300px] overflow-hidden rounded-3xl border-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/next-race-banners/${banners[nextRace.circuitShortName]}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-black/5" />

          <CardContent className="relative flex h-full min-h-[220px] flex-col justify-between px-6 py-6 sm:px-8 sm:py-8">
            <div className="max-w-md space-y-2 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">{"Round " + nextRace.round}</p>
              <p className="font-heading text-4xl leading-none sm:text-5xl">{nextRace.countryName}</p>
              <p className="max-w-sm text-sm text-white/75">
                {nextRace.grandPrixName}
              </p>
            </div>

            <div className="flex items-end justify-between gap-4 text-white/85">
              <p className="font-pixel text-sm uppercase tracking-[0.2em] text-white/60">{formatRaceDateRange(nextRace.dateStart, nextRace.dateEnd)}</p>
            </div>
          </CardContent>
        </Card>
      }
      <section className="grid gap-6 min-[700px]:grid-cols-2 min-[1293px]:grid-cols-3">
        {grandPrixCards.map((race) => {
          return (
            <Card 
              key={race.round} 
              className={nextRace && formatRaceDateRange(nextRace.dateStart, nextRace.dateEnd) === race.dateRange
              ? "h-full min-h-[240px] ring-f1-red" : "h-full min-h-[240px]"}
            >
              <CardContent className="flex h-full flex-col gap-6 px-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-muted-foreground">ROUND {race.round}</p>
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