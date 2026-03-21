"use client";

import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./shadcn/card";
import { ToggleGroup, ToggleGroupItem } from "./shadcn/toggle-group";
import { DriverIcon } from "@/public/DriverIcon";
import { Trophy, Warehouse } from "lucide-react";

type StandingRow = {
  position: number;
  fullName: string;
  teamName: string;
  teamColor: string;
  points: number;
  wins: number | undefined;
  nameAcronym: string;
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
  standings,
  className,
}: {
  standings: StandingRow[];
  className?: string;
}) {
  const [view, setView] = useState("drivers");

    return (
      <Card className={className}>
        <CardHeader className="px-6 pt-2">
          <CardTitle className="flex gap-2">
            <Trophy />
            <span className="text-xl font-semibold">Standings</span>
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
              <table className="w-full text-sm">
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
                  {standings.map((row, idx) => {
                    const teamHex = normalizeHex(row.teamColor);

                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-6 pr-4 text-center font-semibold">{row.position}</td>

                        <td className="py-6 pr-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex h-6 min-w-10 items-center justify-center rounded-md border px-2 text-xs font-semibold tracking-wide pointer-events-none select-none"
                              style={{
                                color: teamHex,
                                borderColor: hexToRgba(teamHex, 0.45),
                                backgroundColor: "transparent",
                              }}
                            >
                              {row.nameAcronym}
                            </span>
                            <span className="text-left font-semibold">{row.fullName}</span>
                          </div>
                        </td>

                        <td className="py-6 pr-4 font-semibold">{row.teamName}</td>
                        <td className="py-6 pr-4 text-center font-semibold">{row.wins ?? "-"}</td>
                        <td className="py-6 text-center font-semibold">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              Constructor standings coming soon!
            </div>
          )}
        </CardContent>
      </Card>
    )
}