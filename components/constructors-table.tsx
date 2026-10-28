"use client"
import Image from "next/image";
import type { ConstructorStanding, DriverStanding } from "@/services/standings";
import { TEAM_LOGO_ICONS } from "@/lib/team-assets";
import React from "react";
import { ChevronDown } from "lucide-react";
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

export function ConstructorsTable({
  constructors,
  drivers,
  constructorsByYear,
  driversByYear,
  years,
}: {
  constructors: ConstructorStanding[];
  drivers: DriverStanding[];
  constructorsByYear?: Record<string, ConstructorStanding[]>;
  driversByYear?: Record<string, DriverStanding[]>;
  years?: number[];
}) {
  const [selectedYear, setSelectedYear] = React.useState(years?.[years.length - 1]);
  const selectedConstructors = constructorsByYear && selectedYear
    ? constructorsByYear[selectedYear] ?? []
    : constructors;
  const selectedDrivers = driversByYear && selectedYear
    ? driversByYear[selectedYear] ?? []
    : drivers;
  const driversByTeam = new Map<string, DriverStanding[]>();

  for (const driver of selectedDrivers) {
    const teamDrivers = driversByTeam.get(driver.teamName) ?? [];
    teamDrivers.push(driver);
    driversByTeam.set(driver.teamName, teamDrivers);
  }

  return (
    <>
    {years && years.length > 0 ? (
      <div className="flex flex-col items-start gap-10 px-4 sm:px-8">
        <h1 className="font-heading text-3xl tracking-wide">{selectedYear} Constructors</h1>
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
    ) : null}
    <div className="grid gap-3 px-4 min-[1260px]:grid-cols-2 sm:px-8">
      {selectedConstructors.map((constructor) => {
        const teamColor = getTeamColor(constructor.teamColor);
        const teamDrivers = driversByTeam.get(constructor.teamName) ?? [];
        const logoUrl = TEAM_LOGO_ICONS[constructor.teamName];

        return (
          <div
            key={constructor.teamName}
            className="flex min-w-0 flex-col gap-4 rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
            style={{
              borderColor: withAlpha(teamColor, 0.22),
              background: `linear-gradient(135deg, ${withAlpha(teamColor, 0.14)} 0%, transparent 58%)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-1 shrink-0 rounded-full"
                style={{
                  backgroundColor: teamColor,
                  boxShadow: `0 0 12px ${withAlpha(teamColor, 0.55)}`,
                }}
              />
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${constructor.teamName} logo`}
                  width={56}
                  height={56}
                  className="h-12 w-12 shrink-0 object-contain"
                />
              ) : null}
              <div className="min-w-0">
                <p className="truncate font-heading text-lg">{constructor.teamName}</p>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <p className="font-digital text-2xl text-white">{constructor.points}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pts</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {teamDrivers.map((driver) => (
                <div
                  key={driver.driverNumber}
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border/50 bg-background/20 px-2 py-2"
                >
                  {driver.headshotUrl ? (
                    <img
                      src={driver.headshotUrl}
                      alt={driver.fullName}
                      className="h-8 w-8 shrink-0 rounded-full object-cover object-top"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm">{driver.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">{driver.nameAcronym}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
