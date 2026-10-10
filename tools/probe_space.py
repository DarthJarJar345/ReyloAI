#!/usr/bin/env python3
"""
Probe the zerogpu-aoti/wan2-2-fp8da-aoti-faster Hugging Face Space to verify:
  1. The Gradio API is reachable anonymously (no HF token).
  2. CORS headers allow a static website (GitHub Pages origin) to call it from a browser.
  3. A full image-to-video generation round-trip works and returns a playable mp4 URL.

Run with: python3 tools/probe_space.py [--skip-generate]
"""

from __future__ import annotations

import base64
import io
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
API = SPACE + "/gradio_api"
ORIGIN = os.environ.get("PROBE_ORIGIN", "https://darthjarjar345.github.io")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")


def hr(title: str) -> None:
    print("\n" + "=" * 78)
    print("### " + title)
    print("=" * 78, flush=True)


def request(url, method="GET", data=None, headers=None, timeout=60, stream=False):
    hdrs = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    resp = urllib.request.urlopen(req, timeout=timeout)
    if stream:
        return resp
    body = resp.read()
    return resp, body


def show_cors(resp) -> None:
    for h in resp.headers.keys():
        if h.lower().startswith("access-control"):
            print(f"  {h}: {resp.headers[h]}")


def make_png(width=512, height=288):
    """Hand-rolled PNG (no PIL dependency): a gradient sky with a sun disc."""
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter: none
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


def main() -> int:
    skip_generate = "--skip-generate" in sys.argv
    print(f"Space : {SPACE}")
    print(f"Origin: {ORIGIN}")
    failures = []

    # ---------------------------------------------------------------- 1. config
    hr("1) GET /gradio_api/config  (anonymous, with browser Origin)")
    t0 = time.time()
    cfg = {}
    prefix = "/gradio_api"
    try:
        resp = None
        body = None
        for cand in ("/gradio_api/config", "/config"):
            try:
                resp, body = request(SPACE + cand, headers={"Origin": ORIGIN}, timeout=120)
                prefix = "/gradio_api" if cand.startswith("/gradio_api") else ""
                print(f"  config served at: {cand}")
                break
            except urllib.error.HTTPError as e:
                print(f"  {cand} -> HTTP {e.code}")
                resp = None
        if resp is None:
            raise RuntimeError("no config endpoint answered")
        cfg = json.loads(body)
        print(f"  HTTP {resp.status}  in {time.time() - t0:.1f}s")
        show_cors(resp)
        print(f"  gradio version : {cfg.get('version')}")
        print(f"  auth_required  : {cfg.get('auth_required')}")
        print(f"  auth_message   : {cfg.get('auth_message')}")
        print(f"  enable_queue   : {cfg.get('enable_queue')}")
        print(f"  max_file_size: {cfg.get('max_file_size')}")
        deps = cfg.get("dependencies", [])
        print(f"  #dependencies  : {len(deps)}")
        for i, d in enumerate(deps):
            print(f"    [{i}] api_name={d.get('api_name')!r} inputs={len(d.get('inputs') or [])} "
                  f"outputs={len(d.get('outputs') or [])} queue={d.get('queue')}")
        if cfg.get("auth_required"):
            failures.append("config reports auth_required=True")
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        failures.append(f"config request failed: {e}")
        deps = []

    # ------------------------------------------------------------ 2. info (docs)
    hr("2) GET /gradio_api/info  (named endpoints)")
    try:
        resp, body = request(API + "/info", timeout=60)
        info = json.loads(body)
        named = info.get("named_endpoints", {})
        print(f"  HTTP {resp.status}  endpoints: {list(named)}")
        for name, ep in named.items():
            print(f"    {name}")
            print(f"      params: {[p.get('parameter_name') for p in ep.get('parameters', [])]}")
            print(f"      returns: {[r.get('label') for r in ep.get('returns', [])]}")
            print(f"      api_visibility: {ep.get('api_visibility')}")
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        failures.append(f"info request failed: {e}")

    # -------------------------------------------------------------- 3. CORS probe
    hr("3) CORS preflight OPTIONS /gradio_api/queue/join")
    try:
        resp, body = request(
            API + "/queue/join",
            method="OPTIONS",
            headers={
                "Origin": ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=60,
        )
        print(f"  HTTP {resp.status}")
        show_cors(resp)
        allow = resp.headers.get("Access-Control-Allow-Origin")
        if not allow:
            failures.append("preflight returned no Access-Control-Allow-Origin")
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}")
        show_cors(e)
        if not e.headers.get("Access-Control-Allow-Origin"):
            failures.append(f"preflight HTTP {e.code} and no CORS header")
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        failures.append(f"preflight failed: {e}")

    hr("3b) CORS preflight OPTIONS /gradio_api/upload")
    try:
        resp, _ = request(
            API + "/upload?upload_id=probe",
            method="OPTIONS",
            headers={
                "Origin": ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=60,
        )
        print(f"  HTTP {resp.status}")
        show_cors(resp)
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}")
        show_cors(e)
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")

    if skip_generate:
        hr("SKIPPED generation")
    else:
        # ---------------------------------------------------------- 4. generation
        hr("4) Anonymous end-to-end generation via /queue/join + SSE /queue/data")
        png = make_png()
        print(f"  test image: {len(png)} bytes {512}x{288}")
        data_url = "data:image/png;base64," + base64.b64encode(png).decode()
        session_hash = uuid.uuid4().hex[:16]
        payload = {
            "data": [
                {"path": None, "url": data_url, "orig_name": "probe.png",
                 "mime_type": "image/png", "size": len(png), "is_stream": False,
                 "meta": {"_type": "gradio.FileData"}},
                "a lone figure walks toward the sunset, cinematic motion, smooth animation",
                4,          # steps
                "",         # negative_prompt (space default applied server-side if blank)
                0.5,        # duration_seconds (minimum)
                1,          # guidance_scale
                1,          # guidance_scale_2
                42,         # seed
                False,      # randomize_seed
            ],
            "session_hash": session_hash,
        }
        # find the fn_index for /generate_video if present
        fn = None
        for i, d in enumerate(deps):
            print(f"    dep[{i}] api_name={d.get('api_name')!r}")
            if str(d.get("api_name") or "").lstrip("/") == "generate_video":
                fn = i
        if fn is None:
            fn = 0
        payload["fn_index"] = fn
        print(f"  using fn_index = {fn}")
        payload["endpoint"] = "/generate_video"

        t0 = time.time()
        try:
            resp, body = request(
                SPACE + prefix + "/queue/join",
                method="POST",
                data=json.dumps(payload).encode(),
                headers={"Origin": ORIGIN, "Content-Type": "application/json"},
                timeout=120,
            )
            print(f"  queue/join -> HTTP {resp.status} in {time.time() - t0:.1f}s")
            show_cors(resp)
            print(f"  body: {body[:600].decode(errors='replace')}")
        except urllib.error.HTTPError as e:
            detail = e.read()[:1500].decode(errors="replace")
            print(f"  queue/join -> HTTP {e.code}")
            show_cors(e)
            print(f"  body: {detail}")
            failures.append(f"queue/join HTTP {e.code}: {detail[:300]}")
            detail_events = []
        except Exception as e:
            print(f"  queue/join FAILED: {type(e).__name__}: {e}")
            failures.append(f"queue/join failed: {e}")
            detail_events = []
        else:
            # ------------------------------------------------------- SSE listener
            print(f"\n  listening on SSE /queue/data?session_hash={session_hash} ...")
            video_url = None
            events = []
            deadline = time.time() + 480
            try:
                sse = request(
                    SPACE + prefix + f"/queue/data?session_hash={session_hash}",
                    headers={"Origin": ORIGIN, "Accept": "text/event-stream"},
                    timeout=(60, 600) if False else 600,
                    stream=True,
                )
                show_cors(sse)
                event_name = None
                for raw in sse:
                    line = raw.decode("utf-8", "replace").rstrip("\r\n")
                    if line.startswith("event:"):
                        event_name = line[6:].strip()
                    elif line.startswith("data:"):
                        chunk = line[5:].strip()
                        if not chunk:
                            continue
                        try:
                            msg = json.loads(chunk)
                        except json.JSONDecodeError:
                            continue
                        if event_name == "heartbeat":
                            continue
                        events.append((event_name, msg))
                        slim = json.dumps(msg)[:400]
                        print(f"    [{time.time() - t0:6.1f}s] event={event_name} {slim}", flush=True)
                        if event_name == "message" and msg.get("msg") == "progress_data":
                            pass
                        if event_name in ("complete", "message") and msg.get("msg") in (
                            "process_completed", "process_full_completed"
                        ):
                            out = msg.get("output") or {}
                            data = out.get("data") or []
                            if data and isinstance(data[0], dict):
                                video_url = data[0].get("url") or data[0].get("path")
                            sse.close()
                            break
                        if msg.get("msg") == "unexpected_error":
                            failures.append(f"unexpected_error: {json.dumps(msg)[:400]}")
                            break
                        if time.time() > deadline:
                            failures.append("SSE timed out")
                            break
            except Exception as e:
                print(f"  SSE FAILED: {type(e).__name__}: {e}")
                failures.append(f"SSE failed: {e}")

            print(f"\n  total wall time: {time.time() - t0:.1f}s")
            print(f"  video_url: {video_url}")
            if video_url:
                hr("5) Fetch the generated mp4 with a browser Origin (CORS check)")
                if video_url.startswith("/"):
                    video_url = SPACE + video_url
                try:
                    vresp, vbody = request(video_url, headers={"Origin": ORIGIN}, timeout=180)
                    print(f"  HTTP {vresp.status}  {len(vbody)} bytes")
                    print(f"  Content-Type: {vresp.headers.get('Content-Type')}")
                    show_cors(vresp)
                    if not vresp.headers.get("Access-Control-Allow-Origin"):
                        print("  NOTE: no CORS header on file download "
                              "(<video src> still works; blob download may not)")
                    with open("probe_output.mp4", "wb") as f:
                        f.write(vbody)
                    print("  saved probe_output.mp4")
                except urllib.error.HTTPError as e:
                    print(f"  HTTP {e.code}: {e.read()[:300].decode(errors='replace')}")
                    failures.append(f"video fetch HTTP {e.code}")
                except Exception as e:
                    print(f"  FAILED: {type(e).__name__}: {e}")
                    failures.append(f"video fetch failed: {e}")
            else:
                failures.append("no video URL returned")

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
