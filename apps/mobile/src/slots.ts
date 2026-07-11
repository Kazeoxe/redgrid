import { get, set } from "idb-keyval";

const KEY = "redgrid:slots";
const DEFAULT_SLOTS: Slot[] = [
  { subs: ["aww"] },
  { subs: ["spacevideos"] },
  { subs: ["EarthPorn"] },
  { subs: ["oddlysatisfying"] },
  { subs: ["interestingasfuck"] },
  { subs: ["nature"] },
];

export interface Slot { subs: string[] }

export async function loadSlots(): Promise<Slot[]> {
  const stored = await get<Slot[]>(KEY);
  return stored?.length ? stored : DEFAULT_SLOTS;
}

export const saveSlots = (slots: Slot[]) => set(KEY, slots);
