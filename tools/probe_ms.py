#!/usr/bin/env python3
"""
ModelScope probe: is there a SECOND free anonymous quota pool for Wan I2V?

ModelScope (modelscope.cn) hosts official Wan studios as Gradio apps behind a
proxy path. If their Gradio API answers anonymously with permissive CORS, the
fleet gains a quota pool that is completely independent of Hugging Face.
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
import urllib.request
import uuid
import zlib

ORIGIN = os.environ.get("PROBE_ORIGIN", "https://darthjarjar345.github.io")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0.0.0 Safari/537.36")

CANDIDATES = [
    "https://modelscope.cn/studios/Wan-AI/Wan2.2-I2V-A14B",
    "https://modelscope.cn/studios/iic/Wan2.2-I2V-A14B",
    "https://modelscope.cn/studios/Wan-AI/Wan2.1-I2V-14B",
    "https://modelscope.cn/studios/iic/Wan2.1-I2V-14B",
    "https://modelscope.cn/studios/Wan-AI/Wan2.2-I2V",
]


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
            px = (255, 236, 170) if d < 0.22 else (
                int(24 + 90 * (y / h)), int(60 + 130 * (1 - y / h)), int(120 + 120 * (1 - y / h)))
            raw += bytes(px)

    def chunk(tag, payload):
        c = struct.pack(">I", len(payload)) + tag + payload
        return c + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)

    p = b"\x89PNG\r\n\x1a\n"
    p += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    p += chunk(b"IDAT", zlib.compress(bytes(raw), 6))
    p += chunk(b"IEND", b"")
    return p


def find_gradio_root(page_url):
    """Fetch the studio page and locate the gradio app root / config."""
    try:
        r = req(page_url, timeout=60)
        html = r.read(2_000_000).decode("utf-8", "replace")
    except Exception as e:
        print(f"  page fetch failed: {type(e).__name__}: {str(e)[:100]}")
        return None
    m = re.search(r'(https?://[a-z0-9./_-]*?/gradio)/?', html)
    if m:
        return m.group(1).rstrip("/")
    # common proxy layouts
    for cand in (page_url.rstrip("/") + "/gradio",
                 page_url.rstrip("/") + "/api/gradio",
                 page_url.replace("/studios/", "/api/v1/studios/") + "/gradio"):
        try:
            rr = req(cand + "/config", timeout=45)
            if rr.status == 200:
                json.loads(rr.read())
                return cand
        except Exception:
            continue
    return None


def main():
    png = make_png()
    data_url = "data:image/png;base64," + base64.b64encode(png).decode()
    found = []
    hr("1) locate Gradio roots behind ModelScope studios")
    for page in CANDIDATES:
        root = find_gradio_root(page)
        print(f"  {page} -> gradio root: {root}", flush=True)
        if not root:
            continue
        try:
            cfg = json.loads(req(root + "/config", timeout=60,
                                 headers={"Origin": ORIGIN}).read())
        except Exception as e:
            print(f"      config fail: {type(e).__name__}: {str(e)[:100]}")
            continue
        comps = {c.get("id"): c for c in cfg.get("components", [])}
        target = None
        for i, d in enumerate(cfg.get("dependencies", [])):
            ins = [comps.get(x) for x in d.get("inputs", []) if comps.get(x)]
            outs = [comps.get(x) for x in d.get("outputs", []) if comps.get(x)]
            if any(c.get("type") == "image" for c in ins) and any(
                c.get("type") == "video" for c in outs):
                params = [(c.get("type"), str((c.get("props") or {}).get("label") or
                           (c.get("props") or {}).get("name") or c.get("type"))) for c in ins]
                target = (i, params)
                break
        if not target:
            print("      no i2v dep")
            continue
        # CORS preflight
        try:
            pr = req(root + "/gradio_api/queue/join", method="OPTIONS",
                     headers={"Origin": ORIGIN, "Access-Control-Request-Method": "POST",
                              "Access-Control-Request-Headers": "content-type"}, timeout=45)
            aca = pr.headers.get("Access-Control-Allow-Origin")
            print(f"      preflight /gradio_api/queue/join -> {pr.status} allow-origin={aca!r}")
        except urllib.error.HTTPError as e:
            aca = e.headers.get("Access-Control-Allow-Origin")
            print(f"      preflight -> HTTP {e.code} allow-origin={aca!r}")
        except Exception as e:
            aca = None
            print(f"      preflight fail {type(e).__name__}")
        found.append((page, root, target[0], target[1], aca))

    hr("2) anonymous generation test on each reachable root")
    for page, root, fn, params, aca in found:
        t0 = time.time()
        data = []
        for comp, label in params:
            k = label.lower()
            if comp == "image":
                data.append({"path": None, "url": data_url, "orig_name": "p.png",
                             "mime_type": "image/png", "size": len(png),
                             "is_stream": False, "meta": {"_type": "gradio.FileData"}})
            elif "negative" in k: data.append("")
            elif "prompt" in k: data.append("a lone figure walks toward the sunset")
            elif "random" in k: data.append(False)
            elif "seed" in k: data.append(42)
            elif "step" in k: data.append(4)
            elif "duration" in k or "second" in k: data.append(0.5)
            elif "guidance" in k: data.append(1)
            else: data.append(None)
        session = uuid.uuid4().hex[:16]
        payload = {"data": data, "session_hash": session, "fn_index": fn}
        ok = False
        for prefix in ("/gradio_api", ""):
            try:
                r = req(root + prefix + "/queue/join", method="POST",
                        data=json.dumps(payload).encode(),
                        headers={"Origin": ORIGIN, "Content-Type": "application/json"},
                        timeout=90)
                join = json.loads(r.read())
            except Exception as e:
                print(f"      join{prefix} fail: {type(e).__name__}: {str(e)[:100]}")
                continue
            try:
                sse = req(root + prefix + f"/queue/data?session_hash={session}",
                          headers={"Origin": ORIGIN, "Accept": "text/event-stream"},
                          timeout=300)
            except Exception as e:
                print(f"      sse fail: {type(e).__name__}")
                continue
            for raw in sse:
                line = raw.decode("utf-8", "replace").rstrip("\r\n")
                if not line.startswith("data:"):
                    continue
                try:
                    msg = json.loads(line[5:].strip())
                except Exception:
                    continue
                if msg.get("msg") == "process_completed":
                    out = msg.get("output") or {}
                    d = out.get("data")
                    err = str(out.get("error") or "")[:160]
                    if d:
                        print(f"  GEN OK {page} prefix={prefix} in {time.time()-t0:.1f}s "
                              f"cors={aca!r}")
                        ok = True
                    else:
                        print(f"  GEN FAIL {page}: {err}")
                    break
            sse.close()
            if ok:
                break
        if not ok:
            print(f"  GEN FAIL {page}: no completion")

    hr("SUMMARY")
    if found:
        for page, root, fn, params, aca in found:
            print(f"   - {page} root={root} fn={fn} cors={aca!r}")
            print(f"     params={params}")
    else:
        print("  no reachable ModelScope gradio roots")
    return 0


if __name__ == "__main__":
    sys.exit(main())
