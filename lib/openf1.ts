const BASE_URL = "https://api.openf1.org/v1";

export async function openF1Fetch(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch OpenF1 data");
  }

  return res.json();
}