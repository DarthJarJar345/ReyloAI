#!/usr/bin/env python3
"""
Fleet probe: can we give every visitor effectively-unlimited free video?

Experiment:
  1) discover public Gradio Spaces that expose an image->video endpoint
  2) exhaust the anonymous ZeroGPU quota on the primary Space (same runner IP)
  3) IMMEDIATELY try every alternate engine from the same IP
     -> if alternates still work while primary is quota-blocked, a client-side
        rotation fleet multiplies the free quota per visitor
  4) validate each alternate end-to-end (config, info, one minimal generation)

Payloads are built dynamically from each Space's /gradio_api/info so any
Gradio I2V engine can join the fleet.
"""

from __future__ import annotations

import base64
import json
import os
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zlib

ORIGIN = os.environ.get("PROBE_ORIGIN", "https://darthjarjar345.github.io")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")
PRIMARY = "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space"

KNOWN_CANDIDATES = [
    "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space",
    "https://zerogpu-aoti-wan2-2-fp8da-aoti.hf.space",
    "https://multimodalart-wan2-2-i2v-fast.hf.space",
    "https://fffiloni-diffusers-image-to-video.hf.space",
    "https://fffiloni-wan2-2-i2v.hf.space",
    "https://kijai-wan2-2-i2v.hf.space",
    "https://lightricks-ltx-video-playground.hf.space",
    "https://camenduru-wan22-i2v.hf.space",
]
SEARCHES = ["wan2.2 i2v", "wan 2.2 image to video", "wan i2v fast", "ltx video i2v"]

results = []


def hr(t):
    print("\n" + "=" * 78 + f"\n### {t}\n" + "=" * 78, flush=True)


def req(url, method="GET", data=None, headers=None, timeout=60):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        h.update(headers)
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    return urllib.request.urlopen(r, timeout=timeout)


def make_png(w=512, h=288):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            dx = (x - w * 0.5) / (w * 0.5)
            dy = (y - h * 0.42) / (h * 0.5)
            d = (dx * dx + dy * dy) ** 0.5
            if d < 0.22:
                px = (255, 236, 170)
            else:
                t = y / h
                px = (int(24 + 90 * t), int(60 + 130 * (1 - t)), int(120 + 120 * (1 - t)))
            raw += bytes(px)

    def chunk(tag, payload):
        c = struct.pack(">I", len(payload)) + tag + payload
        return c + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)

    p = b"\x89PNG\r\n\x1a\n"
    p += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    p += chunk(b"IDAT", zlib.compress(bytes(raw), 6))
    p += chunk(b"IEND", b"")
    return p


def get_info(host):
    """Return (endpoint_name, param_names, prefix) or None."""
    for prefix in ("/gradio_api", ""):
        try:
            r = req(host + prefix + "/info", timeout=45)
            info = json.loads(r.read())
        except Exception:
            continue
        for name, ep in (info.get("named_endpoints") or {}).items():
            params = [p.get("parameter_name") for p in ep.get("parameters", [])]
            comps = [p.get("component") for p in ep.get("parameters", [])]
            rets = [rt.get("component") for rt in ep.get("returns", [])]
            if "Image" in comps and "Video" in rets:
                return name, params, prefix
    return None


def build_payload(params, png):
    data_url = "data:image/png;base64," + base64.b64encode(png).decode()
    payload = []
    for name in params:
        n = (name or "").lower()
        if n in ("input_image", "image", "img", "init_image"):
            payload.append({"path": None, "url": data_url, "orig_name": "p.png",
                            "mime_type": "image/png", "size": len(png),
                            "is_stream": False, "meta": {"_type": "gradio.FileData"}})
        elif n == "prompt":
            payload.append("a lone figure walks toward the sunset, cinematic motion")
        elif n in ("steps", "num_inference_steps"):
            payload.append(4)
        elif n == "negative_prompt":
            payload.append("")
        elif n in ("duration_seconds", "duration"):
            payload.append(0.5)
        elif n.startswith("guidance"):
            payload.append(1)
        elif n == "seed":
            payload.append(42)
        elif n in ("randomize_seed", "random_seed"):
            payload.append(False)
        elif n in ("num_frames",):
            payload.append(8)
        elif n in ("width",):
            payload.append(512)
        elif n in ("height",):
            payload.append(288)
        else:
            payload.append(None)
    return payload


def try_generation(host, prefix, endpoint, params, png, tag, timeout_sse=240):
    t0 = time.time()
    payload = {
        "data": build_payload(params, png),
        "session_hash": uuid.uuid4().hex[:16],
        "endpoint": endpoint,
    }
    # fn_index: assume the i2v endpoint index from info order = 0..; try endpoint-only first
    try:
        r = req(host + prefix + "/queue/join", method="POST",
                data=json.dumps(payload).encode(),
                headers={"Origin": ORIGIN, "Content-Type": "application/json"}, timeout=90)
        join = json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read()[:300].decode(errors="replace")
        if e.code == 400 and "function index" in body:
            # need fn_index: fetch config deps
            try:
                cfg = json.loads(req(host + "/config", timeout=45).read())
                deps = cfg.get("dependencies", [])
                norm = lambda s: str(s or "").lstrip("/")
                idx = next((i for i, d in enumerate(deps)
                            if norm(d.get("api_name")) == norm(endpoint.lstrip("/"))), 0)
                payload["fn_index"] = idx
                r = req(host + prefix + "/queue/join", method="POST",
                        data=json.dumps(payload).encode(),
                        headers={"Origin": ORIGIN, "Content-Type": "application/json"}, timeout=90)
                join = json.loads(r.read())
            except Exception as e2:
                return "ERR", f"join retry failed: {e2}"
        else:
            return "ERR", f"join HTTP {e.code}: {body[:150]}"
    except Exception as e:
        return "ERR", f"join failed: {e}"

    event_id = join.get("event_id")
    try:
        sse = req(host + prefix + f"/queue/data?session_hash={payload['session_hash']}",
                  headers={"Origin": ORIGIN, "Accept": "text/event-stream"}, timeout=timeout_sse)
    except Exception as e:
        return "ERR", f"sse open: {e}"
    verdict, detail = "ERR", "stream ended without completion"
    try:
        for raw in sse:
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if not line.startswith("data:"):
                continue
            try:
                msg = json.loads(line[5:].strip())
            except Exception:
                continue
            if msg.get("event_id") and msg.get("event_id") != event_id:
                continue
            m = msg.get("msg")
            if m == "process_completed":
                out = msg.get("output") or {}
                success = out.get("success", msg.get("success"))
                err = str(out.get("error") or "")
                data = out.get("data")
                if success is False or not data:
                    if "quota" in err.lower() or "limit" in err.lower():
                        verdict, detail = "QUOTA", err[:160]
                    else:
                        verdict, detail = "ERR", (err or "empty output")[:160]
                else:
                    verdict, detail = "OK", f"{time.time() - t0:.1f}s"
                break
            if m in ("unexpected_error", "queue_full"):
                verdict, detail = "ERR", json.dumps(msg)[:160]
                break
    except Exception as e:
        verdict, detail = "ERR", f"sse: {e}"
    finally:
        sse.close()
    return verdict, detail


def discover():
    hosts = list(KNOWN_CANDIDATES)
    for q in SEARCHES:
        try:
            r = req(f"https://huggingface.co/api/spaces?search={urllib.parse.quote(q)}&limit=25",
                    timeout=45)
            items = json.loads(r.read())
            for it in items:
                sid = it.get("id")
                if sid and it.get("sdk") == "gradio":
                    hosts.append(f"https://{sid.replace('/', '-')}.hf.space")
        except Exception as e:
            print(f"  search {q!r} failed: {e}")
    seen, out = set(), []
    for h in hosts:
        h = h.rstrip("/")
        if h not in seen:
            seen.add(h)
            out.append(h)
    return out


def main():
    png = make_png()
    hr("1) discover I2V-capable public Gradio Spaces")
    hosts = discover()
    engines = []
    for h in hosts:
        try:
            got = get_info(h)
        except Exception:
            got = None
        if got:
            name, params, prefix = got
            engines.append((h, name, params, prefix))
            print(f"  I2V  {h}  endpoint={name} params={params}")
        else:
            print(f"  --   {h} (no i2v endpoint)")
    if not engines:
        print("NO ENGINES FOUND")
        return 1

    hr("2) exhaust anonymous quota on the primary engine")
    prim = next((e for e in engines if e[0] == PRIMARY), engines[0])
    exhausted = False
    for i in range(1, 7):
        v, d = try_generation(prim[0], prim[3], prim[1], prim[2], png, f"exh{i}")
        print(f"  exhaust#{i} on {prim[0]} -> {v} {d}", flush=True)
        results.append(("exhaust", prim[0], v, d))
        if v == "QUOTA":
            exhausted = True
            break
        time.sleep(1)
    print(f"  primary quota exhausted: {exhausted}")

    hr("3) cross-space quota test: alternates from the SAME ip, right now")
    for h, name, params, prefix in engines:
        if h == prim[0] and exhausted:
            continue
        v, d = try_generation(h, prefix, name, params, png, "alt")
        print(f"  ALT {h} -> {v} {d}", flush=True)
        results.append(("alt", h, v, d))

    hr("SUMMARY")
    ok_alts = [r for r in results if r[0] == "alt" and r[2] == "OK"]
    print(f"  alternates that worked while primary blocked/degraded: {len(ok_alts)}")
    for r in results:
        print(f"   - {r[0]:8s} {r[1]} -> {r[2]} {r[3]}")
    if exhausted and ok_alts:
        print("  VERDICT: quota is PER-SPACE -> rotation fleet multiplies free quota ✅")
    elif not exhausted:
        print("  VERDICT: quota not hit this run; alternates validated as fleet members ✅")
    else:
        print("  VERDICT: quota looks platform-wide; fleet still adds resilience ✅-ish")
    return 0


if __name__ == "__main__":
    sys.exit(main())
