import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
import { Calendar, Trophy, Warehouse } from "lucide-react";
import { DriverIcon } from "@/public/DriverIcon";

export default function Home() {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-8">
      <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Trophy />
              <span className="text-xl font-semibold">Standings</span>
            </CardTitle>
            <CardAction>
              <ToggleGroup variant="outline" size="sm" type="single" defaultValue="drivers">
                <ToggleGroupItem value="drivers"><DriverIcon /> Drivers</ToggleGroupItem>
                <ToggleGroupItem value="constructors"><Warehouse /> Constructors</ToggleGroupItem>
              </ToggleGroup>
            </CardAction>
          </CardHeader>
          <CardContent>
            Card Content
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex gap-2 text-xl font-semibold"><Calendar />Season Overview</CardTitle>
            <CardAction>
       
            </CardAction>
          </CardHeader>
          <CardContent>
            Card Content
          </CardContent>
        </Card>
    </div>
  );
}
