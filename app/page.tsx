import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Calendar } from "lucide-react";
import { getCurrentStandings } from "@/services/standings";
import { StandingsCard } from "@/components/standings-card";

export default async function Home() {
  const { drivers, constructors } = await getCurrentStandings();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-8">
        <StandingsCard driverStandings={drivers} constructorStandings={constructors} className="md:col-span-2 lg:col-span-2" />

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex gap-2 text-xl font-semibold"><Calendar />Season Overview</CardTitle>
          </CardHeader>
          <CardContent>
            Card Content
          </CardContent>
        </Card>
    </div>
  );
}
