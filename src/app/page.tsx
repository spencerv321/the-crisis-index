import CrisisIndex from "@/components/CrisisIndex";
import { getLenses, getShockEvents } from "@/lib/data";
import { getLastRefreshTime } from "@/lib/metric-feeds";
import { LENSES, SHOCK_EVENTS } from "@/data/lenses";

export const dynamic = "force-dynamic";

export default async function Home() {
  let lenses;
  let shockEvents;
  let lastRefresh: string | null = null;

  try {
    lenses = await getLenses();
  } catch {
    lenses = LENSES;
  }

  try {
    shockEvents = await getShockEvents();
  } catch {
    shockEvents = SHOCK_EVENTS;
  }

  try {
    lastRefresh = await getLastRefreshTime();
  } catch {
    // ignore — just won't show timestamp
  }

  return (
    <CrisisIndex
      lenses={lenses}
      shockEvents={shockEvents}
      lastRefresh={lastRefresh}
    />
  );
}
