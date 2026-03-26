"use client"
import { NextRaceInfo } from "@/services/sessionsData"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Calendar } from "lucide-react"

type HeaderProps = {
    nextRace: NextRaceInfo | null
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function formatMeetingDate(dateIso: string) {
  const d = new Date(dateIso);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d); // Thu
  const datePart = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d); // Mar 26
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d); // 7:30 PM

  return `${weekday}, ${datePart} ${timePart}`;
}

export function Header({ nextRace }: HeaderProps) {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
      const id = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => clearInterval(id);
    }, []);

    const timeLeft = useMemo(() => {
      if (!nextRace?.dateStart) return null;
        return getTimeLeft(nextRace.dateStart);
    }, [nextRace?.dateStart, currentTime]);

    const meetingDate = useMemo(() => {
      if (!nextRace?.dateStart) return "";
      return formatMeetingDate(nextRace.dateStart);
    }, [nextRace?.dateStart]);

    return (
        <header className="sticky top-0 z-50 h-[var(--header-height)] shrink-0 border-b border-border bg-background px-6 py-4">
          <div className="flex h-full items-center gap-20">
            <div>
              <h1 className="font-title text-2xl tracking-widest uppercase text-f1-red">F1 Analyzer</h1>
              <p className="text-sm text-muted-foreground">Race analytics dashboard</p>
            </div>
            
            <div className="rounded-lg border border-muted bg-card px-4 py-2 text-sm min-w-[390px]">
              {nextRace ? (
                <>
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold leading-tight flex items-center gap-2 pb-1">
                        <Image
                          src={nextRace.countryFlag}
                          alt={nextRace.countryName}
                          width={16}
                          height={9}
                          className="w-6 h-4 mr-2 rounded-sm"
                        />
                        {nextRace.meeting_name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar
                          width={14}
                          height={14}
                        />
                        <p className="text-xs text-muted-foreground">{meetingDate}</p>
                      </div>
                      
                    </div>
                    <p className="text-xs text-muted-foreground pl-5 font-digital">
                      {timeLeft? (
                        <>
                        <span className="text-white">{timeLeft.days}</span>
                        <span className="text-muted-foreground px-1">d </span>

                        <span className="text-white">{timeLeft.hours}</span>
                        <span className="text-muted-foreground px-1">h </span>

                        <span className="text-white">{timeLeft.minutes}</span>
                        <span className="text-muted-foreground px-1">m </span>

                        <span className="text-white">{timeLeft.seconds}</span>
                        <span className="text-muted-foreground px-1">s</span>
                        </>
                      ) : (
                      <span className="text-muted-foreground">Starting now</span>
                      )}
                    </p>
                  </div>

                </>
              ) : (
                <p className="text-muted-foreground">No upcoming race found.</p>
              )}
            </div>
          </div>
        </header>
    );
}