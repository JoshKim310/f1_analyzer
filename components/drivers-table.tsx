"use client"
import type { DriverStanding } from "@/services/standings";
import { ChevronDown } from "lucide-react";
import React from "react";
import { Button } from "./shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./shadcn/dropdown-menu";

function getTeamColor(value: string) {
  const color = value.trim();
  if (!color) return "#e10600";
  return color.startsWith("#") ? color : `#${color}`;
}

function withAlpha(hex: string, alpha: number) {
  const value = hex.slice(1);
  const expanded = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value;
  const number = Number.parseInt(expanded, 16);

  if (Number.isNaN(number)) return `rgba(225, 6, 0, ${alpha})`;

  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

export function DriversTable({
standingsByYear,
years,
}: {
standingsByYear: Record<string, DriverStanding[]>;
years: number[];
}) {
const [selectedYear, setSelectedYear] = React.useState(years[years.length - 1]);
const drivers = standingsByYear[selectedYear] ?? [];

return (
  <>
    <div className="flex flex-col items-start gap-5 px-4 sm:px-8">
      <h1 className="font-heading text-3xl tracking-wide">{selectedYear} Drivers</h1>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg" className="h-8 gap-1.5 px-2.5 text-sm">
            {selectedYear}
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-0">
          {[...years].reverse().map((year) => (
            <DropdownMenuItem key={year} onSelect={() => setSelectedYear(year)}>
              {year}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="grid gap-3 px-4 min-[1260px]:grid-cols-2 sm:px-8">
        {drivers.map((driver) => {
          const teamColor = getTeamColor(driver.teamColor);

          return (
            <div
              key={driver.driverNumber}
              className="flex min-w-0 items-center justify-between gap-2 rounded-lg border bg-muted/20 px-2 py-2 transition-colors hover:bg-muted/40 min-[550px]:gap-4 min-[550px]:px-3 min-[550px]:py-3 sm:px-4"
              style={{
                borderColor: withAlpha(teamColor, 0.22),
                background: `linear-gradient(90deg, ${withAlpha(teamColor, 0.12)} 0%, transparent 42%)`,
              }}
            >
            <div className="flex min-w-0 items-center gap-2 min-[550px]:gap-3">
              <span className="w-4 shrink-0 text-center font-digital text-[11px] text-muted-foreground min-[550px]:w-6 min-[550px]:text-sm">
                {driver.positionCurrent}
              </span>
              <div
                className="h-8 w-1 shrink-0 rounded-full min-[550px]:h-10"
                style={{
                  backgroundColor: teamColor,
                  boxShadow: `0 0 12px ${withAlpha(teamColor, 0.55)}`,
                }}
              />
              <div className="flex min-w-0 items-center gap-1.5 min-[550px]:gap-3">
                <div className="flex min-w-0 items-center gap-1.5 min-[550px]:gap-3">
                  {driver.headshotUrl ? (
                    <img
                      src={driver.headshotUrl}
                      alt={driver.fullName}
                      className="-my-1 h-10 w-10 shrink-0 rounded-full object-cover object-top min-[550px]:-my-2 min-[550px]:h-20 min-[550px]:w-20"
                    />
                  ) : (
                    <div className="-my-1 h-10 w-10 shrink-0 rounded-full bg-muted min-[550px]:-my-2 min-[550px]:h-20 min-[550px]:w-20" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-xs min-[550px]:text-base sm:text-lg">
                      {driver.fullName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground min-[550px]:text-sm">
                      {driver.teamName}
                    </p>
                  </div>
                </div>
                <span className="ml-0.5 w-7 shrink-0 text-center font-digital text-lg text-muted-foreground min-[550px]:ml-2 min-[550px]:w-10 min-[550px]:text-2xl">
                  {driver.driverNumber}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-right min-[550px]:gap-4 sm:gap-8">
              <div>
                <p className="font-digital text-sm text-white min-[550px]:text-lg">{driver.wins}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Wins
                </p>
              </div>
              <div className="w-8 min-[550px]:w-10">
                <p className="font-digital text-sm text-white min-[550px]:text-lg">{driver.points}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Pts
                </p>
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
