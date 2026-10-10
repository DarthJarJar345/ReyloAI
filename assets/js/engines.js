/**
 * Reylo AI — engine fleet registry.
 *
 * Every entry is a public, free, anonymous-access Gradio Space exposing an
 * image->video endpoint. The app rotates through them client-side: when one
 * pool's free quota (or patience) runs out for a visitor, the next engine
 * takes over transparently. Entries are validated by tools/probe_fleet.py.
 *
 * No keys, no accounts, no backend: each visitor's browser talks to the
 * engines directly, so each visitor spends *their own* free quota on
 * *each* engine — the fleet multiplies the free allowance per person.
 */

export const ENGINES = [
  {
    id: "wan-fast-a",
    host: "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space",
    label: "Wan 2.2 14B Fast · pool A",
  },
  // ── validated alternates (filled from the fleet probe report) ─────────
];

/** How long an engine stays parked after a failure kind (ms). */
export const BLOCK_TTL = {
  quota: 40 * 60 * 1000,
  auth: 40 * 60 * 1000,
  engine: 6 * 60 * 1000,
  http: 6 * 60 * 1000,
  network: 90 * 1000,
  sleeping: 60 * 1000,
  unknown: 5 * 60 * 1000,
};

const LS_KEY = "reylo.blockedEngines";
const LS_LAST = "reylo.lastGoodEngine";

export function loadBlocked() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    const now = Date.now();
    const out = {};
    for (const [host, v] of Object.entries(raw)) {
      if (v && v.until > now) out[host] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveBlocked(map) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch { /* private mode etc. */ }
}

export function lastGoodEngine() {
  try {
    return localStorage.getItem(LS_LAST);
  } catch {
    return null;
  }
}

export function setLastGoodEngine(host) {
  try {
    localStorage.setItem(LS_LAST, host);
  } catch { /* noop */ }
}
