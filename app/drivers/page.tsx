import { DriversTable } from "@/components/drivers-table";
import { getDriverStandings } from "@/services/standings";

export default async function DriversPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, index) => 2023 + index);
  const standingsByYear = Object.fromEntries(
    await Promise.all(
      years.map(async (year) => [year, await getDriverStandings(year)] as const)
    )
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <DriversTable standingsByYear={standingsByYear} years={years} />
    </div>
  )
}