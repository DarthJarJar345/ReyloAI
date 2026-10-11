/**
 * Reylo AI Video Generator — application logic.
 * 100% client-side: the browser talks straight to the Hugging Face Space
 * (Wan 2.2 14B Fast, ZeroGPU). No backend, no keys, no cost.
 */

import {
  GradioSpaceClient,
  SpaceError,
  fileDataFromDataUrl,
  newSessionHash,
} from "./gradio-client.js";
import {
  ENGINES,
  MODEL_INFO,
  BLOCK_TTL,
  loadBlocked,
  saveBlocked,
  lastGoodEngine,
  setLastGoodEngine,
} from "./engines.js";
import {
  addToGallery,
  listGallery,
  removeFromGallery,
  clearGallery,
  galleryUsage,
} from "./db.js";

/* ---------------------------------------------------------------- config */

const SPACE_HOST = "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space";
const ENDPOINT = "/generate_video";
const TOKEN_KEY = "reylo.hfToken";

const DEFAULT_NEGATIVE =
  "色调艳丽, 过曝, 静态, 细节模糊不清, 字幕, 风格, 作品, 画作, 画面, 静止, 整体发灰, 最差质量, 低质量, JPEG压缩残留, 丑陋的, 残缺的, 多余的手指, 画得不好的手部, 画得不好的脸部, 畸形的, 毁容的, 形态畸形的肢体, 手指融合, 静止不动的画面, 杂乱的背景, 三条腿, 背景人很多, 倒着走";

const SAMPLES = [
  {
    file: "dune-wanderer.jpg",
    label: "Dune wanderer",
    prompt:
      "The cloaked wanderer walks forward across the dunes, cloak and sand streaming in the wind, heat haze shimmering, slow cinematic push-in",
  },
  {
    file: "neon-alley.jpg",
    label: "Neon alley",
    prompt:
      "Rain keeps falling in the neon alley, puddle reflections rippling, steam drifting, signs flickering, subtle handheld camera drift",
  },
  {
    file: "storm-portrait.jpg",
    label: "Storm portrait",
    prompt:
      "Her hair and wrap blow in a rising wind, storm clouds roll behind her, dramatic rim light, gentle parallax camera move",
  },
  {
    file: "derelict.jpg",
    label: "Derelict ship",
    prompt:
      "Snow falls softly around the buried starship wreck, clouds slide between the two moons, explorers trudge forward leaving footprints",
  },
];

const MOTION_CHIPS = [
  "slow cinematic dolly-in",
  "camera slowly orbits the subject",
  "hair and fabric blown by wind",
  "dust motes drifting in the light",
  "timelapse clouds racing",
  "gentle handheld sway",
  "rain falling, ripples spreading",
  "epic slow-motion",
];

const SURPRISE_PROMPTS = [
  "Aurora waves ripple across the night sky while snow drifts over silent pines",
  "Embers rise from a campfire as the camera glides low over mossy ground",
  "Ocean swell rolls toward the shore, foam collapsing in slow motion",
  "Curtains breathe in an open window, sunlight shifting across the floor",
  "A flag snaps in strong wind against a clearing storm sky",
  "Leaves swirl in an autumn gust down an empty cobblestone street",
];

/* ------------------------------------------------------------------ dom */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const el = {
  dropzone: $("#dropzone"),
  dropInput: $("#file-input"),
  preview: $("#preview"),
  previewImg: $("#preview-img"),
  previewMeta: $("#preview-meta"),
  samples: $("#samples"),
  prompt: $("#prompt"),
  promptCount: $("#prompt-count"),
  chips: $("#chips"),
  surprise: $("#surprise"),
  advanced: $("#advanced"),
  duration: $("#duration"),
  durationOut: $("#duration-out"),
  steps: $("#steps"),
  stepsOut: $("#steps-out"),
  seed: $("#seed"),
  randomSeed: $("#random-seed"),
  negative: $("#negative"),
  guidance: $("#guidance"),
  guidanceOut: $("#guidance-out"),
  guidance2: $("#guidance2"),
  guidance2Out: $("#guidance2-out"),
  token: $("#hf-token"),
  tokenSave: $("#token-save"),
  tokenClear: $("#token-clear"),
  generate: $("#generate"),
  cancel: $("#cancel"),
  stage: $("#stage"),
  stageEmpty: $("#stage-empty"),
  stageBusy: $("#stage-busy"),
  stageError: $("#stage-error"),
  stageDone: $("#stage-done"),
  video: $("#video"),
  ring: $("#ring-circle"),
  statusMain: $("#status-main"),
  statusSub: $("#status-sub"),
  timer: $("#timer"),
  errorText: $("#error-text"),
  errorRetry: $("#error-retry"),
  seedBadge: $("#seed-badge"),
  engineBadge: $("#engine-badge"),
  quotaCountdown: $("#quota-countdown"),
  download: $("#download"),
  save: $("#save"),
  regen: $("#regen"),
  gallery: $("#gallery-grid"),
  galleryEmpty: $("#gallery-empty"),
  galleryClear: $("#gallery-clear"),
  galleryUsage: $("#gallery-usage"),
  statusPill: $("#engine-pill"),
  statusDot: $("#engine-dot"),
  modelPick: $("#model-pick"),
  modelNote: $("#model-note"),
  audioToggle: $("#audio-toggle"),
  toasts: $("#toasts"),
  modal: $("#modal"),
  modalVideo: $("#modal-video"),
  modalClose: $("#modal-close"),
  year: $("#year"),
};

/* ---------------------------------------------------------------- state */

const MODEL_KEY = "reylo.model";

const state = {
  image: null, // { blob, dataUrl, name, width, height }
  model: MODEL_INFO[localStorage.getItem(MODEL_KEY)] ? localStorage.getItem(MODEL_KEY) : "wan",
  generating: false,
  abort: null,
  session: newSessionHash(),
  last: null, // { blobUrl, blob, seed, prompt }
  startedAt: 0,
  timerId: null,
  progress: null, // 0..1
};

const client = new GradioSpaceClient(SPACE_HOST, {
  token: localStorage.getItem(TOKEN_KEY) || null,
});

/* ------------------------------------------------------- engine fleet */

const clients = new Map();
function getClient(host) {
  let c = clients.get(host);
  if (!c) {
    c = new GradioSpaceClient(host, {
      token: localStorage.getItem(TOKEN_KEY) || null,
    });
    clients.set(host, c);
  }
  return c;
}

let blocked = loadBlocked();
function markBlocked(host, kind) {
  const ttl = BLOCK_TTL[kind] || BLOCK_TTL.unknown;
  blocked[host] = { kind, until: Date.now() + ttl };
  saveBlocked(blocked);
}
function engineOrder(model = state.model) {
  const list = ENGINES.filter((e) => (e.family || "wan") === model);
  if (!list.length) return [];
  const last = lastGoodEngine();
  if (last) {
    const i = list.findIndex((e) => e.host === last);
    if (i > 0) list.unshift(list.splice(i, 1)[0]);
  }
  const open = list.filter((e) => !blocked[e.host]);
  if (open.length) return open;
  // every engine of this family is parked -> give the family a fresh chance
  for (const e of list) delete blocked[e.host];
  saveBlocked(blocked);
  return [...list];
}

/* ------------------------------------------------------- model families */

function familyAvailable(model) {
  return ENGINES.some((e) => (e.family || "wan") === model);
}

function setModel(model) {
  if (!MODEL_INFO[model]) model = "wan";
  state.model = model;
  try { localStorage.setItem(MODEL_KEY, model); } catch { /* noop */ }
  const info = MODEL_INFO[model];
  for (const btn of el.modelPick.querySelectorAll(".modelpick__opt")) {
    const active = btn.dataset.model === model;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-checked", String(active));
    btn.disabled = !familyAvailable(btn.dataset.model);
    if (btn.disabled && !btn.dataset.noteAdded) {
      btn.dataset.noteAdded = "1";
      const s = btn.querySelector("span");
      if (s) s.textContent += " · no free engines online yet";
    }
  }
  el.modelNote.textContent = familyAvailable(model)
    ? `${info.blurb}${info.needsImage ? "" : " — a prompt alone is enough; add a source frame for image-to-video."}`
    : `${info.name} engines are being validated by the site's CI probes — they join the fleet automatically.`;
  el.generate.disabled = state.generating || !familyAvailable(model);
}
function setEngineBadge(text) {
  if (el.engineBadge) el.engineBadge.textContent = text;
}

/* ---------------------------------------------------------------- toast */

function toast(message, { kind = "info", timeout = 5200 } = {}) {
  const node = document.createElement("div");
  node.className = `toast toast--${kind}`;
  node.setAttribute("role", "status");
  node.innerHTML = `<span class="toast__dot"></span><div></div>`;
  node.lastElementChild.textContent = message;
  el.toasts.appendChild(node);
  requestAnimationFrame(() => node.classList.add("toast--in"));
  setTimeout(() => {
    node.classList.remove("toast--in");
    setTimeout(() => node.remove(), 350);
  }, timeout);
}

/* ------------------------------------------------------------ starfield */

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let w = 0;
  let h = 0;
  let raf = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(190, Math.floor((w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 0.85 + 0.15,
      r: Math.random() * 1.3 + 0.25,
      tw: Math.random() * Math.PI * 2,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.y += s.z * 0.06;
      if (s.y > h + 2) s.y = -2;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t / (1400 / s.z)));
      ctx.globalAlpha = a * s.z;
      ctx.fillStyle = s.z > 0.75 ? "#dfe9ff" : "#8fa3c8";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  resize();
  addEventListener("resize", resize);
  if (!reduce) raf = requestAnimationFrame(frame);
  else frame(0);
}

/* --------------------------------------------------------- image handling */

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

/** Downscale to a max long edge so payloads stay tiny (engine resizes anyway). */
async function normalizeImage(blob, maxEdge = 832) {
  const bmp = await createImageBitmap(blob).catch(async () => {
    const url = URL.createObjectURL(blob);
    try {
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
  });
  const iw = bmp.width;
  const ih = bmp.height;
  const scale = Math.min(1, maxEdge / Math.max(iw, ih));
  const w = Math.max(64, Math.round(iw * scale));
  const h = Math.max(64, Math.round(ih * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0, w, h);
  if (bmp.close) bmp.close();
  const out = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  return { blob: out, width: w, height: h };
}

async function setImageFromBlob(blob, name) {
  if (!blob || !blob.type.startsWith("image/")) {
    toast("That file isn't an image. Drop a JPG / PNG / WebP.", { kind: "error" });
    return;
  }
  try {
    const norm = await normalizeImage(blob);
    const dataUrl = await blobToDataUrl(norm.blob);
    state.image = { blob: norm.blob, dataUrl, name: name || "image.jpg", ...norm };
    el.previewImg.src = dataUrl;
    el.previewMeta.textContent = `${norm.width}×${norm.height} · ${(norm.blob.size / 1024).toFixed(0)} KB · ${name || "image.jpg"}`;
    el.dropzone.classList.add("dropzone--filled");
    el.preview.hidden = false;
    el.dropzone.querySelector(".dropzone__inner").hidden = true;
  } catch (err) {
    toast(`Couldn't read that image: ${err.message || err}`, { kind: "error" });
  }
}

function initImageInputs() {
  el.dropzone.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    el.dropInput.click();
  });
  el.dropInput.addEventListener("change", () => {
    const f = el.dropInput.files?.[0];
    if (f) setImageFromBlob(f, f.name);
    el.dropInput.value = "";
  });
  for (const type of ["dragenter", "dragover"]) {
    el.dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      el.dropzone.classList.add("dropzone--over");
    });
  }
  for (const type of ["dragleave", "drop"]) {
    el.dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      el.dropzone.classList.remove("dropzone--over");
    });
  }
  el.dropzone.addEventListener("drop", (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (f) setImageFromBlob(f, f.name);
  });
  document.addEventListener("paste", (e) => {
    const item = Array.from(e.clipboardData?.items || []).find((i) =>
      i.type.startsWith("image/")
    );
    if (item) {
      const f = item.getAsFile();
      if (f) {
        setImageFromBlob(f, "pasted-image.jpg");
        toast("Image pasted from clipboard.", { kind: "success" });
      }
    }
  });
  $("#replace-image")?.addEventListener("click", () => el.dropInput.click());
  el.dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.dropInput.click();
    }
  });

  // samples
  el.samples.innerHTML = SAMPLES.map(
    (s, i) => `
    <button class="sample" data-i="${i}" type="button" title="${s.label}">
      <img src="assets/samples/${s.file}" alt="${s.label} sample image" loading="lazy">
      <span>${s.label}</span>
    </button>`
  ).join("");
  el.samples.addEventListener("click", async (e) => {
    const btn = e.target.closest(".sample");
    if (!btn) return;
    const sample = SAMPLES[Number(btn.dataset.i)];
    btn.classList.add("sample--loading");
    try {
      const res = await fetch(`assets/samples/${sample.file}`);
      const blob = await res.blob();
      await setImageFromBlob(blob, sample.file);
      el.prompt.value = sample.prompt;
      syncPromptCount();
      toast(`Loaded “${sample.label}” with a matching motion prompt.`, { kind: "success" });
    } catch {
      toast("Could not load the sample image.", { kind: "error" });
    } finally {
      btn.classList.remove("sample--loading");
    }
  });
}

/* ------------------------------------------------------------ prompt UI */

function syncPromptCount() {
  el.promptCount.textContent = `${el.prompt.value.length} chars`;
}

function initPrompt() {
  syncPromptCount();
  el.prompt.addEventListener("input", syncPromptCount);
  el.chips.innerHTML = MOTION_CHIPS.map(
    (c) => `<button type="button" class="chip" data-c="${c}">+ ${c}</button>`
  ).join("");
  el.chips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const phrase = chip.dataset.c;
    const cur = el.prompt.value.trim();
    el.prompt.value = cur ? `${cur.replace(/[,.\s]+$/, "")}, ${phrase}` : phrase;
    syncPromptCount();
    el.prompt.focus();
  });
  el.surprise.addEventListener("click", () => {
    el.prompt.value = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    syncPromptCount();
  });
}

/* -------------------------------------------------------- advanced panel */

function fmtSeconds(v) {
  return `${Number(v).toFixed(1)}s`;
}

function initAdvanced() {
  const bind = (input, out, fmt) => {
    const sync = () => (out.textContent = fmt(input.value));
    input.addEventListener("input", sync);
    sync();
  };
  bind(el.duration, el.durationOut, (v) => `${fmtSeconds(v)} · ${framesFor(v)} frames`);
  bind(el.steps, el.stepsOut, (v) => `${v} steps`);
  bind(el.guidance, el.guidanceOut, (v) => Number(v).toFixed(1));
  bind(el.guidance2, el.guidance2Out, (v) => Number(v).toFixed(1));

  el.randomSeed.addEventListener("change", () => {
    el.seed.disabled = el.randomSeed.checked;
  });
  el.seed.disabled = el.randomSeed.checked;

  el.token.value = localStorage.getItem(TOKEN_KEY) || "";
  el.tokenSave.addEventListener("click", () => {
    const v = el.token.value.trim();
    if (v) localStorage.setItem(TOKEN_KEY, v);
    else localStorage.removeItem(TOKEN_KEY);
    client.setToken(v);
    clients.forEach((c) => c.setToken(v));
    toast(v ? "Token saved locally (this browser only)." : "Token cleared.", {
      kind: "success",
    });
  });
  el.tokenClear.addEventListener("click", () => {
    el.token.value = "";
    localStorage.removeItem(TOKEN_KEY);
    client.setToken(null);
    toast("Token cleared.", { kind: "success" });
  });
}

function framesFor(seconds) {
  return Math.min(80, Math.max(8, Math.round(Number(seconds) * 16)));
}

/* -------------------------------------------------------------- stage UI */

function setStage(mode) {
  el.stageEmpty.hidden = mode !== "empty";
  el.stageBusy.hidden = mode !== "busy";
  el.stageError.hidden = mode !== "error";
  el.stageDone.hidden = mode !== "done";
  el.video.hidden = mode !== "done";
  el.stage.dataset.mode = mode;
  if (mode === "done") el.video.play().catch(() => {});
  else el.video.pause();
}

function setProgress(fraction) {
  state.progress = fraction;
  const C = 2 * Math.PI * 52;
  if (fraction == null) {
    el.ring.style.strokeDasharray = `${C * 0.25} ${C}`;
    el.ring.classList.add("ring--spin");
  } else {
    el.ring.classList.remove("ring--spin");
    const f = Math.max(0.02, Math.min(1, fraction));
    el.ring.style.strokeDasharray = `${C * f} ${C}`;
  }
}

function fmtClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function startTimer() {
  state.startedAt = Date.now();
  stopTimer();
  el.timer.textContent = "00:00";
  state.timerId = setInterval(() => {
    const t = Date.now() - state.startedAt;
    let label = fmtClock(t);
    if (state.progress && state.progress > 0.04) {
      const eta = t / state.progress - t;
      if (isFinite(eta) && eta > 0 && eta < 30 * 60 * 1000) label += ` · ~${fmtClock(eta)} left`;
    }
    el.timer.textContent = label;
  }, 500);
}

function stopTimer() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

const STATUS_TEXT = {
  submitting: ["Contacting the engine…", "waking ZeroGPU if it was asleep"],
  queued: ["Waiting for a free GPU…", "the free shared queue — hang tight"],
  processing: ["GPU acquired — model warming up…", "fp8 Wan 2.2 14B + Lightning LoRA"],
  progress: ["Denoising frames…", ""],
  log: ["Working…", ""],
  reconnecting: ["Reconnecting to the engine stream…", ""],
};

function onStatus(status, detail = {}) {
  if (!state.generating) return;
  if (status === "progress" && Array.isArray(detail.progress) && detail.progress.length) {
    const p = detail.progress[detail.progress.length - 1];
    if (p && p.length) {
      const frac = Math.min(1, (p.index ?? 0) / p.length);
      if (p.desc) {
        // phase 1: ZeroGPU allocation / model warm-up (≈ first 15% of the ring)
        setProgress(0.02 + 0.13 * frac);
        el.statusMain.textContent = `${p.desc}… ${Math.round(frac * 100)}%`;
        el.statusSub.textContent = "reserving the free GPU";
      } else {
        // phase 2: denoising steps
        setProgress(0.15 + 0.8 * frac);
        el.statusMain.textContent = `Denoising… ${Math.round(frac * 100)}%`;
        el.statusSub.textContent = `step ${p.index ?? 0} of ${p.length}`;
      }
      return;
    }
  }
  if (status === "queued" && detail.rank != null) {
    if (detail.rank > 0) {
      el.statusMain.textContent = `In queue — position ${detail.rank}`;
      el.statusSub.textContent = detail.eta
        ? `engine ETA ~${Math.round(detail.eta)}s · free shared ZeroGPU pool`
        : "free shared ZeroGPU pool";
    } else {
      el.statusMain.textContent = "GPU acquired — starting…";
      const info = MODEL_INFO[state.model] || MODEL_INFO.wan;
      el.statusSub.textContent =
        state.model === "wan"
          ? "loading fp8 Wan 2.2 14B + Lightning LoRA"
          : `loading ${info.name} weights`;
    }
    setProgress(0.02);
    return;
  }
  if (status === "log" && detail.log) {
    el.statusSub.textContent = String(detail.log).slice(0, 140);
    return;
  }
  const pair = STATUS_TEXT[status];
  if (pair) {
    el.statusMain.textContent = pair[0];
    if (pair[1]) el.statusSub.textContent = pair[1];
    if (status === "processing") setProgress(0.03);
    if (status === "queued") setProgress(null);
  }
}

/* ------------------------------------------------------------ generation */

function readSettings() {
  return {
    prompt: el.prompt.value.trim(),
    steps: Number(el.steps.value),
    negative: el.negative.value,
    duration: Number(el.duration.value),
    guidance: Number(el.guidance.value),
    guidance2: Number(el.guidance2.value),
    seed: Number(el.seed.value) || 0,
    randomize: el.randomSeed.checked,
  };
}

async function buildImageData() {
  // Primary: inline base64 (no upload round-trip). Payload stays < ~400 KB.
  return fileDataFromDataUrl(
    state.image.dataUrl,
    state.image.name,
    state.image.blob.size,
    state.image.blob.type || "image/jpeg"
  );
}

async function generate() {
  if (state.generating) return;
  const info = MODEL_INFO[state.model] || MODEL_INFO.wan;
  if (info.needsImage && !state.image) {
    toast("Pick or drop an image first — or tap a sample below the dropzone.", {
      kind: "error",
    });
    el.dropzone.classList.add("dropzone--shake");
    setTimeout(() => el.dropzone.classList.remove("dropzone--shake"), 500);
    return;
  }
  const s = readSettings();
  if (!s.prompt) {
    toast("Describe the motion you want (a prompt is required).", { kind: "error" });
    el.prompt.focus();
    return;
  }

  state.generating = true;
  state.abort = new AbortController();
  state.session = newSessionHash();
  el.generate.disabled = true;
  el.generate.classList.add("btn--busy");
  el.cancel.hidden = false;
  setStage("busy");
  setProgress(null);
  el.statusMain.textContent = "Contacting the engine…";
  el.statusSub.textContent = "waking ZeroGPU if it was asleep";
  startTimer();

  const imageData = state.image ? await buildImageData() : null;
  const order = engineOrder(state.model);
  if (!order.length) {
    state.generating = false;
    el.generate.disabled = false;
    el.cancel.hidden = true;
    toast(`${info.name} has no validated free engines yet — the CI probes add them automatically. Try Wan 2.2 Fast for now.`, { kind: "info", timeout: 9000 });
    setStage("empty");
    return;
  }
  const discMode = info.needsImage ? "i2v" : (imageData ? "auto" : "t2v");
  let result = null;
  let lastErr = null;
  let usedEngine = null;

  for (let ei = 0; ei < order.length && !result; ei += 1) {
    const engine = order[ei];
    const engClient = getClient(engine.host);
    setEngineBadge(`engine ${ei + 1}/${order.length} · ${engine.label}`);
    el.statusSub.textContent = engine.label;

    let discovery = null;
    try {
      discovery = await engClient.discoverVideo(discMode);
    } catch (err) {
      lastErr = err;
    }
    if (!discovery) {
      markBlocked(engine.host, "engine");
      continue;
    }
    let payload;
    try {
      payload = engClient.buildI2VPayload(
        discovery,
        {
          ...s,
          imageWidth: state.image ? state.image.width : null,
          imageHeight: state.image ? state.image.height : null,
        },
        imageData,
        framesFor,
        engine
      );
    } catch (err) {
      lastErr = err;
      markBlocked(engine.host, "engine");
      continue;
    }

    const ATTEMPTS_PER_ENGINE = 2;
    for (let attempt = 1; attempt <= ATTEMPTS_PER_ENGINE && !result; attempt += 1) {
      try {
        result = await engClient.predict({
          apiName: discovery.endpoint,
          fnIndex: discovery.fnIndex,
          data: payload,
          sessionHash: state.session,
          onStatus,
          signal: state.abort.signal,
        });
        usedEngine = engine;
      } catch (err) {
        lastErr = err;
        if (state.abort.signal.aborted) break;
        const kind = err instanceof SpaceError ? err.kind : "unknown";
        if (["quota", "auth", "engine", "http"].includes(kind)) {
          markBlocked(engine.host, kind); // park it, next engine takes over
          break;
        }
        // sleeping / network: one patient retry on the same engine
        if (attempt < ATTEMPTS_PER_ENGINE) {
          const wait = 5000 * attempt;
          el.statusMain.textContent = `Engine warming up — retrying in ${Math.round(wait / 1000)}s…`;
          setProgress(null);
          await new Promise((r) => setTimeout(r, wait));
          state.session = newSessionHash();
          continue;
        }
        markBlocked(engine.host, kind);
        break;
      }
    }

    if (!result && ei < order.length - 1 && !state.abort.signal.aborted) {
      toast(`“${engine.label}” is out of free runs right now — switching to the next engine in the fleet…`, {
        kind: "info",
      });
      el.statusMain.textContent = "Switching engine…";
      el.statusSub.textContent = "the fleet keeps your free generations flowing";
      setProgress(null);
      state.session = newSessionHash();
    }
  }

  stopTimer();
  state.generating = false;
  el.generate.disabled = false;
  el.generate.classList.remove("btn--busy");
  el.cancel.hidden = true;

  if (!result) {
    if (lastErr instanceof SpaceError && lastErr.kind === "cancelled") {
      setStage("empty");
      toast("Generation cancelled.", { kind: "info" });
      return;
    }
    let msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    if (lastErr instanceof SpaceError && lastErr.kind === "quota") {
      msg +=
        " Every engine in the fleet was parked for this browser. Free pools reset after a while — or paste your own free Hugging Face token under Advanced settings to use your personal quota.";
    }
    el.errorText.textContent = msg;
    setStage("error");
    if (lastErr instanceof SpaceError && lastErr.kind === "quota") startQuotaCountdown();
    toast(msg, { kind: "error", timeout: 11000 });
    return;
  }

  if (usedEngine) {
    setLastGoodEngine(usedEngine.host);
    setEngineBadge(`served by ${usedEngine.label}`);
  }
  await presentResult(result, s, usedEngine);
}

async function presentResult(result, settings, engine = null) {
  const host = engine?.host || SPACE_HOST;
  const data = Array.isArray(result.data) ? result.data : [result.data];
  let videoFile = null;
  let seed = null;
  for (const item of data) {
    if (item == null) continue;
    if (typeof item === "number" && seed === null) {
      seed = item;
      continue;
    }
    if (typeof item === "object" && (item.url || item.path)) {
      const ct = String(item.mime_type || "");
      const u = String(item.url || item.path || "");
      if (/video/.test(ct) || /\.(mp4|webm|mov)(\?|$)/i.test(u)) {
        if (!videoFile) videoFile = item;
      }
    }
  }
  let url =
    videoFile?.url ||
    (videoFile?.path
      ? `${host}/gradio_api/file=${String(videoFile.path).replace(/^\/+/, "")}`
      : null);
  if (!url) {
    el.errorText.textContent = "The engine returned an empty result. Please retry.";
    setStage("error");
    return;
  }
  if (url.startsWith("/")) url = host + url;

  el.statusMain.textContent = "Downloading your video…";
  setProgress(1);

  let blob = null;
  try {
    const res = await fetch(url);
    if (res.ok) blob = await res.blob();
  } catch {
    blob = null; // fall back to streaming straight from the engine
  }

  const blobUrl = blob ? URL.createObjectURL(blob) : url;
  el.video.src = blobUrl;
  el.video.poster = state.image?.dataUrl || "";
  el.video.muted = true;
  el.video.loop = true;
  const hasAudio = !!(engine && engine.audio);
  el.audioToggle.hidden = !hasAudio;
  el.audioToggle.textContent = "🔇 Enable sound";
  setStage("done");
  el.seedBadge.textContent = `seed ${seed ?? "—"}`;
  el.download.href = blobUrl;
  el.download.download = `reylo-${seed ?? Date.now()}.mp4`;
  state.last = { blobUrl, blob, seed, prompt: settings.prompt, settings, model: state.model };
  state.lastSavedId = false;
  toast(
    hasAudio
      ? "Your video is ready — with synchronized audio. Hit “Enable sound” to hear it."
      : "Your video is ready. The light side and the dark side, both in there.",
    { kind: "success" }
  );

  // auto-save to the local gallery
  try {
    const poster = await capturePoster(blobUrl);
    await addToGallery({
      blob: blob || (await fetch(url).then((r) => r.blob())),
      poster,
      prompt: settings.prompt,
      seed: seed ?? 0,
      durationSec: settings.duration,
      steps: settings.steps,
      model: state.model,
      engineLabel: engine?.label || null,
    });
    state.lastSavedId = true;
    await renderGallery();
  } catch (err) {
    console.warn("gallery save failed", err);
  }
}

let countdownId = null;
function startQuotaCountdown() {
  if (countdownId) clearInterval(countdownId);
  const quotaBlocks = Object.values(blocked).filter((b) => b.kind === "quota");
  const target = quotaBlocks.length
    ? Math.max(...quotaBlocks.map((b) => b.until))
    : Date.now() + 55 * 60 * 1000;
  el.quotaCountdown.hidden = false;
  const tick = () => {
    const left = target - Date.now();
    if (left <= 0) {
      clearInterval(countdownId);
      countdownId = null;
      blocked = {};
      saveBlocked(blocked);
      el.quotaCountdown.textContent =
        "The free pool should be open again — hit Try again!";
      return;
    }
    const m = Math.floor(left / 60000);
    const sec = Math.floor((left % 60000) / 1000);
    el.quotaCountdown.textContent =
      `free pool refills in ~${m}m ${String(sec).padStart(2, "0")}s — retry re-arms itself`;
  };
  tick();
  countdownId = setInterval(tick, 1000);
}

function capturePoster(videoUrl) {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.src = videoUrl;
    v.muted = true;
    v.playsInline = true;
    const seek = () => {
      try { v.currentTime = 0.4; } catch { resolve(null); }
    };
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });
    const fail = () => resolve(null);
    v.addEventListener("error", fail, { once: true });
    v.addEventListener(
      "seeked",
      () => {
        try {
          const c = document.createElement("canvas");
          c.width = v.videoWidth || 640;
          c.height = v.videoHeight || 360;
          c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
          c.toBlob((b) => resolve(b), "image/jpeg", 0.72);
        } catch {
          resolve(null);
        }
      },
      { once: true }
    );
    setTimeout(fail, 4000);
  });
}

/* ---------------------------------------------------------------- gallery */

async function renderGallery() {
  let items = [];
  try {
    items = await listGallery();
  } catch {
    items = [];
  }
  el.galleryEmpty.hidden = items.length > 0;
  el.gallery.innerHTML = items
    .map(
      (it) => `
      <article class="gcard" data-id="${it.id}">
        <button class="gcard__play" type="button" data-act="view" aria-label="Play video">
          ${it.poster ? `<img src="${URL.createObjectURL(it.poster)}" alt="" loading="lazy">` : `<div class="gcard__noposter"></div>`}
          <span class="gcard__icon">▶</span>
        </button>
        <div class="gcard__body">
          <p class="gcard__prompt" title="${it.prompt.replace(/"/g, "&quot;")}">${escapeHtml(it.prompt)}</p>
          <p class="gcard__meta">${new Date(it.createdAt).toLocaleString()} · seed ${it.seed} · ${(it.bytes / 1e6).toFixed(1)} MB</p>
          <div class="gcard__actions">
            <button type="button" data-act="download">Download</button>
            <button type="button" data-act="reuse">Reuse prompt</button>
            <button type="button" data-act="delete" class="gcard__del">Delete</button>
          </div>
        </div>
      </article>`
    )
    .join("");

  // stash blobs for actions
  el.gallery._items = new Map(items.map((i) => [i.id, i]));

  try {
    const u = await galleryUsage();
    el.galleryUsage.textContent = u.quota
      ? `${items.length} video${items.length === 1 ? "" : "s"} · ${(u.usage / 1e6).toFixed(1)} MB of browser storage`
      : `${items.length} video${items.length === 1 ? "" : "s"} saved in this browser`;
  } catch {
    el.galleryUsage.textContent = `${items.length} videos saved in this browser`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function initGallery() {
  el.gallery.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const card = btn.closest(".gcard");
    const item = el.gallery._items?.get(card.dataset.id);
    if (!item) return;
    const act = btn.dataset.act;
    if (act === "view") {
      el.modalVideo.src = URL.createObjectURL(item.blob);
      el.modal.hidden = false;
      document.body.classList.add("no-scroll");
      el.modalVideo.play().catch(() => {});
    } else if (act === "download") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(item.blob);
      a.download = `reylo-${item.seed}-${item.id.slice(0, 6)}.mp4`;
      a.click();
    } else if (act === "reuse") {
      el.prompt.value = item.prompt;
      syncPromptCount();
      $("#studio").scrollIntoView({ behavior: "smooth" });
      toast("Prompt restored — pick an image and generate.", { kind: "success" });
    } else if (act === "delete") {
      await removeFromGallery(item.id);
      await renderGallery();
      toast("Removed from your gallery.", { kind: "info" });
    }
  });
  el.galleryClear.addEventListener("click", async () => {
    if (!confirm("Delete every video stored in this browser?")) return;
    await clearGallery();
    await renderGallery();
    toast("Gallery cleared.", { kind: "info" });
  });
  el.modalClose.addEventListener("click", closeModal);
  el.modal.addEventListener("click", (e) => {
    if (e.target === el.modal) closeModal();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.modal.hidden) closeModal();
  });
}

function closeModal() {
  el.modalVideo.pause();
  el.modalVideo.removeAttribute("src");
  el.modal.hidden = true;
  document.body.classList.remove("no-scroll");
}

/* ---------------------------------------------------------- engine pill */

async function pollEngine() {
  const set = (cls, label) => {
    el.statusPill.dataset.state = cls;
    el.statusDot.className = `dot dot--${cls}`;
    el.statusPill.querySelector("span:last-child").textContent = label;
  };
  try {
    await client.config();
    set("ok", "Engine ready");
  } catch (err) {
    if (err instanceof SpaceError && err.kind === "sleeping") set("warm", "Engine waking");
    else set("warn", "Engine offline");
  }
}

/* ----------------------------------------------------------------- init */

function initMisc() {
  // model family picker
  for (const btn of el.modelPick.querySelectorAll(".modelpick__opt")) {
    btn.addEventListener("click", () => {
      if (state.generating) return;
      setModel(btn.dataset.model);
    });
  }
  setModel(state.model);

  // audio toggle for clips from audio-capable engines (H3 / LTX)
  el.audioToggle.addEventListener("click", () => {
    el.video.muted = !el.video.muted;
    el.audioToggle.textContent = el.video.muted ? "🔇 Enable sound" : "🔊 Sound on";
    if (!el.video.muted) el.video.play().catch(() => {});
  });

  el.generate.addEventListener("click", generate);
  el.cancel.addEventListener("click", () => state.abort?.abort());
  el.errorRetry.addEventListener("click", generate);
  for (const node of [el.download, el.save, el.regen]) {
    node.addEventListener(
      "click",
      (e) => {
        if (!state.last) {
          e.preventDefault();
          toast("Generate a video first — the controls unlock afterwards.", { kind: "info" });
        }
      },
      { capture: true }
    );
  }
  el.regen.addEventListener("click", () => {
    el.randomSeed.checked = true;
    el.seed.disabled = true;
    generate();
  });
  el.save.addEventListener("click", async () => {
    if (!state.last) return;
    if (state.lastSavedId) {
      toast("This take is already in your gallery below.", { kind: "info" });
      $("#gallery").scrollIntoView({ behavior: "smooth" });
      return;
    }
    try {
      const poster = await capturePoster(state.last.blobUrl);
      await addToGallery({
        blob: state.last.blob || (await fetch(state.last.blobUrl).then((r) => r.blob())),
        poster,
        prompt: state.last.prompt,
        seed: state.last.seed ?? 0,
        durationSec: state.last.settings.duration,
        steps: state.last.settings.steps,
        model: state.last.model || state.model,
      });
      state.lastSavedId = true;
      await renderGallery();
      toast("Saved to your gallery (this browser only).", { kind: "success" });
    } catch {
      toast("Could not save to gallery.", { kind: "error" });
    }
  });
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });
  el.year.textContent = String(new Date().getFullYear());

  // smooth anchor scroll
  for (const a of $$('a[href^="#"]')) {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

async function boot() {
  el.negative.value = DEFAULT_NEGATIVE;
  initStarfield();
  initImageInputs();
  initPrompt();
  initAdvanced();
  initGallery();
  initMisc();
  setStage("empty");
  await renderGallery();
  pollEngine();
  setInterval(pollEngine, 45000);
  // preload first sample silently so Generate works instantly
  try {
    const res = await fetch(`assets/samples/${SAMPLES[0].file}`);
    await setImageFromBlob(await res.blob(), SAMPLES[0].file);
    el.prompt.value = SAMPLES[0].prompt;
    syncPromptCount();
  } catch {
    /* offline preview: fine */
  }
}

boot();
