/**
 * Remote content endpoint.
 *
 * The app ships with a bundled copy of `events.json` (see src/data/events.json)
 * so it always works offline. On launch it ALSO tries to fetch this URL; if the
 * remote `version` is newer than what is cached/bundled, the remote copy is
 * cached and used. Any failure (no network, parse error, 404) is swallowed and
 * the app falls back to the cached-or-bundled data.
 *
 * This points at the GitHub Pages site published from the repo's /docs folder.
 * Update the owner/repo below if you fork or rename.
 */
export const REMOTE_EVENTS_URL =
  "https://abidlabs.github.io/tdiih/events.json";

/** How long to wait for the remote fetch before giving up (ms). */
export const REMOTE_FETCH_TIMEOUT_MS = 6000;

/** Number of days to render on either side of today in the swipe pager. */
export const DAY_WINDOW = 366;
