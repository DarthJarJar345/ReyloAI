# 🎬 Reylo AI Video Generator

**Turn any image into living cinema — 100% free, no account, no watermark, no backend.**

Live site (public, free, zero-config CDN mirror of the `reylo-v2` release tag):
**https://rawcdn.githack.com/DarthJarJar345/ReyloAI/reylo-v2/index.html**

(jsDelivr/statically were rejected as public URLs because they serve `.html` as
`text/plain` — verified by the CI probe — which makes browsers show source text.)

GitHub Pages (`https://darthjarjar345.github.io/ReyloAI/`) is auto-provisioned by
`.github/workflows/pages.yml` whenever an admin token is available to the CI.

Reylo AI animates still images with
[Wan 2.2 14B Fast](https://huggingface.co/spaces/zerogpu-aoti/wan2-2-fp8da-aoti-faster) —
the Lightning-LoRA, FP8-quantized, AoT-compiled image-to-video engine running on
Hugging Face **ZeroGPU**. The whole product is a static website: your browser talks
straight to the model over Gradio's public HTTP/SSE protocol, so there is no server,
no subscription and no credit-card wall anywhere in the loop.

---

## ✨ Features

- **Image → video studio**: drag & drop, click-to-browse, or `Ctrl+V` paste; images are
  downscaled to 832 px *in your browser* before they ever leave it.
- **4 curated sample frames** with matching motion prompts, so the first click works.
- **Motion preset chips**, a 🎲 prompt randomizer, and full control when you want it:
  duration (0.5–5 s), inference steps (1–30), dual guidance scales, seed / randomize,
  negative prompt.
- **Live generation telemetry**: queue position, denoise progress ring, elapsed time and
  ETA, engine wake-up detection with automatic retry on cold starts.
- **Private on-device gallery**: every take is cached in IndexedDB *in your browser only*
  (max 12 clips), with poster thumbnails, replay modal, download, prompt reuse, delete.
- **Engine health pill** in the nav (ready / waking / offline), polled live.
- **Optional HF token slot** (Advanced settings): stays in `localStorage`, sent only as an
  `Authorization` header to Hugging Face — lifts the anonymous shared-quota limit with
  your own free account if you ever need it.
- Zero dependencies, zero build step, zero trackers. ~45 KB of hand-written JS.

## 🧠 How it works

```
your browser ──HTTPS/JSON──▶ hf.space (Gradio queue/join)
     ▲                              │
     │        SSE progress          ▼
     └──────────────────────  ZeroGPU H200 runs
                              Wan 2.2 14B I2V + Lightning LoRA
                              (fp8 dynamic activations, AoT compiled)
```

1. `GET  /config` → discover dependencies + `fn_index`
2. `POST /queue/join` → payload = `[image (base64 FileData), prompt, steps,
   negative_prompt, duration_seconds, guidance_scale, guidance_scale_2, seed,
   randomize_seed]`
3. `GET  /queue/data?session_hash=…` (SSE) → `estimation`, `process_starts`,
   `progress_data`, `process_completed` → mp4 `FileData`
4. Video is fetched as a blob, played, downloaded, and cached in IndexedDB.

All of this lives in [`assets/js/gradio-client.js`](assets/js/gradio-client.js) — a
dependency-free Gradio 4/5 wire-protocol client (queue + SSE + upload + cancel +
reconnect + CORS/auth error classification).

## 🗂 Repository layout

```
index.html                 the entire UI (studio, gallery, how, faq)
assets/css/style.css       design system (deep-space theme, dual-saber gradient)
assets/js/gradio-client.js Gradio Space protocol client
assets/js/app.js           studio UX, progress, gallery wiring
assets/js/db.js            IndexedDB gallery store
assets/samples/            4 optimized 832×480 sample stills
tools/probe_space.py       CI probe: verifies anonymous API + CORS + round-trip
.github/workflows/         probe.yml (API health), pages.yml (Pages provisioning)
```

## 🚀 Run locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

No build, no install. Any static file server works.

## 🛰 CI probes

`.github/workflows/probe.yml` runs `tools/probe_space.py` on GitHub's runners on every
change to the probe (or manually via *workflow_dispatch*). It verifies, from outside the
sandbox, that the Space still:

- answers anonymously (`auth_required: false`),
- returns CORS headers for the Pages origin (browser calls),
- completes a real image→video round-trip and serves the mp4 with CORS.

The report is committed back to the branch as `tools/probe-report.md` **and** posted as
a commit comment, so the verification trail lives with the code.

## ⚖️ Licenses & credit

- Engine Space: [zerogpu-aoti/wan2-2-fp8da-aoti-faster](https://huggingface.co/spaces/zerogpu-aoti/wan2-2-fp8da-aoti-faster)
- Weights: [Wan-AI/Wan2.2-I2V-A14B](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B) (Apache-2.0)
- LoRA: [Kijai/WanVideo_comfy · Wan22-Lightning](https://huggingface.co/Kijai/WanVideo_comfy/tree/main/Wan22-Lightning)
- Compute: Hugging Face ZeroGPU (free public pool)

Reylo AI is an independent fan project, not affiliated with Hugging Face, the model
authors, or any film franchise. "Reylo" is simply this project's name. Please only
animate images you have the rights to use.
