"use client"
import { Card, CardContent } from "../shadcn/card";
import { BANNERS } from "@/lib/banner-assets";
import { UpcomingRaceInfo } from "@/services/sessions-data";
import { formatRaceDateRange } from "@/lib/date-utils";
import { Play } from "lucide-react";
import { useRef, useState } from "react";

export default function NextRaceBanner({
  nextRace,
}: {
  nextRace: UpcomingRaceInfo | null | undefined;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    function handlePlay() {
        setIsPlaying(true);
        requestAnimationFrame(() => {
            void videoRef.current?.play();
        });
    }

    function resetBanner() {
        const video = videoRef.current;

        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        setIsPlaying(false);
    }

    if (!nextRace) {
        return null;
    }
    return (
        <Card
          className="group relative min-h-[300px] overflow-hidden rounded-3xl border-0"
          onPointerLeave={() => {
            if (isPlaying && videoRef.current?.paused) {
              resetBanner();
            }
          }}
        >
          {isPlaying ? (
            <video
              ref={videoRef}
              src="https://2d5ptffqj7va7xlf.public.blob.vercel-storage.com/banner-video.mp4"
              controls
              autoPlay
              playsInline
              onEnded={resetBanner}
            />
          ) : (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/next-race-banners/${BANNERS[nextRace.circuitShortName]}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-black/5" />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/35" />

              <CardContent className="relative z-10 flex min-h-[300px] flex-col justify-between px-6 py-6 sm:px-8 sm:py-8">
                <div className="max-w-md space-y-2 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    {"Round " + nextRace.round}
                  </p>
                  <p className="font-heading text-4xl leading-none sm:text-5xl">
                    {nextRace.countryName}
                  </p>
                  <p className="max-w-sm text-sm text-white/75">
                    {nextRace.grandPrixName}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-4 text-white/85">
                  <p className="font-pixel text-sm uppercase tracking-[0.2em] text-white/60">
                    {formatRaceDateRange(nextRace.dateStart, nextRace.dateEnd)}
                  </p>
                  <button
                    type="button"
                    onClick={handlePlay}
                    aria-label="Play race video"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors duration-300 group-hover:bg-white/35 group-hover:shadow-lg group-focus-within:bg-white/35"
                  >
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
    );
}
