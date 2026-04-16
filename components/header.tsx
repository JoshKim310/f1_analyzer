"use client"
import { NextRaceInfo } from "@/services/sessions-data"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Calendar } from "lucide-react"

type HeaderProps = {
  nextRace: NextRaceInfo | null
  initialNow: number
}

function format24HourTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function parseGmtOffsetMinutes(gmtOffset: string) {
  const match = gmtOffset.match(/^([+-])?(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return sign * (hours * 60 + minutes);
}

function formatSignedOffset(minutes: number) {
  const sign = minutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getTrackNowFromOffset(now: Date, trackOffsetMinutes: number) {
  const utcNowMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const trackNowMs = utcNowMs + trackOffsetMinutes * 60_000;
  return new Date(trackNowMs);
}

function getTimeLeft(target: string, nowMs: number) {
  const diff = new Date(target).getTime() - nowMs;
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
    hour12: false,
  }).format(d); // 7:30 PM

  return `${weekday}, ${datePart} ${timePart}`;
}

export function Header({ nextRace, initialNow }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(initialNow);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const id = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

    const timeLeft = useMemo(() => {
      if (!nextRace?.dateStart) return null;
      return getTimeLeft(nextRace.dateStart, currentTime);
    }, [nextRace?.dateStart, currentTime]);

    const meetingDate = useMemo(() => {
      if (!nextRace?.dateStart) return "";
      return formatMeetingDate(nextRace.dateStart);
    }, [nextRace?.dateStart]);

    const timeInfo = useMemo(() => {
      if (!nextRace?.gmtOffset) return null;

      const now = new Date(currentTime);
      const trackOffsetMinutes = parseGmtOffsetMinutes(nextRace.gmtOffset);
      const trackNow = getTrackNowFromOffset(now, trackOffsetMinutes);
      const localOffsetMinutes = -now.getTimezoneOffset();
      const deltaMinutes = trackOffsetMinutes - localOffsetMinutes;

      return {
        localTime: isMounted ? format24HourTime(now) : null,
        trackTime: format24HourTime(trackNow),
        offsetLabel: formatSignedOffset(trackOffsetMinutes),
        deltaLabel: formatSignedOffset(deltaMinutes),
      };
    }, [nextRace?.gmtOffset, currentTime, isMounted]);

    return (
        <header className="sticky top-0 z-50 h-[var(--header-height)] shrink-0 border-b border-border bg-background px-6 py-4">
          <div className="flex h-full items-center gap-20">
            <div>
              <h1 className="font-title text-2xl tracking-widest uppercase text-f1-red">F1 Analyzer</h1>
              <p className="text-sm text-muted-foreground">Race analytics dashboard</p>
            </div>
            
            <div className="rounded-lg border border-muted bg-card px-4 py-2 text-sm min-w-[350px]">
              {nextRace ? (
                <>
                  <div className="flex items-center">
                    <div>
                      <p className="font-heading leading-tight flex items-center gap-2 pb-1">
                        <Image
                          src={nextRace.countryFlag}
                          alt={nextRace.countryName}
                          width={16}
                          height={9}
                          className="w-6 h-4 mr-2 rounded-sm"
                        />
                        {nextRace.countryName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar
                          width={14}
                          height={14}
                        />
                        <p className="text-xs text-muted-foreground">{meetingDate}</p>
                      </div>
                      
                    </div>
                    <p className="text-xs text-muted-foreground pl-1 font-digital inline-flex items-center">
                      {timeLeft? (
                        <>
                        <span className="inline-block w-[3ch] text-right text-white tabular-nums">{timeLeft.days}</span>
                        <span className="text-muted-foreground px-1 text-[10px]">D</span>

                        <span className="inline-block w-[2ch] text-right text-white tabular-nums">{String(timeLeft.hours).padStart(2, "0")}</span>
                        <span className="text-muted-foreground px-1 text-[10px]">H</span>

                        <span className="inline-block w-[2ch] text-right text-white tabular-nums">{timeLeft.minutes}</span>
                        <span className="text-muted-foreground px-1 text-[10px]">M</span>

                        <span className="inline-block w-[2ch] text-right text-white tabular-nums">{timeLeft.seconds}</span>
                        <span className="text-muted-foreground px-1 text-[10px]">S</span>
                        </>
                      ) : (
                      <span className="text-muted-foreground pb-2 pl-5">In Progress</span>
                      )}
                    </p>
                    <div className="pl-15 text-xs text-muted-foreground">
                      <p className="grid grid-cols-[10ch_auto] items-baseline gap-x-5 text-white">
                        <span>MY TIME</span>
                        <span className="font-digital">{timeInfo?.localTime ?? "--:--"}</span>
                      </p>
                      <p className="grid grid-cols-[10ch_auto] items-baseline gap-x-5">
                        <span>TRACK TIME</span>
                        <span>
                          <span className="font-digital">{timeInfo?.trackTime ?? "--:--"}</span>
                          <span className="pl-1">({timeInfo?.deltaLabel ?? "+00:00"})</span>
                        </span>
                      </p>
                    </div>
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