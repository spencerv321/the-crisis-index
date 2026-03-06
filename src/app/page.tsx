import CrisisIndex from "@/components/CrisisIndex";
import { getLenses, getShockEvents } from "@/lib/data";
import { LENSES, SHOCK_EVENTS } from "@/data/lenses";

export const dynamic = "force-dynamic";

export default async function Home() {
  let lenses;
  let shockEvents;

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

  return <CrisisIndex lenses={lenses} shockEvents={shockEvents} />;
}
