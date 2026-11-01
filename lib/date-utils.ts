const dayFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

export function formatRaceDateRange(dateStart: string, dateEnd?: string) {
  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : new Date(dateStart);

  if (Number.isNaN(start.getTime())) return "TBA";
  if (Number.isNaN(end.getTime())) return dayMonthFormatter.format(start);

  const startDay = dayFormatter.format(start);
  const endDay = dayFormatter.format(end);
  const startMonth = monthFormatter.format(start);
  const endMonth = monthFormatter.format(end);

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}
