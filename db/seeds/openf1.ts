const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 350;
const MIN_REQUEST_INTERVAL_MS = 120;

let nextAllowedRequestAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfterMs(value: string | null) {
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;

  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(date - Date.now(), 0);

  return null;
}

export async function openF1Fetch<T>(endpoint: string): Promise<T> {
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const now = Date.now();
    if (now < nextAllowedRequestAt) {
      await sleep(nextAllowedRequestAt - now);
    }

    const res = await fetch(`${OPENF1_BASE_URL}${endpoint}`);
    nextAllowedRequestAt = Date.now() + MIN_REQUEST_INTERVAL_MS;

    if (res.ok) {
      return (await res.json()) as T;
    }

    const retriable = res.status === 429 || res.status >= 500;
    const canRetry = attempt < MAX_RETRIES;

    if (retriable && canRetry) {
      const waitMs = retryAfterMs(res.headers.get("retry-after")) ?? BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(waitMs);
      attempt += 1;
      continue;
    }

    const body = await res.text().catch(() => "");
    throw new Error(`OpenF1 request failed (${res.status}) for ${endpoint}: ${body}`);
  }

  throw new Error(`OpenF1 request failed after retries for ${endpoint}`);
}
