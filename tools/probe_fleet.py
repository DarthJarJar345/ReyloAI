#!/usr/bin/env python3
"""
Fleet probe v2 — find engines that keep working AFTER ZeroGPU quota runs out.

ZeroGPU's anonymous quota is platform-wide per IP, so rotating ZeroGPU spaces
does not help. But many public Spaces run Wan2.2-I2V on owner-sponsored GPUs
with NO ZeroGPU quota at all. This probe:

  1) discovers I2V endpoints via /config (components + dependencies + labels),
     which works on every Gradio space (named API or not)
  2) exhausts the anonymous ZeroGPU quota on the primary space (same IP)
  3) immediately tests each alternate from that same exhausted IP
     -> alternates that still return videos are true fleet members
  4) records each engine's param labels so the site can map payloads generically
"""

from __future__ import annotations

import base64
import json
import os
import re
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
PRIMARY = "zerogpu-aoti-wan2-2-fp8da-aoti-faster"
MAX_ALTS = 8
SSE_TIMEOUT = 240

KNOWN = [
    "zerogpu-aoti-wan2-2-fp8da-aoti-faster",
    "hcsmediacorp-Wan-2.1-i2v-480p-Ultra-Fast",
    "rhaps0dy-ltx-video-i2v",
    "amisima-Wan-2.2-I2V-Studio",
    "raubatz-Wan_2_2_I2V_14B-Custom-Lora",
    "YasrBndr-Wan-AI-Wan2.2-I2V-A14B-Diffusers",
    "Fgasa-Wan-AI-Wan2.2-I2V-A14B",
    "ufogr-Wan-AI-Wan2.2-I2V-A14B",
    "makiblek-Wan_2.2_I2V_14B_Custom_Lora_Wow",
    "Saravutw-WAN2.2_I2V_LIGHTNING_4-8step_custom",
    "fffiloni-diffusers-image-to-video",
    "camenduru-wan22-i2v",
]
SEARCHES = ["wan2.2 i2v", "wan 2.2 image to video", "wan i2v", "ltx video i2v",
            "wan 2.1 i2v ultra fast", "image to video wan"]

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


def host_of(sid):
    return f"https://{sid.replace('/', '-')}.hf.space"


def runtime_of(sid):
    try:
        r = req(f"https://huggingface.co/api/spaces/{sid}?runtime=true", timeout=45)
        rt = json.loads(r.read()).get("runtime") or {}
        hw = (rt.get("hardware") or {}).get("current")
        stage = rt.get("stage")
        return f"{hw or stage or 'unknown'}"
    except Exception:
        return "?"


def wake(host, budget_s=180):
    """Patiently wait for a sleeping space to answer /config."""
    t0 = time.time()
    last = None
    while time.time() - t0 < budget_s:
        try:
            return json.loads(req(host + "/config", timeout=60).read()), time.time() - t0
        except Exception as e:
            last = e
            time.sleep(10)
    print(f"      wake failed after {budget_s}s: {type(last).__name__}: {str(last)[:70]}")
    return None, None


def discover_i2v(host):
    """config-based discovery: (fn_index, params[(comp,label)]) or None."""
    cfg, woke_in = wake(host)
    if cfg is None:
        return None
    if woke_in:
        print(f"      woke in {woke_in:.0f}s")
    comps = {c.get("id"): c for c in cfg.get("components", [])}
    for i, d in enumerate(cfg.get("dependencies", [])):
        vis = d.get("api_visibility")
        if vis not in (None, "public"):
            continue
        ins = [comps.get(x) for x in d.get("inputs", []) if comps.get(x)]
        outs = [comps.get(x) for x in d.get("outputs", []) if comps.get(x)]
        if any(c.get("type") == "image" for c in ins) and any(
            c.get("type") == "video" for c in outs
        ):
            params = []
            for c in ins:
                props = c.get("props") or {}
                label = str(props.get("label") or props.get("name") or c.get("type"))
                params.append((c.get("type"), label))
            return i, params, cfg.get("version")
    return None


def map_value(comp, label, png_data_url, png_size):
    key = label.lower()
    if comp == "image":
        return {"path": None, "url": png_data_url, "orig_name": "p.png",
                "mime_type": "image/png", "size": png_size, "is_stream": False,
                "meta": {"_type": "gradio.FileData"}}
    if "negative" in key:
        return ""
    if "prompt" in key or "descri" in key:
        return "a lone figure walks toward the sunset, cinematic motion"
    if "random" in key:
        return False
    if "seed" in key:
        return 42
    if "step" in key:
        return 4
    if "duration" in key or "second" in key:
        return 0.5
    if re.search(r"guidance.*(2|low)", key):
        return 1
    if "guidance" in key:
        return 1
    if "frame" in key:
        return 8
    if "width" in key:
        return 512
    if "height" in key:
        return 288
    return None


def try_generation(host, fn_index, params, png, timeout_sse=SSE_TIMEOUT):
    t0 = time.time()
    data_url = "data:image/png;base64," + base64.b64encode(png).decode()
    data = [map_value(c, l, data_url, len(png)) for c, l in params]
    session = uuid.uuid4().hex[:16]
    payload = {"data": data, "session_hash": session, "fn_index": fn_index}
    prefix = "/gradio_api"
    try:
        r = req(host + prefix + "/queue/join", method="POST",
                data=json.dumps(payload).encode(),
                headers={"Origin": ORIGIN, "Content-Type": "application/json"}, timeout=90)
        join = json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read()[:200].decode(errors="replace")
        if e.code == 404 or e.code == 405:  # gradio 4 layout
            prefix = ""
            try:
                r = req(host + "/queue/join", method="POST",
                        data=json.dumps(payload).encode(),
                        headers={"Origin": ORIGIN, "Content-Type": "application/json"}, timeout=90)
                join = json.loads(r.read())
            except Exception as e2:
                return "ERR", f"join({e.code} then {type(e2).__name__})"
        else:
            return ("QUOTA" if "quota" in body.lower() or "limit" in body.lower() else "ERR"), \
                   f"join HTTP {e.code}: {body[:120]}"
    except Exception as e:
        return "ERR", f"join: {type(e).__name__}: {str(e)[:100]}"

    event_id = join.get("event_id")
    try:
        sse = req(host + prefix + f"/queue/data?session_hash={session}",
                  headers={"Origin": ORIGIN, "Accept": "text/event-stream"},
                  timeout=timeout_sse)
    except Exception as e:
        return "ERR", f"sse: {type(e).__name__}"
    verdict, detail = "SLOW", f"no completion in {timeout_sse}s"
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
                data_out = out.get("data")
                if success is False or not data_out:
                    low = (err + str(out.get("title") or "")).lower()
                    verdict = "QUOTA" if ("quota" in low or "limit" in low) else "ERR"
                    detail = (err or str(out.get("title")) or "empty output")[:140]
                else:
                    verdict, detail = "OK", f"{time.time() - t0:.1f}s"
                break
            if m in ("unexpected_error", "queue_full"):
                verdict, detail = "ERR", json.dumps(msg)[:140]
                break
    except Exception as e:
        if verdict != "OK":
            verdict, detail = "ERR", f"sse read: {type(e).__name__}"
    finally:
        sse.close()
    return verdict, detail


def discover_hosts():
    sids = list(KNOWN)
    for q in SEARCHES:
        try:
            r = req(f"https://huggingface.co/api/spaces?search={urllib.parse.quote(q)}&limit=30",
                    timeout=45)
            for it in json.loads(r.read()):
                sid = it.get("id")
                if sid and it.get("sdk") == "gradio":
                    sids.append(sid)
        except Exception as e:
            print(f"  search {q!r}: {e}")
    seen, out = set(), []
    for sid in sids:
        if sid not in seen:
            seen.add(sid)
            out.append(sid)
    return out


def main():
    png = make_png()
    hr("1) discover I2V engines via /config")
    engines = []
    for sid in discover_hosts():
        host = host_of(sid)
        hw = runtime_of(sid)
        got = discover_i2v(host)
        if got:
            fn, params, ver = got
            engines.append((sid, host, fn, params))
            print(f"  I2V  {sid}  hw={hw} fn={fn} gradio={ver}")
            print(f"       params={params}")
        else:
            print(f"  --   {sid} hw={hw} (no usable i2v endpoint)")
        if len(engines) >= MAX_ALTS + 3:
            break
    print(f"  discovered {len(engines)} i2v engines")
    if not engines:
        return 1

    prim = next((e for e in engines if e[0] == PRIMARY), engines[0])
    hr("2) exhaust ZeroGPU quota on primary (same IP)")
    exhausted = False
    for i in range(1, 7):
        v, d = try_generation(prim[1], prim[2], prim[3], png, timeout_sse=120)
        print(f"  exhaust#{i} {prim[0]} -> {v} {d}", flush=True)
        results.append(("exhaust", prim[0], v, d))
        if v == "QUOTA":
            exhausted = True
            break
        time.sleep(1)

    hr(f"3) alternates from the SAME exhausted IP (exhausted={exhausted})")
    for sid, host, fn, params in engines:
        if sid == prim[0]:
            continue
        v, d = try_generation(host, fn, params, png)
        print(f"  ALT {sid} -> {v} {d}", flush=True)
        results.append(("alt", sid, v, d))
        time.sleep(1)

    hr("SUMMARY")
    ok_alts = [r for r in results if r[0] == "alt" and r[2] == "OK"]
    for r in results:
        print(f"   - {r[0]:8s} {r[1]} -> {r[2]} {r[3]}")
    print(f"  alternates OK while primary quota-blocked: {len(ok_alts)}")
    if ok_alts:
        print("  FLEET MEMBERS (unlimited-path engines):")
        for sid, host, fn, params in engines:
            if any(r[1] == sid and r[2] == "OK" and r[0] == "alt" for r in results):
                print(f"    * {sid}  fn={fn}  params={params}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
