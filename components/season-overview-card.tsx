import { Card, CardContent, CardHeader, CardTitle } from "./shadcn/card";
import { Calendar } from "lucide-react";
import type { RaceProgressInfo, RecentRaceResult } from "@/services/sessionsData";

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
}: {
  className?: string;
  raceProgress: RaceProgressInfo;
  recentResults: RecentRaceResult[];
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
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={race.countryFlag}
                          alt={race.countryName}
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                        <p className="text-base leading-none font-heading">{race.countryName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRaceDateRange(race.dateStart, race.dateEnd)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="text-xs text-muted-foreground">Round {race.round}</p>

                      <div className="ml-auto grid w-full max-w-[260px] grid-cols-3 gap-2">
                        {race.podium.map((placement) => (
                          <div
                            key={`${race.round}-${placement.position}`}
                            className="min-h-[40px] rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] leading-tight"
                          >
                            <p className="font-semibold truncate">
                              {getOrdinal(placement.position)}
                              <span style={{ color: placement.teamColor }}>
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
        </CardContent>
      </Card>
    )
}