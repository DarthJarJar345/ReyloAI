/**
 * Reylo AI — minimal, dependency-free Gradio Space client.
 *
 * Speaks the native Gradio 4/5 wire protocol (queue/join + SSE queue/data +
 * upload) directly from the browser, so the static site needs no backend at all.
 *
 * Handles:
 *  - Gradio 5 (`/gradio_api/...`) and Gradio 4 (`/api/...`, `/queue/...`) layouts
 *  - optional HF token (Authorization: Bearer) for users who want their own quota
 *  - SSE via fetch streaming (EventSource cannot send auth headers)
 *  - reconnects, heartbeats, cancellation, queue-position + progress events
 */

export class SpaceError extends Error {
  constructor(message, { kind = "error", http = null, detail = null } = {}) {
    super(message);
    this.name = "SpaceError";
    this.kind = kind; // quota | sleeping | network | http | protocol | cancelled
    this.http = http;
    this.detail = detail;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function looksLikeHtml(text) {
  return /<html[\s>]/i.test(text.slice(0, 400));
}

export class GradioSpaceClient {
  /**
   * @param {string} baseUrl e.g. https://xyz.hf.space
   * @param {{token?: string|null, fetch?: typeof fetch}} [opts]
   */
  constructor(baseUrl, opts = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.token = opts.token || null;
    this._fetch = opts.fetch || ((...a) => fetch(...a));
    this._configPromise = null;
    this.prefix = null; // resolved API prefix, e.g. "/gradio_api"
  }

  setToken(token) {
    this.token = token || null;
    this._configPromise = null;
  }

  headers(extra = {}) {
    const h = { Accept: "*/*", ...extra };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  }

  async _req(path, init = {}, timeoutMs = 120000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const signal = init.signal
      ? composeSignals(init.signal, ctrl.signal)
      : ctrl.signal;
    try {
      const res = await this._fetch(this.baseUrl + path, {
        ...init,
        signal,
        headers: this.headers(init.headers),
      });
      return res;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new SpaceError("The request timed out. The space may be cold-starting — try again.", {
          kind: "network",
        });
      }
      throw new SpaceError(
        "Could not reach the AI engine (network/CORS problem). Check your connection and retry.",
        { kind: "network", detail: String(err) }
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /** Resolve the API prefix and cache the space config. */
  async config(force = false) {
    if (this._configPromise && !force) return this._configPromise;
    this._configPromise = (async () => {
      const candidates = ["/gradio_api/config", "/config"];
      let lastErr = null;
      for (const path of candidates) {
        const res = await this._req(path, { method: "GET" }, 90000);
        if (res.ok) {
          const text = await res.text();
          if (looksLikeHtml(text)) {
            lastErr = new SpaceError("Engine returned HTML instead of JSON (space may be rebuilding).", {
              kind: "sleeping",
            });
            continue;
          }
          const cfg = JSON.parse(text);
          // Gradio >=5 publishes its real API prefix in the config itself.
          this.prefix =
            typeof cfg.api_prefix === "string" && cfg.api_prefix !== ""
              ? cfg.api_prefix.replace(/\/$/, "")
              : path === "/gradio_api/config"
                ? "/gradio_api"
                : "";
          cfg._resolved = {
            version: cfg.version || "unknown",
            deps: cfg.dependencies || [],
          };
          return cfg;
        }
        lastErr = new SpaceError(`Engine config request failed (HTTP ${res.status}).`, {
          kind: "http",
          http: res.status,
        });
      }
      throw lastErr || new SpaceError("Engine unreachable.", { kind: "network" });
    })();
    this._configPromise.catch(() => {
      this._configPromise = null;
    });
    return this._configPromise;
  }

  /** Find the fn_index for a named API endpoint, falling back to position. */
  async endpointIndex(apiName, fallbackIndex = 0) {
    const cfg = await this.config();
    const deps = cfg._resolved.deps;
    const norm = (s) => String(s || "").replace(/^\/+/, "");
    let idx = deps.findIndex((d) => norm(d.api_name) === norm(apiName));
    if (idx < 0) idx = deps.findIndex((d) => d.api_name === apiName);
    return idx >= 0 ? idx : fallbackIndex;
  }

  /**
   * Discover a video-generation endpoint of this space.
   * Strategy: /config (always present) -> components + dependencies + labels.
   * mode: "i2v" (image+video out), "t2v" (text-only in + video out),
   *       "auto" (prefer i2v, fall back to t2v).
   * Returns { endpoint, fnIndex, params:[{name,label,required,comp,def,min,max}] } or null.
   */
  async discoverVideo(mode = "i2v") {
    this._disc = this._disc || {};
    if (this._disc[mode] !== undefined) return this._disc[mode];
    this._disc[mode] = (async () => {
      const cfg = await this.config().catch(() => null);
      if (!cfg) return null;
      const comps = new Map();
      for (const c of cfg.components || []) {
        comps.set(c.id, c);
      }
      const deps = cfg._resolved?.deps || cfg.dependencies || [];
      let i2v = null;
      let t2v = null;
      for (let i = 0; i < deps.length; i += 1) {
        const d = deps[i];
        if (d.api_visibility && d.api_visibility !== "public") continue;
        if (d.queue === false) continue;
        const inputs = (d.inputs || []).map((id) => comps.get(id)).filter(Boolean);
        const outputs = (d.outputs || []).map((id) => comps.get(id)).filter(Boolean);
        const hasVid = outputs.some((c) => (c.type || "") === "video");
        if (!hasVid) continue;
        const hasImg = inputs.some((c) => (c.type || "") === "image");
        const hasTxt = inputs.some((c) => (c.type || "") === "textbox");
        if (!hasImg && !hasTxt) continue;
        const params = inputs.map((c) => ({
          name: c.props?.name || c.type || "",
          label: String(c.props?.label || c.props?.name || c.type || ""),
          comp: c.type,
          def: c.props?.value ?? null,
          min: c.props?.minimum ?? null,
          max: c.props?.maximum ?? null,
          required: true,
        }));
        const apiName = d.api_name ? `/${String(d.api_name).replace(/^\/+/, "")}` : null;
        const found = { endpoint: apiName || `/fn_${i}`, fnIndex: i, params };
        if (hasImg && !i2v) i2v = found;
        else if (!hasImg && hasTxt && !t2v) t2v = found;
      }
      if (mode === "t2v") return t2v;
      if (mode === "i2v") return i2v;
      return i2v || t2v; // auto
    })();
    this._disc[mode].catch(() => {
      this._disc[mode] = undefined;
    });
    return this._disc[mode];
  }

  /** Back-compat alias. */
  discoverI2V() {
    return this.discoverVideo("i2v");
  }

  /**
   * Build a positional payload for a video endpoint from UI settings.
   * Maps parameters by name OR UI label keywords, so any Gradio video
   * space (Wan, MiniMax-H3, LTX, …) can join the fleet without adapters.
   * Numeric values are clamped to the engine's own slider range.
   */
  buildI2VPayload(discovery, settings, imageFileData, framesFor, engine = null) {
    const out = [];
    let imageUsed = false;
    const fps = (engine && engine.fps) || 16;
    const clamp = (p, v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return p.def ?? null;
      if (p.min !== null && p.min !== undefined && n < Number(p.min)) return Number(p.min);
      if (p.max !== null && p.max !== undefined && n > Number(p.max)) return Number(p.max);
      return n;
    };
    for (const p of discovery.params) {
      const key = `${p.name} ${p.label}`.toLowerCase();
      if (p.comp === "image") {
        // first image input = source frame; extra ones (end/mask/ref) stay default
        if (!imageUsed && imageFileData) {
          imageUsed = true;
          out.push(imageFileData);
        } else {
          out.push(p.def ?? null);
        }
        continue;
      }
      if (/negative/.test(key)) out.push(settings.negative);
      else if (p.comp === "checkbox" && /random|seed/.test(key)) out.push(settings.randomize);
      else if (/seed/.test(key) && (p.comp === "number" || p.comp === "slider")) {
        out.push(clamp(p, settings.seed));
      }
      else if (/random/.test(key)) out.push(settings.randomize);
      else if (/step/.test(key)) out.push(clamp(p, settings.steps));
      else if (/audio/.test(key) && p.comp === "checkbox") out.push(p.def ?? true);
      else if (/duration|second|\(s\)/.test(key)) out.push(clamp(p, settings.duration));
      else if (/frames?/.test(key) && !/input|use from|reference/.test(key)) {
        out.push(clamp(p, Math.round(settings.duration * fps)));
      }
      else if (/(guidance|cfg).*(2|low)/.test(key)) out.push(clamp(p, settings.guidance2));
      else if (/guidance|cfg|scale/.test(key)) out.push(clamp(p, settings.guidance));
      else if (/prompt|descri|caption|scene/.test(key) && p.comp === "textbox") out.push(settings.prompt);
      else if (/width|height|resolution|aspect|fps|frame rate|scheduler|lora|strength|denois|motion|bucket|style/.test(key)) {
        out.push(p.def ?? null); // respect the engine's own tuning for exotic inputs
      } else if (p.def !== null && p.def !== undefined) {
        out.push(p.def); // honour the engine's own default for anything else
      } else if (p.comp === "textbox") {
        out.push(""); // empty text is a sane no-op for optional textboxes (LoRA, canvas…)
      } else if (["image", "audio", "video", "file"].includes(p.comp)) {
        out.push(null); // optional media inputs stay empty
      } else {
        if (p.required) {
          throw new SpaceError(`Engine needs unsupported input "${p.label || p.name}".`, {
            kind: "engine",
          });
        }
        out.push(null);
      }
    }
    return out;
  }

  /**
   * Upload a browser File/Blob to the space and return FileData for payloads.
   * @param {Blob} blob
   * @param {string} filename
   */
  async upload(blob, filename) {
    await this.config();
    const uploadId = cryptoRandomId();
    const form = new FormData();
    form.append("files", blob, filename);
    const res = await this._req(
      `${this.prefix || ""}/upload?upload_id=${uploadId}`,
      { method: "POST", body: form },
      180000
    );
    if (!res.ok) {
      const text = await safeText(res);
      throw new SpaceError(`Upload failed (HTTP ${res.status}): ${text.slice(0, 200)}`, {
        kind: "http",
        http: res.status,
        detail: text,
      });
    }
    const paths = await res.json();
    const serverPath = Array.isArray(paths) ? paths[0] : paths;
    return fileData(serverPath, filename, blob.size, blob.type);
  }

  /**
   * Submit a prediction and stream its events.
   *
   * @param {object} opts
   * @param {string} opts.apiName      e.g. "/generate_video"
   * @param {Array}  opts.data         positional payload
   * @param {string} opts.sessionHash
   * @param {(ev:object)=>void} [opts.onEvent]  receives every queue event
   * @param {AbortSignal} [opts.signal]        abort = cancel generation
   * @param {(state:string, detail?:object)=>void} [opts.onStatus]
   * @returns {Promise<{data:Array, seed?:number, raw:object}>}
   */
  async predict({ apiName, data, sessionHash, onEvent, onStatus, signal, fnIndex: fnOverride }) {
    await this.config();
    const fnIndex = fnOverride ?? (await this.endpointIndex(apiName, 0));
    const eventId = cryptoRandomId();
    const status = (s, d) => onStatus && onStatus(s, d);

    status("submitting");
    const joinRes = await this._req(
      `${this.prefix}/queue/join`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          event_data: null,
          fn_index: fnIndex,
          endpoint: apiName,
          trigger_id: null,
          session_hash: sessionHash,
          simple_format: false,
        }),
      },
      120000
    );

    if (!joinRes.ok) {
      const text = await safeText(joinRes);
      throw classifyHttp(joinRes.status, text);
    }
    const joinBody = await joinRes.json().catch(() => ({}));
    if (joinBody && joinBody.success === false) {
      throw classifyHttp(503, JSON.stringify(joinBody));
    }

    status("queued");
    const heartbeat = this._openHeartbeat(sessionHash, signal);
    try {
      return await this._listen({
      sessionHash,
      eventId: joinBody.event_id || eventId,
        onEvent,
        onStatus: status,
        signal,
      });
    } finally {
      heartbeat.stop();
    }
  }

  /**
   * Gradio keeps sessions alive with a long-lived GET heartbeat stream.
   * Fire-and-forget: we just hold the connection open.
   */
  _openHeartbeat(sessionHash, signal) {
    let stopped = false;
    let ctrl = null;
    const run = async () => {
      const cfg = await this.config().catch(() => null);
      if (!cfg || !cfg.connect_heartbeat || stopped) return;
      ctrl = new AbortController();
      const onAbort = () => ctrl.abort();
      signal?.addEventListener("abort", onAbort);
      try {
        const res = await this._fetch(
          `${this.baseUrl}${this.prefix}/heartbeat/${sessionHash}`,
          { headers: this.headers({ Accept: "text/event-stream" }), signal: ctrl.signal }
        );
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        while (!stopped) {
          const { done } = await reader.read();
          if (done) break;
        }
      } catch {
        /* heartbeat is best-effort */
      } finally {
        signal?.removeEventListener("abort", onAbort);
      }
    };
    run();
    return {
      stop() {
        stopped = true;
        try {
          ctrl?.abort();
        } catch { /* noop */ }
      },
    };
  }

  /** Listen to the SSE event stream until process_completed / error / abort. */
  async _listen({ sessionHash, eventId, onEvent, onStatus, signal }) {
    let attempts = 0;
    const deadline = Date.now() + 25 * 60 * 1000; // hard cap: 25 min
    while (attempts < 8 && Date.now() < deadline) {
      attempts += 1;
      let res;
      try {
        res = await this._req(
          `${this.prefix}/queue/data?session_hash=${encodeURIComponent(sessionHash)}`,
          { method: "GET", headers: { Accept: "text/event-stream" }, signal },
          10 * 60 * 1000
        );
      } catch (err) {
        if (signal?.aborted) throw new SpaceError("Cancelled.", { kind: "cancelled" });
        if (err instanceof SpaceError && err.kind === "network") {
          await sleep(1500 * attempts);
          continue;
        }
        throw err;
      }
      if (!res.ok) {
        const text = await safeText(res);
        if (res.status >= 500 && attempts < 8) {
          await sleep(1500 * attempts);
          continue;
        }
        throw classifyHttp(res.status, text);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let currentEvent = "message";

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let sep;
          while ((sep = findEventBoundary(buf)) !== -1) {
            const rawEvent = buf.slice(0, sep);
            buf = buf.slice(sep).replace(/^(\r?\n){2}/, "");
            const parsed = parseSSEBlock(rawEvent);
            if (!parsed) continue;
            if (parsed.event) currentEvent = parsed.event;
            if (parsed.data === null) continue;
            if (currentEvent === "heartbeat") {
              currentEvent = "message";
              continue;
            }
            let msg;
            try {
              msg = JSON.parse(parsed.data);
            } catch {
              continue;
            }
            currentEvent = "message";
            if (msg.event_id && msg.event_id !== eventId) continue; // other event's traffic
            if (onEvent) onEvent(msg);

            switch (msg.msg) {
              case "send_data":
                break;
              case "queue_full":
                throw new SpaceError(
                  "The engine's queue is full right now. Wait a minute and try again.",
                  { kind: "quota", detail: msg.output }
                );
              case "process_starts":
                onStatus("processing");
                break;
              case "estimation":
                onStatus("queued", {
                  rank: msg.rank,
                  queueSize: msg.queue_size,
                  eta: msg.rank_eta ?? msg.eta,
                });
                break;
              case "progress": // Gradio 6
                onStatus("progress", { progress: msg.progress_data });
                break;
              case "progress_data": // Gradio 4/5
                onStatus("progress", { progress: msg.output?.progress });
                break;
              case "log":
                onStatus("log", { log: msg.output?.log, level: msg.output?.level });
                break;
              case "process_generating":
              case "process_streaming":
                break;
              case "process_completed": {
                const out = msg.output || {};
                const data = out.data;
                const empty =
                  data === null ||
                  data === undefined ||
                  (Array.isArray(data) && data.length === 0);
                // Gradio 6 puts `success` on the message OR inside output.
                const successFlag = out.success ?? msg.success;
                if (successFlag === false || empty) {
                  const errText =
                    cleanErrorMessage(out.error) || cleanErrorMessage(msg.error);
                  const title = String(out.title || msg.title || "");
                  const quotaish =
                    /quota|limit|busy|too many|daily/i.test(errText + " " + title);
                  throw new SpaceError(
                    errText ||
                      (quotaish
                        ? "The free shared GPU pool is temporarily exhausted."
                        : "The engine finished without returning a video (transient ZeroGPU blip). An automatic retry usually succeeds."),
                    { kind: quotaish ? "quota" : "engine", detail: { out, title } }
                  );
                }
                return { data, raw: msg, event_id: msg.event_id };
              }
              case "unexpected_error":
                throw new SpaceError(
                  "The engine hit an unexpected error (it may be restarting). Please retry.",
                  { kind: "engine", detail: msg.output }
                );
              case "close_stream":
                // stream closed without completion -> reconnect loop handles it
                break;
              default:
                break;
            }
          }
        }
      } catch (err) {
        if (signal?.aborted) throw new SpaceError("Cancelled.", { kind: "cancelled" });
        if (err instanceof SpaceError) throw err;
        // network hiccup mid-stream: fall through to reconnect
      }
      // stream ended without completion — small backoff, then reconnect
      if (signal?.aborted) throw new SpaceError("Cancelled.", { kind: "cancelled" });
      onStatus("reconnecting");
      await sleep(1200 * attempts);
    }
    throw new SpaceError("Lost contact with the engine before the video finished. Please retry.", {
      kind: "network",
    });
  }
}

/* ------------------------------------------------------------------ utils */

export function cryptoRandomId(len = 12) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function newSessionHash() {
  return cryptoRandomId(10);
}

export function fileData(path, origName, size, mimeType) {
  return {
    path,
    url: null,
    orig_name: origName,
    size: size ?? null,
    mime_type: mimeType || null,
    is_stream: false,
    meta: { _type: "gradio.FileData" },
  };
}

/** FileData that embeds the image as a base64 data URL (no upload round-trip). */
export function fileDataFromDataUrl(dataUrl, origName, size, mimeType) {
  return {
    path: null,
    url: dataUrl,
    orig_name: origName,
    size: size ?? null,
    mime_type: mimeType || null,
    is_stream: false,
    meta: { _type: "gradio.FileData" },
  };
}

function findEventBoundary(buf) {
  const a = buf.indexOf("\n\n");
  const b = buf.indexOf("\r\n\r\n");
  if (a === -1) return b;
  if (b === -1) return a;
  return Math.min(a, b);
}

function parseSSEBlock(block) {
  let event = null;
  const dataLines = [];
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
  }
  if (!event && dataLines.length === 0) return null;
  return { event, data: dataLines.length ? dataLines.join("\n") : null };
}

async function safeText(res) {
  try {
    return (await res.text()).slice(0, 2000);
  } catch {
    return "";
  }
}

function cleanErrorMessage(raw) {
  if (!raw) return "";
  const s = String(raw);
  const m = s.match(/gr\.Error[:\s]*(.*)/i);
  return (m ? m[1] : s).slice(0, 400);
}

export function classifyHttp(status, text = "") {
  const lower = text.toLowerCase();
  if (status === 401 || status === 403) {
    if (lower.includes("quota") || lower.includes("limit")) {
      return new SpaceError(
        "The free shared GPU quota is temporarily exhausted. Wait a few minutes and retry — it always comes back.",
        { kind: "quota", http: status, detail: text }
      );
    }
    return new SpaceError(
      "The engine asked for authentication. You can add an optional free Hugging Face token in Advanced settings.",
      { kind: "auth", http: status, detail: text }
    );
  }
  if (status === 429) {
    return new SpaceError(
      "Rate limit hit on the free engine. Give it a minute — then press Generate again.",
      { kind: "quota", http: status, detail: text }
    );
  }
  if (status === 503 || lower.includes("sleeping") || lower.includes("restarting") || lower.includes("building")) {
    return new SpaceError("The engine is waking up (cold start). This takes ~1-2 minutes — retrying helps.", {
      kind: "sleeping",
      http: status,
      detail: text,
    });
  }
  return new SpaceError(`Engine request failed (HTTP ${status}).`, {
    kind: "http",
    http: status,
    detail: text,
  });
}

function composeSignals(a, b) {
  const ctrl = new AbortController();
  const abort = () => ctrl.abort();
  a.addEventListener("abort", abort);
  b.addEventListener("abort", abort);
  if (a.aborted || b.aborted) ctrl.abort();
  return ctrl.signal;
}
