import { ConstructorsTable } from "@/components/constructors-table";
import {
  getConstructorStandings,
  getCurrentStandings,
  getDriverStandings,
} from "@/services/standings";

export default async function ConstructorsPage() {
  const { constructors, drivers } = await getCurrentStandings();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, index) => 2023 + index);
  const [constructorsByYear, driversByYear] = await Promise.all([
    Object.fromEntries(
      await Promise.all(years.map(async (year) => [year, await getConstructorStandings(year)] as const))
    ),
    Object.fromEntries(
      await Promise.all(years.map(async (year) => [year, await getDriverStandings(year)] as const))
    ),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <ConstructorsTable
        constructors={constructors}
        drivers={drivers}
        constructorsByYear={constructorsByYear}
        driversByYear={driversByYear}
        years={years}
      />
    </div>
  )
}