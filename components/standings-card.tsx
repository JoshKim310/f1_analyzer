"use client";
import Image from "next/image";
import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./shadcn/card";
import { ToggleGroup, ToggleGroupItem } from "./shadcn/toggle-group";
import { DriverIcon } from "@/public/DriverIcon";
import { Trophy, Warehouse } from "lucide-react";

type DriverStandingRow = {
  driverNumber: number;
  positionCurrent: number;
  positionStart: number;
  fullName: string;
  teamName: string;
  teamColor: string;
  points: number;
  wins: number;
  nameAcronym: string;
}

type ConstructorStandingRow = {
  positionCurrent: number;
  positionStart: number;
  teamName: string;
  points: number;
  teamColor: string;
}

const TEAM_LOGO_ICONS: Record<string, string> = {
  "Ferrari": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp",
  "Mercedes": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp",
  "Red Bull Racing": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp",
  "McLaren": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp",
  "Alpine": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp",
  "Aston Martin": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp",
  "Haas F1 Team": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp",
  "Racing Bulls": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp",
  "Williams": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp",
  "Cadillac": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp",
  "Audi": "https://media.formula1.com/image/upload/c_lfill,w_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp",
}

const normalizeHex = (hex: string) => (hex?.startsWith("#") ? hex : `#${hex}`);

const hexToRgba = (hex: string, alpha: number) => {
  const clean = normalizeHex(hex).replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function renderPositionDiff(positionStart: number, positionCurrent: number) {
  const delta = positionStart - positionCurrent;

  if (delta > 0) {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-muted-foreground">
        <span className="text-[12px] leading-none text-green-500">▲</span>
        <span>{delta}</span>
      </span>
    );
  }

  if (delta < 0) {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-muted-foreground">
        <span className="text-[12px] leading-none text-red-500">▼</span>
        <span>{Math.abs(delta)}</span>
      </span>
    );
  }

  return <span className="text-muted-foreground">-</span>;
}

export function StandingsCard({
  driverStandings,
  constructorStandings,
  className,
}: {
  driverStandings: DriverStandingRow[];
  constructorStandings: ConstructorStandingRow[];
  className?: string;
}) {
  const [view, setView] = useState("drivers");

    return (
      <Card className={className}>
        <CardHeader className="grid-cols-1 px-4 pt-2 sm:grid-cols-[1fr_auto] sm:px-6">
          <CardTitle className="flex items-center gap-2">
            <Trophy />
            <span className="font-heading text-xl">Standings</span>
          </CardTitle>
          <CardAction className="col-start-1 row-start-2 mt-2 justify-self-stretch sm:col-start-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
            <ToggleGroup className="w-full sm:w-auto"
              variant="outline"
              size="sm"
              type="single"
              value={view}
              onValueChange={(value) => {
                if (!value) return;
                setView(value);
              }}
            >
              <ToggleGroupItem className="min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-3 sm:text-sm" value="drivers"><DriverIcon /> Drivers</ToggleGroupItem>
              <ToggleGroupItem className="min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-3 sm:text-sm" value="constructors"><Warehouse /> Constructors</ToggleGroupItem>
            </ToggleGroup>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4 sm:px-8">
          {view === "drivers" ? (
            <div className="overflow-x-auto">
              <table className="min-w-[620px] w-full text-sm sm:text-base">
                <thead className="text-muted-foreground border-b border-border">
                  <tr className="p-2">
                    <th className="text-center py-2 pr-4">Pos</th>
                    <th className="text-left py-2 pr-4">Driver</th>
                    <th className="text-left py-2 pr-4">Team</th>
                    <th className="text-center py-2 pr-4">Wins</th>
                    <th className="text-center py-2 pr-8">Pts</th>
                    <th className="text-center py-2 pl-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {driverStandings.map((row, idx) => {
                    const teamHex = normalizeHex(row.teamColor);

                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-4 pr-4 text-center sm:py-6">{row.positionCurrent}</td>
                        <td className="py-4 pr-4 sm:py-6">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex h-6 min-w-10 items-center justify-center rounded-md border px-2 text-[10px] font-title tracking-wide pointer-events-none select-none"
                              style={{
                                color: teamHex,
                                borderColor: hexToRgba(teamHex, 0.45),
                                backgroundColor: "transparent",
                              }}
                            >
                              {row.nameAcronym}
                            </span>
                            <span className="text-left">{row.fullName}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 sm:py-6">{row.teamName}</td>
                        <td className="py-4 pr-4 text-center sm:py-6">{row.wins ?? "-"}</td>
                        <td className="py-4 pr-8 text-center sm:py-6">{row.points}</td>
                        <td className="py-4 pl-2 pr-4 text-center sm:py-6">{renderPositionDiff(row.positionStart, row.positionCurrent)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[420px] w-full text-sm sm:text-base">
                <thead className="text-muted-foreground border-b border-border">
                  <tr className="p-2">
                    <th className="w-12 text-center py-2 pl-0 pr-2">Pos</th>
                    <th className="text-left py-2 pl-10">Team</th>
                    <th className="w-16 text-center py-2 pr-20">Pts</th>
                    <th className="w-12 text-center py-2 pl-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {constructorStandings.map((row, idx) => {
                    const teamHex = normalizeHex(row.teamColor);
                    const logoUrl = TEAM_LOGO_ICONS[row.teamName];
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="w-12 py-4 pl-0 pr-2 text-center font-semibold sm:py-6">{row.positionCurrent}</td>
                        <td className="py-4 pl-6 text-left font-semibold sm:py-6 sm:pl-10">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-5 w-1 rounded-sm shrink-0"
                              style={{ backgroundColor: teamHex }}
                              aria-hidden="true"
                            />
                            {logoUrl ? (
                              <Image
                                src={logoUrl}
                                alt={`${row.teamName} logo`}
                                width={24}
                                height={24}
                                className="h-6 w-6 shrink-0 object-contain"
                              />
                            ) : null}
                            <span>{row.teamName}</span>
                          </div>
                        </td>
                        <td className="w-16 py-4 pr-8 text-center font-semibold sm:py-6 sm:pr-20">{row.points}</td>
                        <td className="w-12 py-4 text-center font-semibold sm:py-6">{renderPositionDiff(row.positionStart, row.positionCurrent)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )
}