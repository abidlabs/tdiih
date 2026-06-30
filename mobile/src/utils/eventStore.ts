import * as FileSystem from "expo-file-system/legacy";
import { REMOTE_EVENTS_URL, REMOTE_FETCH_TIMEOUT_MS } from "@/config";
import bundled from "@/data/events.json";

export interface IslamicEvent {
  title: string;
  year_ah?: number | null;
  year_ce?: number | null;
  summary: string;
  image: string;
  credit?: string;
  credit_url?: string;
}

export interface EventsDataset {
  version: number;
  /** Keyed by Hijri "month-day", e.g. "4-1". Each key maps to >=1 event. */
  events: Record<string, IslamicEvent[]>;
}

const CACHE_FILE = FileSystem.cacheDirectory + "events.json";

function isValidDataset(d: unknown): d is EventsDataset {
  if (!d || typeof d !== "object") return false;
  const obj = d as Record<string, unknown>;
  return typeof obj.version === "number" && typeof obj.events === "object" && obj.events !== null;
}

/** Read the cached remote copy from disk, if any and valid. */
async function readCache(): Promise<EventsDataset | null> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_FILE);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(CACHE_FILE);
    const parsed = JSON.parse(raw);
    return isValidDataset(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeCache(data: EventsDataset): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(CACHE_FILE, JSON.stringify(data));
  } catch {
    // Best-effort; ignore write failures.
  }
}

async function fetchRemote(): Promise<EventsDataset | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS);
    const res = await fetch(REMOTE_EVENTS_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const parsed = await res.json();
    return isValidDataset(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const bundledDataset = bundled as EventsDataset;

/**
 * Returns the best dataset available *right now*, synchronously: the cached
 * remote copy if it is newer than the bundled one, else the bundled copy.
 * Cheap enough to call before the async sync resolves.
 */
let inMemory: EventsDataset = bundledDataset;

export function getEventsSync(): EventsDataset {
  return inMemory;
}

/**
 * Load order:
 *   1. Pick max(version) of {bundled, cached} as the immediate dataset.
 *   2. Fetch remote in the background; if newer, cache it and adopt it.
 * Never throws — every failure path falls back to what we already have.
 */
export async function syncEvents(): Promise<EventsDataset> {
  const cached = await readCache();
  if (cached && cached.version > inMemory.version) {
    inMemory = cached;
  }

  const remote = await fetchRemote();
  if (remote && remote.version > inMemory.version) {
    inMemory = remote;
    void writeCache(remote);
  }
  return inMemory;
}

/** Look up events for a given Hijri month-day key. */
export function eventsForKey(data: EventsDataset, key: string): IslamicEvent[] {
  return data.events[key] ?? [];
}
