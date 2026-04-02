"use client";
import Image from "next/image";
import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./shadcn/card";
import { ToggleGroup, ToggleGroupItem } from "./shadcn/toggle-group";
import { DriverIcon } from "@/public/DriverIcon";
import { Trophy, Warehouse } from "lucide-react";

type DriverStandingRow = {
  driverNumber: number;
  position: number;
  fullName: string;
  teamName: string;
  teamColor: string;
  points: number;
  wins: number;
  nameAcronym: string;
}

type ConstructorStandingRow = {
  position: number;
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
        <CardHeader className="px-6 pt-2">
          <CardTitle className="flex gap-2">
            <Trophy />
            <span className="font-heading text-xl">Standings</span>
          </CardTitle>
          <CardAction>
            <ToggleGroup
              variant="outline"
              size="sm"
              type="single"
              value={view}
              onValueChange={(value) => {
                if (!value) return;
                setView(value);
              }}
            >
              <ToggleGroupItem value="drivers"><DriverIcon /> Drivers</ToggleGroupItem>
              <ToggleGroupItem value="constructors"><Warehouse /> Constructors</ToggleGroupItem>
            </ToggleGroup>
          </CardAction>
        </CardHeader>
        <CardContent className="px-8">
          {view === "drivers" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="text-muted-foreground border-b border-border">
                  <tr className="p-2">
                    <th className="text-center py-2 pr-4">Pos</th>
                    <th className="text-left py-2 pr-4">Driver</th>
                    <th className="text-left py-2 pr-4">Team</th>
                    <th className="text-center py-2 pr-4">Wins</th>
                    <th className="text-center py-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {driverStandings.map((row, idx) => {
                    const teamHex = normalizeHex(row.teamColor);

                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-6 pr-4 text-center">{row.position}</td>

                        <td className="py-6 pr-4">
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

                        <td className="py-6 pr-4">{row.teamName}</td>
                        <td className="py-6 pr-4 text-center">{row.wins ?? "-"}</td>
                        <td className="py-6 text-center">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="text-muted-foreground border-b border-border">
                  <tr className="p-2">
                    <th className="w-12 text-center py-2 pl-0 pr-2">Pos</th>
                    <th className="text-left py-2 pl-10">Team</th>
                    <th className="w-16 text-center py-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {constructorStandings.map((row, idx) => {
                    const teamHex = normalizeHex(row.teamColor);
                    const logoUrl = TEAM_LOGO_ICONS[row.teamName];
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="w-12 py-6 pl-0 pr-2 text-center font-semibold">{row.position}</td>
                        <td className="py-6 pl-10 text-left font-semibold">
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
                        <td className="w-16 py-6 text-center font-semibold">{row.points}</td>
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