/**
 * Reylo AI — engine fleet registry.
 *
 * Every entry is a public, free, anonymous-access Gradio Space exposing a
 * video-generation endpoint. Engines belong to a model FAMILY (wan / h3 / ltx);
 * the visitor picks a family in the UI and the app rotates through that
 * family's engines client-side: when one pool's free quota (or patience) runs
 * out, the next engine takes over transparently. Entries are validated by the
 * CI probes (tools/probe_fleet.py, tools/probe_h3.py).
 *
 * No keys, no accounts, no backend: each visitor's browser talks to the
 * engines directly, so each visitor spends *their own* free quota on
 * *each* engine — the fleet multiplies the free allowance per person.
 */

/** What each model family offers, for the UI picker. */
export const MODEL_INFO = {
  wan: {
    name: "Wan 2.2 Fast",
    blurb: "image → video · 832×480 · 16 fps · ~4–10s renders",
    fps: 16,
    audio: false,
    needsImage: true,
  },
  h3: {
    name: "MiniMax-H3 Turbo",
    blurb: "video + synchronized stereo audio · renders take a few minutes · image optional",
    fps: 24,
    audio: true,
    needsImage: false,
  },
  ltx: {
    name: "LTX Turbo",
    blurb: "fast distilled renders · image optional",
    fps: 24,
    audio: false,
    needsImage: false,
  },
};

export const ENGINES = [
  {
    id: "wan-fast-a",
    host: "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space",
    label: "Wan 2.2 14B Fast · pool A",
    family: "wan",
    fps: 16,
    audio: false,
  },
  // ── validated by tools/probe_fleet.py (I2V endpoint + anonymous access) ──
  {
    id: "wan-fast-b",
    host: "https://upsampler-wan-2-2-14b-image-to-video.hf.space",
    label: "Wan 2.2 14B · pool B",
    family: "wan",
    fps: 16,
    audio: false,
  },
  {
    id: "wan-fast-c",
    host: "https://tinchote-wan-2-2-14b-image-to-video.hf.space",
    label: "Wan 2.2 14B · pool C",
    family: "wan",
    fps: 16,
    audio: false,
  },
  // ── MiniMax-H3 Turbo family (video+audio) — validated by tools/probe_h3.py ──
  {
    id: "h3-akhaliq",
    host: "https://akhaliq-minimax-h3-turbo-lora.hf.space",
    label: "MiniMax-H3 Turbo · pool A",
    family: "h3",
    fps: 24,
    audio: true, // probe run 38153970761: GEN OK 42.9s, CORS ✓
  },
  {
    id: "h3-official",
    host: "https://minimaxai-minimax-h3-turbo-lora.hf.space",
    label: "MiniMax-H3 Turbo · official",
    family: "h3",
    fps: 24,
    audio: true,
  },
  {
    id: "h3-abidlabs",
    host: "https://abidlabs-minimax-h3-turbo-lora.hf.space",
    label: "MiniMax-H3 Turbo · pool B",
    family: "h3",
    fps: 24,
    audio: true,
  },
  {
    id: "h3-world-action",
    host: "https://hugging-apps-h3-world-action-demo.hf.space",
    label: "MiniMax-H3 world-action",
    family: "h3",
    fps: 24,
    audio: true,
  },
  // ── LTX family (fast distilled renders) — validated by tools/probe_h3.py ──
  {
    id: "ltx-deeprat",
    host: "https://deeprat-ltx-video-zerogpu-optimized.hf.space",
    label: "LTX-Video ZeroGPU",
    family: "ltx",
    fps: 24,
    audio: false,
  },
  {
    id: "ltx-bbox",
    host: "https://yuvraj108c-ltx25-bbox-control-demo.hf.space",
    label: "LTX-2.5 studio",
    family: "ltx",
    fps: 24,
    audio: false,
  },
  // ── non-ZeroGPU members (no platform quota) ─────────────────────────────
  {
    id: "wan-openking-cpu",
    host: "https://openking-wan2-video-generation.hf.space",
    label: "Wan2 · slow CPU pool (no quota)",
    family: "wan",
    fps: 16,
    audio: false, // hw=cpu-basic: immune to ZeroGPU quota, but renders take many minutes
  },
];

/** How long an engine stays parked after a failure kind (ms). */
export const BLOCK_TTL = {
  quota: 55 * 60 * 1000,
  auth: 55 * 60 * 1000,
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
