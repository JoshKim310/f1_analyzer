"use client"
import { Card, CardContent } from "../shadcn/card";
import { BANNERS } from "@/lib/banner-assets";
import { UpcomingRaceInfo } from "@/services/sessions-data";
import { formatRaceDateRange } from "@/lib/date-utils";

export default function NextRaceBanner({
  nextRace,
}: {
  nextRace: UpcomingRaceInfo | null | undefined;
}) {
    if (!nextRace) {
        return null;
    }
    return (
        <Card
          className="relative min-h-[300px] overflow-hidden rounded-3xl border-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/next-race-banners/${BANNERS[nextRace.circuitShortName]}')` }}
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
    );
}