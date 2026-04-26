type Meeting = {
  meeting_key: number;
  meeting_name: string;
  country_name: string;
  country_flag: string;
  date_start: string;
  date_end: string;
  meeting_official_name: string;
  gmt_offset: string;
  circuit_image: string;
  circuit_short_name: string;
};

// EXCEPTION: Cancelled meetings for 2026 season
export function getChampionshipRaces(meetings: Meeting[]) {
  return meetings
    .filter((m) => m.meeting_name !== "Pre-Season Testing")
    .filter((m) => m.meeting_name !== "Saudi Arabian Grand Prix")
    .filter((m) => m.meeting_name !== "Bahrain Grand Prix");
}