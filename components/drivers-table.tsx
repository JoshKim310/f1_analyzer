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
    <div className="flex justify-start px-4 sm:px-8">
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
    <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-8">
        {drivers.map((driver) => {
          const teamColor = getTeamColor(driver.teamColor);

          return (
            <div
              key={driver.driverNumber}
              className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-3 py-3 transition-colors hover:bg-muted/40 sm:px-4"
              style={{
                borderColor: withAlpha(teamColor, 0.22),
                background: `linear-gradient(90deg, ${withAlpha(teamColor, 0.12)} 0%, transparent 42%)`,
              }}
            >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-6 shrink-0 text-center font-digital text-sm text-muted-foreground">
                {driver.positionCurrent}
              </span>
              <div
                className="h-10 w-1 shrink-0 rounded-full"
                style={{
                  backgroundColor: teamColor,
                  boxShadow: `0 0 12px ${withAlpha(teamColor, 0.55)}`,
                }}
              />
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {driver.headshotUrl ? (
                    <img
                      src={driver.headshotUrl}
                      alt={driver.fullName}
                      className="-my-2 h-20 w-20 shrink-0 rounded-full object-cover object-top"
                    />
                  ) : (
                    <div className="-my-2 h-20 w-20 shrink-0 rounded-full bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base sm:text-lg">
                      {driver.fullName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {driver.teamName}
                    </p>
                  </div>
                </div>
                <span className="ml-2 w-10 shrink-0 text-center font-digital text-2xl text-muted-foreground">
                  {driver.driverNumber}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-right sm:gap-8">
              <div>
                <p className="font-digital text-lg text-white">{driver.wins}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Wins
                </p>
              </div>
              <div className="w-10">
                <p className="font-digital text-lg text-white">{driver.points}</p>
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
