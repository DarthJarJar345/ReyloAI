#!/usr/bin/env python3
"""
Fleet expansion probe: MiniMax-H3 Turbo (video+audio) and LTX-2.x Turbo spaces.

For each candidate Space:
  1. wake it, read /config, discover any dep with a video output
     (classified i2v if it takes an image input, else t2v)
  2. introspect hardware via the HF API (?runtime=true) — "zerogpu" vs sponsored
  3. for the first N discovered engines: one anonymous MINIMAL generation
     (smallest steps/duration/resolution we can infer) + CORS check on the mp4.

Output is the evidence used to grow the site's engine registry (engines.js).
"""

from __future__ import annotations

import base64
import json
import os
import struct
import sys
import time
import urllib.error
import urllib.request
import uuid
import zlib

ORIGIN = os.environ.get("PROBE_ORIGIN", "https://darthjarjar345.github.io")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")
SSE_TIMEOUT = 330
GEN_BUDGET = int(os.environ.get("GEN_BUDGET", "6"))   # max spaces to test-generate
WAKE_BUDGET = 90

CANDIDATES = [
    # --- MiniMax-H3 Turbo (video + synchronized audio, 4-8 steps) ---
    "MiniMaxAI/MiniMax-H3-Turbo-Lora",
    "akhaliq/MiniMax-H3-Turbo-Lora",
    "abidlabs/MiniMax-H3-Turbo-Lora",
    "multimodalart/minimax-h3-audio-to-video",
    "prithivMLmods/MiniMax-H3-Turbo-LoRA-Fast",
    "boltguo/minimax-h3-ultra-fast",
    "jli1122/minimax-h3-ultra-fast",
    "raubatz/minimax-h3-ultra-fast",
    "slymun/minimax-h3-ultra-fast",
    "ramu23/minimax-h3-i2v-r2v-nvfp4-cn",
    "owenisas/minimax-h3-fl2va",
    "ifroyou/minimax-h3-ref2va-sketch-p15b",
    "ysharma/gr-workflow-h3-zerogpu",
    "LLMhacker/MiniMax-H3-video-generator",
    "akshat2512/MiniMax-H3-video-generator",
    "mc8126/minimax-h3-turbo-demo",
    "mpasila/minimax-h3-reference-4-step-lora",
    "AlexSinHF/MiniMax-H3-Turbo-Loras",
    "vml12/MiniMax-H3-Turbo-Lora",
    "rahul7star/MiniMax-H3-Turbo-Lora",
    "zakirovrinatik/minimax-h3-audio-to-video",
    "owenisas/minimax-h3-profile-larry",
    "jameshuntercarter/minimax-h3-ultra-fast",
    "bened/MiniMax-H3-Turbo-Lora",
    "FelipeAzambuja/MiniMax-H3-Turbo-Lora-Demo",
    "hugging-apps/h3-world-action-demo",
    # --- LTX-2.x Turbo (video + audio, fast distilled) ---
    "amisima/LTX_2.5_Turbo_Studio",
    "ZeroCollabs/LTX-2.3-turbo",
    "Phamthihong/LTX-2.3-turbo",
    "rahul7star/LTX-2.3-turbo",
    "Imosu/LTX-2.3-turboX",
    "DeepRat/LTX-Video-ZeroGPU-Optimized",
    "yuvraj108c/ltx25-bbox-control-demo",
    # --- extra Wan2 family members ---
    "OpenKing/wan2-video-generation",
    "Artist89/wan2-video-generation",
]


def hr(t):
    print("\n" + "=" * 78 + f"\n### {t}\n" + "=" * 78, flush=True)


def req(url, method="GET", data=None, headers=None, timeout=60):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        h.update(headers)
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    return urllib.request.urlopen(r, timeout=timeout)


def make_png(w=256, h=144):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            px = (int(24 + 90 * (y / h)), int(60 + 130 * (1 - y / h)),
                  int(120 + 120 * (1 - y / h)))
            raw += bytes(px)

    def chunk(tag, payload):
        c = struct.pack(">I", len(payload)) + tag + payload
        return c + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)

    p = b"\x89PNG\r\n\x1a\n"
    p += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    p += chunk(b"IDAT", zlib.compress(bytes(raw), 6))
    p += chunk(b"IEND", b"")
    return p


def host_of(sid):
    return "https://" + sid.replace("/", "-") + ".hf.space"


def runtime_of(sid):
    try:
        r = req(f"https://huggingface.co/api/spaces/{sid}?runtime=true", timeout=45)
        rt = json.loads(r.read()).get("runtime") or {}
        hw = rt.get("hardware")
        if isinstance(hw, dict):
            hw = hw.get("current") or hw.get("requested")
        return str(hw or rt.get("stage") or "?")
    except Exception:
        return "?"


def wake(host, budget=WAKE_BUDGET):
    t0 = time.time()
    while time.time() - t0 < budget:
        try:
            r = req(host, timeout=45, headers={"Origin": ORIGIN})
            if r.status == 200:
                return True, f"{time.time()-t0:.0f}s"
        except urllib.error.HTTPError as e:
            if e.code == 401 or e.code == 403:
                return False, f"auth {e.code}"
            if e.code != 503 and e.code != 502:
                return False, f"HTTP {e.code}"
        except Exception as e:
            if "CERTIFICATE_VERIFY_FAILED" in str(e):
                return False, "dead cert"
        time.sleep(6)
    return False, "wake timeout"


def discover_video(host):
    """Return list of (fn_index, kind, params, api_name) for deps with video out."""
    try:
        r = req(host + "/config", timeout=60, headers={"Origin": ORIGIN})
        cfg = json.loads(r.read())
    except Exception as e:
        return None, f"config fail {type(e).__name__}: {str(e)[:80]}", cfg_ver_str(None)
    comps = {c.get("id"): c for c in cfg.get("components", [])}
    found = []
    for i, d in enumerate(cfg.get("dependencies", [])):
        vis = d.get("api_visibility")
        if vis not in (None, "public"):
            continue
        ins = [comps.get(x) for x in d.get("inputs", []) if comps.get(x)]
        outs = [comps.get(x) for x in d.get("outputs", []) if comps.get(x)]
        if not any(c.get("type") == "video" for c in outs):
            continue
        if d.get("queue") is False:
            continue
        has_img = any(c.get("type") == "image" for c in ins)
        has_txt = any(c.get("type") == "textbox" for c in ins)
        if not (has_img or has_txt):
            continue
        params = [(c.get("type"),
                   str((c.get("props") or {}).get("label") or (c.get("props") or {}).get("name") or c.get("type")),
                   c.get("props") or {})
                  for c in ins]
        kind = "i2v" if has_img else "t2v"
        found.append((i, kind, params, d.get("api_name")))
    return found, None, cfg_ver_str(cfg)


def cfg_ver_str(cfg):
    if not cfg:
        return "?"
    return str(cfg.get("version") or (cfg.get("config", {}) or {}).get("version") or "?")


def min_value(comp, label, png_data_url, png_size):
    """Smallest sane value for a component — keeps test generations short."""
    key = label.lower()
    props = comp.get("props") or {}
    t = comp.get("type")
    if t == "image":
        return {"path": None, "url": png_data_url, "orig_name": "p.png",
                "mime_type": "image/png", "size": png_size, "is_stream": False,
                "meta": {"_type": "gradio.FileData"}}
    if t == "video":
        return None
    if t == "checkbox":
        return bool(props.get("value", False))
    if t == "textbox":
        if "negative" in key:
            return str(props.get("value") or "")
        return str(props.get("value") or "a corgi in a chef hat flips a pancake in a sunny kitchen, sizzling sounds")
    if t in ("slider", "number"):
        v = props.get("value")
        mn = props.get("minimum")
        if mn is not None and v is not None:
            if "step" in key:
                return min(max(4, mn), v) if mn <= 4 <= v else mn
            if any(k in key for k in ("duration", "second", "frame", "length")):
                return mn
            if any(k in key for k in ("width", "height", "resolution", "size")):
                return mn
            return mn if mn == v else v
        return v
    if t == "dropdown":
        choices = props.get("choices") or []
        if choices:
            cs = [c[0] if isinstance(c, (list, tuple)) else c for c in choices]
            for c in cs:
                if any(x in str(c).lower() for x in ("480", "small", "short", "fast", "low", "5")):
                    return c
            return props.get("value") if props.get("value") in cs else cs[0]
        return props.get("value")
    return props.get("value")


def classify_err(txt):
    t = txt.lower()
    if re_search := any(k in t for k in ("quota", "runs limit", "too many", "rate limit")):
        return "QUOTA"
    if "token" in t and ("auth" in t or "login" in t):
        return "AUTH"
    if "nsfw" in t or "safety" in t or "blocked" in t or "flagged" in t:
        return "SAFETY"
    return "ERROR"


def try_generation(host, fn_index, params, api_name, png, data_url, png_size):
    data = []
    for comp, label, props in params:
        data.append(min_value({"type": comp, "props": props}, label, data_url, png_size))
    session = uuid.uuid4().hex[:16]
    payload = {"data": data, "session_hash": session, "fn_index": fn_index}
    if api_name:
        payload["endpoint"] = api_name if str(api_name).startswith("/") else "/" + str(api_name)
    t0 = time.time()
    try:
        r = req(host + "/gradio_api/queue/join", method="POST",
                data=json.dumps(payload).encode(),
                headers={"Origin": ORIGIN, "Content-Type": "application/json"},
                timeout=90)
        join = json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read(500).decode("utf-8", "replace")
        return None, f"join HTTP {e.code} {body[:120]}"
    except Exception as e:
        return None, f"join fail {type(e).__name__}: {str(e)[:80]}"
    if "event_id" not in join:
        return None, f"join odd: {str(join)[:120]}"
    eid = join["event_id"]
    try:
        sse = req(host + f"/gradio_api/queue/data?session_hash={session}",
                  headers={"Origin": ORIGIN, "Accept": "text/event-stream"},
                  timeout=SSE_TIMEOUT)
    except Exception as e:
        return None, f"sse fail {type(e).__name__}"
    try:
        deadline = time.time() + SSE_TIMEOUT
        for raw in sse:
            if time.time() > deadline:
                return None, "sse deadline"
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if not line.startswith("data:"):
                continue
            try:
                msg = json.loads(line[5:].strip())
            except Exception:
                continue
            if msg.get("msg") == "heartbeat":
                continue
            if msg.get("event_id") and msg.get("event_id") != eid:
                continue
            if msg.get("msg") == "process_completed":
                out = msg.get("output") or {}
                d = out.get("data")
                err = str(out.get("error") or out.get("title") or "")
                if not d:
                    return None, f"{classify_err(err)} {err[:150]}"
                vid = None
                for item in d:
                    if isinstance(item, dict) and (item.get("url") or item.get("path")):
                        u = item.get("url") or (host + "/gradio_api/file=" + str(item.get("path")))
                        ct = str(item.get("mime_type") or "")
                        if "video" in ct or str(u).endswith((".mp4", ".webm")):
                            vid = u
                            break
                if not vid:
                    return None, f"data but no video url: {str(d)[:120]}"
                # CORS check on the mp4
                cors = "?"
                try:
                    vr = req(vid, headers={"Origin": ORIGIN, "Range": "bytes=0-1023"}, timeout=60)
                    cors = str(vr.headers.get("Access-Control-Allow-Origin"))
                    size = vr.headers.get("Content-Range") or vr.headers.get("Content-Length")
                except urllib.error.HTTPError as e:
                    cors = f"HTTP {e.code} aca={e.headers.get('Access-Control-Allow-Origin')}"
                    size = "?"
                except Exception as e:
                    cors = f"fail {type(e).__name__}"
                    size = "?"
                return {"time": time.time() - t0, "url": vid, "cors": cors, "size": str(size)}, None
            if msg.get("msg") == "unexpected_error":
                return None, f"ERROR {str(msg.get('message_data'))[:150]}"
    finally:
        try:
            sse.close()
        except Exception:
            pass
    return None, "sse ended without completion"


def main():
    png = make_png()
    data_url = "data:image/png;base64," + base64.b64encode(png).decode()
    hr(f"1) discover video engines across {len(CANDIDATES)} candidate spaces")
    discovered = []
    t_start = time.time()
    for sid in CANDIDATES:
        if time.time() - t_start > 1500:
            print("  discovery budget spent, stopping")
            break
        host = host_of(sid)
        ok, why = wake(host)
        hw = runtime_of(sid)
        if not ok:
            print(f"  --   {sid}  hw={hw} ({why})")
            continue
        deps, err, gver = discover_video(host)
        if deps is None:
            print(f"  --   {sid}  hw={hw} gradio={gver} ({err})")
            continue
        if not deps:
            print(f"  --   {sid}  hw={hw} gradio={gver} (no video-output dep)")
            continue
        for fn, kind, params, api_name in deps:
            print(f"  {kind.upper()} {sid}  hw={hw} fn={fn} api={api_name} gradio={gver}")
            print(f"       params={[(p[0], p[1]) for p in params]}")
            discovered.append((sid, host, fn, kind, params, api_name, hw))
    print(f"\n  discovered {len(discovered)} video engines "
          f"({sum(1 for d in discovered if d[3]=='i2v')} i2v / "
          f"{sum(1 for d in discovered if d[3]=='t2v')} t2v)")

    hr(f"2) anonymous minimal generation test (first {GEN_BUDGET}, prefer non-zerogpu)")
    ordered = sorted(discovered, key=lambda d: 0 if "zerogpu" not in d[6] else 1)
    results = []
    for sid, host, fn, kind, params, api_name, hw in ordered[:GEN_BUDGET]:
        res, err = try_generation(host, fn, params, api_name, png, data_url, len(png))
        if res:
            print(f"  GEN OK   {sid} hw={hw} kind={kind} in {res['time']:.1f}s "
                  f"cors={res['cors']!r} size={res['size']}")
            results.append((sid, host, fn, kind, api_name, hw, "OK", res["time"], res["cors"]))
        else:
            print(f"  GEN FAIL {sid} hw={hw} kind={kind}: {err}")
            results.append((sid, host, fn, kind, api_name, hw, err.split()[0] if err else "ERR", None, None))

    hr("SUMMARY — registry candidates")
    for sid, host, fn, kind, api_name, hw, verdict, t, cors in results:
        print(f"   - {sid}  hw={hw}  fn={fn}  kind={kind}  api={api_name}  "
              f"verdict={verdict}  {('%.1fs' % t) if t else ''}  cors={cors}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
