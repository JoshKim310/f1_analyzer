import { Card, CardContent, CardHeader, CardTitle } from "./shadcn/card";
import { Calendar } from "lucide-react";
import type { RaceProgressInfo, RecentRaceResult, UpcomingRaceInfo } from "@/services/sessions-data";
import Image from "next/image";

function formatRaceDateRange(dateStartIso: string, dateEndIso: string) {
  const start = new Date(dateStartIso);
  const end = new Date(dateEndIso);

  const startDay = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(start);
  const endDay = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(end);
  const startMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(start);
  const endMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(end);

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

function getOrdinal(position: number) {
  if (position === 1) return "1ST";
  if (position === 2) return "2ND";
  if (position === 3) return "3RD";
  return `${position}TH`;
}


export function SeasonOverviewCard({
  className,
  raceProgress,
  recentResults,
  upcomingRaces,
}: {
  className?: string;
  raceProgress: RaceProgressInfo;
  recentResults: RecentRaceResult[];
  upcomingRaces: UpcomingRaceInfo[];
}) {
    const { completedRaces, totalRaces } = raceProgress;
    const currentRound = totalRaces === 0 ? 0 : Math.min(completedRaces + 1, totalRaces);
    const progressPercent = totalRaces === 0 ? 0 : (currentRound / totalRaces) * 100;

    return (
      <Card className={className}>
        <CardHeader className="px-6 pt-2">
          <CardTitle className="flex gap-2">
            <Calendar />
            <span className="font-heading text-xl">{new Date().getFullYear()} Season Overview</span>
          </CardTitle>           
        </CardHeader>
        <CardContent className="space-y-6 px-8">
          <div>
            <p className="text-lg">
            Round {currentRound}/{totalRaces}
            </p>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={currentRound}
              aria-valuemin={0}
              aria-valuemax={totalRaces}
              aria-label="Season progress"
            >
              <div
                className="h-full rounded-full bg-f1-red transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Results
            </p>

            <div className="mt-3 space-y-3">
              {recentResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed races yet.</p>
              ) : (
                recentResults.map((race) => (
                  <div key={`${race.round}-${race.dateStart}`} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between pb-2">
                      <p className="text-xs text-muted-foreground">ROUND {race.round}</p>
                      <p className="text-xs text-muted-foreground font-pixel">
                        {formatRaceDateRange(race.dateStart, race.dateEnd)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src={race.countryFlag}
                        alt={race.countryName}
                        className="h-4 w-6 rounded-sm object-cover"
                      />
                      <p className="text-base leading-none font-heading">{race.countryName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground py-2">{race.grandPrixName}</p>
                    <div className="flex items-end justify-between">
                      <div className="ml-auto grid w-full max-w-[280px] grid-cols-3 gap-2">
                        {race.podium.map((placement) => (
                          <div
                            key={`${race.round}-${placement.position}`}
                            className="min-h-[40px] rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] leading-tight"
                          >
                            <p className="truncate">
                              <span className="text-xs">
                                {getOrdinal(placement.position)}
                              </span>
                              <span className="font-title" style={{ color: placement.teamColor }}>
                                {" " + placement.driverAcronym}
                              </span>
                            </p>
                            <p className="text-muted-foreground truncate">{placement.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Upcoming
            </p>

            <div className="mt-3 space-y-3">
              {upcomingRaces.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming races.</p>
              ) : (
                upcomingRaces.map((race) => (
                  <div key={`${race.round}-${race.dateStart}`} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-end justify-between gap-3 pb-2">
                      <p className="text-xs text-muted-foreground">ROUND {race.round}</p>
                      <p className="text-xs text-muted-foreground font-pixel">
                        {formatRaceDateRange(race.dateStart, race.dateEnd)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-full min-w-0 pt-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <img
                            src={race.countryFlag}
                            alt={race.countryName}
                            className="h-4 w-6 rounded-sm object-cover"
                          />
                          <p className="truncate text-base leading-none font-heading">{race.countryName}</p>
                        </div>
                        <p className="mt-2 truncate text-xs text-muted-foreground">{race.grandPrixName}</p>
                      </div>
                      <Image
                        src={race.circuitImage}
                        alt={race.grandPrixName}
                        width={50}
                        height={20}
                        className={`h-16 w-24 shrink-0 self-end rounded-md object-contain invert`}
                      />
                    </div>
                  </div>
                  )
                )
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    )
}