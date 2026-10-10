#!/usr/bin/env python3
"""
CI probe for the Reylo AI Video Generator engine + public mirrors.

Verifies, from a machine with full internet (GitHub runner):
  0) which public CDN mirrors serve index.html as text/html (a real website)
  1) the Gradio config is reachable anonymously (and which prefix it uses)
  2) the named endpoint is public
  3) CORS preflights pass for the site origin
  4) N consecutive anonymous image->video generations succeed (reproduces
     "worked a few times then empty result" class of bugs), and the mp4 is
     downloadable with CORS headers

The full log is committed back to the branch (tools/probe-report.md) and
posted as a commit comment by the workflow.
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

SPACE = os.environ.get("SPACE_HOST", "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space")
ORIGIN = os.environ.get("PROBE_ORIGIN", "https://darthjarjar345.github.io")
GENS = int(os.environ.get("PROBE_GENS", "4"))
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")

MIRRORS = [
    ("jsdelivr", "https://cdn.jsdelivr.net/gh/DarthJarJar345/ReyloAI@reylo-v1/index.html"),
    ("jsdelivr-htm", "https://cdn.jsdelivr.net/gh/DarthJarJar345/ReyloAI@reylo-v1/index.htm"),
    ("statically", "https://cdn.statically.io/gh/DarthJarJar345/ReyloAI/reylo-v1/index.html"),
    ("githack-raw", "https://raw.githack.com/DarthJarJar345/ReyloAI/reylo-v1/index.html"),
    ("githack-cdn", "https://rawcdn.githack.com/DarthJarJar345/ReyloAI/reylo-v1/index.html"),
    ("githack-apex", "https://githack.com/DarthJarJar345/ReyloAI/reylo-v1/index.html"),
    ("gh-raw", "https://raw.githubusercontent.com/DarthJarJar345/ReyloAI/reylo-v1/index.html"),
]

failures = []


def hr(title: str) -> None:
    print("\n" + "=" * 78)
    print("### " + title)
    print("=" * 78, flush=True)


def request(url, method="GET", data=None, headers=None, timeout=60):
    hdrs = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    return urllib.request.urlopen(req, timeout=timeout)


def show_cors(resp) -> None:
    for h in resp.headers.keys():
        if h.lower().startswith("access-control"):
            print(f"  {h}: {resp.headers[h]}")


def make_png(width=512, height=288):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            dx = (x - width * 0.5) / (width * 0.5)
            dy = (y - height * 0.42) / (height * 0.5)
            d = (dx * dx + dy * dy) ** 0.5
            if d < 0.22:
                r, g, b = 255, 236, 170
            else:
                t = y / height
                r = int(24 + 90 * t)
                g = int(60 + 130 * (1 - t))
                b = int(120 + 120 * (1 - t))
            raw += bytes((r, g, b))

    def chunk(tag, payload):
        c = struct.pack(">I", len(payload)) + tag + payload
        return c + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 6))
    png += chunk(b"IEND", b"")
    return png


# --------------------------------------------------------------------- 0
def probe_mirrors() -> None:
    hr("0) Public mirror content-type check (which URL is a REAL website?)")
    for name, url in MIRRORS:
        try:
            resp = request(url, timeout=45)
            ct = resp.headers.get("Content-Type")
            body = resp.read(400)
            resp.close()
            verdict = "WEBSITE" if ct and "text/html" in ct else "NOT-HTML"
            interstitial = b"External Content Notice" in body or b"One more step" in body
            ours = b"Reylo AI Video Generator" in body
            print(f"  {name:14s} HTTP {resp.status}  content-type={ct!r}  -> {verdict}"
                  f"  interstitial={interstitial}  ours={ours}")
            if verdict == "NOT-HTML" or interstitial:
                print(f"      first bytes: {body[:200]!r}")
            if name == "jsdelivr" and verdict == "NOT-HTML":
                failures.append("jsdelivr serves index.html as non-HTML")
            if name == "jsdelivr" and verdict == "NOT-HTML":
                failures.append("jsdelivr serves index.html as non-HTML")
        except urllib.error.HTTPError as e:
            print(f"  {name:14s} HTTP {e.code}  content-type={e.headers.get('Content-Type')!r}")
            e.close()
        except Exception as e:
            print(f"  {name:14s} FAILED: {type(e).__name__}: {e}")


# --------------------------------------------------------------------- 1
def probe_config():
    hr("1) GET config (anonymous, browser Origin)")
    cfg, prefix = {}, "/gradio_api"
    try:
        resp = None
        body = None
        for cand in ("/gradio_api/config", "/config"):
            try:
                resp = request(SPACE + cand, headers={"Origin": ORIGIN}, timeout=120)
                body = resp.read()
                prefix = "/gradio_api" if cand.startswith("/gradio_api") else ""
                print(f"  config served at: {cand}")
                break
            except urllib.error.HTTPError as e:
                print(f"  {cand} -> HTTP {e.code}")
                resp = None
        if resp is None:
            raise RuntimeError("no config endpoint answered")
        cfg = json.loads(body)
        prefix = (cfg.get("api_prefix") or prefix).rstrip("/")
        print(f"  HTTP {resp.status}  api_prefix={cfg.get('api_prefix')!r} -> {prefix!r}"
              f"  protocol={cfg.get('protocol')!r}  gradio={cfg.get('version')}")
        print(f"  auth_required={cfg.get('auth_required')}  space_id={cfg.get('space_id')}")
        show_cors(resp)
        for i, d in enumerate(cfg.get("dependencies", [])):
            print(f"    dep[{i}] api_name={d.get('api_name')!r} queue={d.get('queue')}")
        if cfg.get("auth_required"):
            failures.append("config reports auth_required=True")
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        failures.append(f"config failed: {e}")
    return cfg, prefix


# --------------------------------------------------------------------- 2
def probe_info() -> None:
    hr("2) GET /gradio_api/info")
    try:
        resp = request(SPACE + "/gradio_api/info", timeout=60)
        info = json.loads(resp.read())
        named = info.get("named_endpoints", {})
        print(f"  HTTP {resp.status}  endpoints={list(named)}")
        for name, ep in named.items():
            print(f"    {name}: visibility={ep.get('api_visibility')} "
                  f"params={[p.get('parameter_name') for p in ep.get('parameters', [])]}")
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        failures.append(f"info failed: {e}")


# --------------------------------------------------------------------- 3
def probe_cors(prefix: str) -> None:
    hr("3) CORS preflights (queue/join + upload)")
    for path in ("/queue/join", "/upload?upload_id=probe"):
        try:
            resp = request(
                SPACE + prefix + path,
                method="OPTIONS",
                headers={
                    "Origin": ORIGIN,
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "content-type",
                },
                timeout=60,
            )
            allow = resp.headers.get("Access-Control-Allow-Origin")
            print(f"  OPTIONS {path} -> HTTP {resp.status}  allow-origin={allow!r}")
            if not allow:
                failures.append(f"preflight {path} missing allow-origin")
            resp.close()
        except Exception as e:
            print(f"  OPTIONS {path} FAILED: {type(e).__name__}: {e}")
            failures.append(f"preflight {path} failed: {e}")


# --------------------------------------------------------------------- 4
def run_generation(prefix: str, gen: int, png: bytes) -> bool:
    t0 = time.time()
    data_url = "data:image/png;base64," + base64.b64encode(png).decode()
    session = uuid.uuid4().hex[:16]
    payload = {
        "data": [
            {"path": None, "url": data_url, "orig_name": "probe.png",
             "mime_type": "image/png", "size": len(png), "is_stream": False,
             "meta": {"_type": "gradio.FileData"}},
            "a lone figure walks toward the sunset, cinematic motion, smooth animation",
            4, "", 0.5, 1, 1, 42, False,
        ],
        "session_hash": session,
        "fn_index": 0,
        "endpoint": "/generate_video",
    }
    try:
        resp = request(
            SPACE + prefix + "/queue/join",
            method="POST",
            data=json.dumps(payload).encode(),
            headers={"Origin": ORIGIN, "Content-Type": "application/json"},
            timeout=120,
        )
        join = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read()[:600].decode(errors="replace")
        print(f"  gen#{gen}: queue/join HTTP {e.code}: {detail}")
        failures.append(f"gen#{gen} join HTTP {e.code}: {detail[:200]}")
        return False
    except Exception as e:
        print(f"  gen#{gen}: queue/join FAILED {type(e).__name__}: {e}")
        failures.append(f"gen#{gen} join failed: {e}")
        return False

    event_id = join.get("event_id")
    print(f"  gen#{gen}: joined event_id={event_id}", flush=True)

    video_url = None
    completed_payload = None
    try:
        sse = request(
            SPACE + prefix + f"/queue/data?session_hash={session}",
            headers={"Origin": ORIGIN, "Accept": "text/event-stream"},
            timeout=600,
        )
    except Exception as e:
        print(f"  gen#{gen}: SSE open FAILED {type(e).__name__}: {e}")
        failures.append(f"gen#{gen} sse open: {e}")
        return False

    last_idx = None
    try:
        for raw in sse:
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if not line.startswith("data:"):
                continue
            chunk = line[5:].strip()
            if not chunk:
                continue
            try:
                msg = json.loads(chunk)
            except json.JSONDecodeError:
                continue
            if msg.get("msg") == "heartbeat":
                continue
            if msg.get("event_id") and msg["event_id"] != event_id:
                continue
            mtype = msg.get("msg")
            if mtype == "progress":
                pdata = msg.get("progress_data") or []
                idx = pdata[0].get("index") if pdata else None
                if idx != last_idx:
                    last_idx = idx
                    desc = pdata[0].get("desc") if pdata else None
                    print(f"    [{time.time() - t0:5.1f}s] progress {idx} desc={desc}", flush=True)
            elif mtype == "process_completed":
                completed_payload = msg
                out = msg.get("output") or {}
                data = out.get("data")
                print(f"    [{time.time() - t0:5.1f}s] process_completed success={out.get('success')} "
                      f"data_len={len(data) if isinstance(data, list) else data!r} "
                      f"error={str(out.get('error'))[:200]!r}", flush=True)
                if isinstance(data, list) and data and isinstance(data[0], dict):
                    video_url = data[0].get("url") or data[0].get("path")
                break
            elif mtype in ("estimation", "process_starts"):
                print(f"    [{time.time() - t0:5.1f}s] {mtype} rank={msg.get('rank')} "
                      f"eta={msg.get('rank_eta') or msg.get('eta')}", flush=True)
            elif mtype in ("unexpected_error", "queue_full"):
                print(f"    [{time.time() - t0:5.1f}s] {mtype}: {json.dumps(msg)[:300]}", flush=True)
                failures.append(f"gen#{gen} {mtype}: {json.dumps(msg)[:300]}")
                return False
    finally:
        sse.close()

    if not video_url:
        print(f"  gen#{gen}: NO VIDEO URL. full process_completed payload:")
        print("    " + json.dumps(completed_payload)[:1500])
        failures.append(f"gen#{gen} completed without video url")
        return False

    if video_url.startswith("/"):
        video_url = SPACE + video_url
    try:
        vresp = request(video_url, headers={"Origin": ORIGIN}, timeout=180)
        vbody = vresp.read()
        ct = vresp.headers.get("Content-Type")
        aca = vresp.headers.get("Access-Control-Allow-Origin")
        print(f"  gen#{gen}: OK in {time.time() - t0:.1f}s · mp4 {len(vbody)} bytes "
              f"ct={ct} cors={aca!r}")
        if not aca:
            failures.append(f"gen#{gen} mp4 missing CORS header")
        if gen == 1:
            with open("probe_output.mp4", "wb") as f:
                f.write(vbody)
        return True
    except Exception as e:
        print(f"  gen#{gen}: mp4 fetch FAILED {type(e).__name__}: {e}")
        failures.append(f"gen#{gen} mp4 fetch: {e}")
        return False


def main() -> int:
    print(f"Space : {SPACE}")
    print(f"Origin: {ORIGIN}")
    print(f"Gens  : {GENS}")
    probe_mirrors()
    cfg, prefix = probe_config()
    probe_info()
    probe_cors(prefix)

    hr(f"4) {GENS} consecutive anonymous generations")
    png = make_png()
    ok = 0
    for gen in range(1, GENS + 1):
        if run_generation(prefix, gen, png):
            ok += 1
        time.sleep(2)
    print(f"\n  generations succeeded: {ok}/{GENS}")
    if ok < GENS:
        failures.append(f"only {ok}/{GENS} generations succeeded")

    hr("SUMMARY")
    if failures:
        print("FAILURES:")
        for f in failures:
            print("  - " + f)
        return 1
    print("ALL PROBES PASSED ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())
