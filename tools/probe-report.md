# Space API probe report

- run: 38096113057 / attempt 1
- ref: arena/50b14632-reyloai
- sha: 56bf2d98bd67cf11d5e3547d7762183208406ef8
- utc: 2026-10-10T23:46:05Z

```text
Space : https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space
Origin: https://darthjarjar345.github.io
Gens  : 4

==============================================================================
### 0) Public mirror content-type check (which URL is a REAL website?)
==============================================================================
  jsdelivr       HTTP 200  content-type='text/plain; charset=utf-8'  -> NOT-HTML  interstitial=False  ours=True
      first bytes: b'<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Reylo AI Video Generator \xe2\x80\x94 free AI image-to-video (Wa'
  jsdelivr-htm   HTTP 404  content-type='text/plain; charset=utf-8'
  statically     HTTP 200  content-type='text/plain; charset=utf-8'  -> NOT-HTML  interstitial=False  ours=True
      first bytes: b'<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Reylo AI Video Generator \xe2\x80\x94 free AI image-to-video (Wa'
  githack-raw    HTTP 200  content-type='text/html; charset=utf-8'  -> WEBSITE  interstitial=False  ours=True
  githack-cdn    HTTP 200  content-type='text/html; charset=utf-8'  -> WEBSITE  interstitial=False  ours=True
  githack-apex   HTTP 200  content-type='text/html; charset=utf-8'  -> WEBSITE  interstitial=False  ours=True
  gh-raw         HTTP 200  content-type='text/plain; charset=utf-8'  -> NOT-HTML  interstitial=False  ours=True
      first bytes: b'<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Reylo AI Video Generator \xe2\x80\x94 free AI image-to-video (Wa'
  githack-css    HTTP 200  content-type='text/css; charset=utf-8'  -> NOT-HTML  interstitial=False  ours=True
      first bytes: b'/* ================================================================\n   Reylo AI Video Generator \xe2\x80\x94 design system\n   deep-space dark \xc2\xb7 dual-saber gradient (blue \xe2\x87\x84 red) \xc2\xb7 glass panels\n   =========='
  githack-js     HTTP 200  content-type='application/javascript; charset=utf-8'  -> NOT-HTML  interstitial=False  ours=True
      first bytes: b'/**\n * Reylo AI Video Generator \xe2\x80\x94 application logic.\n * 100% client-side: the browser talks straight to the Hugging Face Space\n * (Wan 2.2 14B Fast, ZeroGPU). No backend, no keys, no cost.\n */\n\nimpo'

==============================================================================
### 1) GET config (anonymous, browser Origin)
==============================================================================
  /gradio_api/config -> HTTP 404
  config served at: /config
  HTTP 200  api_prefix='/gradio_api' -> '/gradio_api'  protocol='sse_v3'  gradio=6.1.0
  auth_required=None  space_id=zerogpu-aoti/wan2-2-fp8da-aoti-faster
  access-control-allow-credentials: true
  access-control-allow-origin: https://darthjarjar345.github.io
  access-control-expose-headers: *
    dep[0] api_name='generate_video' queue=True
    dep[1] api_name='load_example_input' queue=False
    dep[2] api_name='load_example' queue=True

==============================================================================
### 2) GET /gradio_api/info
==============================================================================
  HTTP 200  endpoints=['/generate_video']
    /generate_video: visibility=public params=['input_image', 'prompt', 'steps', 'negative_prompt', 'duration_seconds', 'guidance_scale', 'guidance_scale_2', 'seed', 'randomize_seed']

==============================================================================
### 3) CORS preflights (queue/join + upload)
==============================================================================
  OPTIONS /queue/join -> HTTP 200  allow-origin='https://darthjarjar345.github.io'
  OPTIONS /upload?upload_id=probe -> HTTP 200  allow-origin='https://darthjarjar345.github.io'

==============================================================================
### 4) 4 consecutive anonymous generations
==============================================================================
  gen#1: joined event_id=a1bf99fabae64ccf9287fdb64df32239
    [  0.1s] estimation rank=0 eta=51.09771602294024
    [  0.1s] process_starts rank=None eta=51.09771602294024
    [  1.1s] progress 10 desc=ZeroGPU init
    [  1.4s] progress 20 desc=ZeroGPU init
    [  1.7s] progress 21 desc=ZeroGPU init
    [  1.7s] progress 22 desc=ZeroGPU init
    [  1.7s] progress 23 desc=ZeroGPU init
    [  1.8s] progress 24 desc=ZeroGPU init
    [  1.8s] progress 25 desc=ZeroGPU init
    [  1.8s] progress 26 desc=ZeroGPU init
    [  1.8s] progress 27 desc=ZeroGPU init
    [  1.8s] progress 28 desc=ZeroGPU init
    [  1.9s] progress 29 desc=ZeroGPU init
    [  1.9s] progress 30 desc=ZeroGPU init
    [  1.9s] progress 31 desc=ZeroGPU init
    [  1.9s] progress 32 desc=ZeroGPU init
    [  2.0s] progress 33 desc=ZeroGPU init
    [  2.0s] progress 34 desc=ZeroGPU init
    [  2.0s] progress 35 desc=ZeroGPU init
    [  2.0s] progress 36 desc=ZeroGPU init
    [  2.1s] progress 37 desc=ZeroGPU init
    [  2.1s] progress 38 desc=ZeroGPU init
    [  2.1s] progress 39 desc=ZeroGPU init
    [  2.1s] progress 40 desc=ZeroGPU init
    [  2.2s] progress 41 desc=ZeroGPU init
    [  2.2s] progress 42 desc=ZeroGPU init
    [  2.2s] progress 43 desc=ZeroGPU init
    [  2.2s] progress 44 desc=ZeroGPU init
    [  2.3s] progress 45 desc=ZeroGPU init
    [  2.3s] progress 46 desc=ZeroGPU init
    [  2.3s] progress 47 desc=ZeroGPU init
    [  2.3s] progress 48 desc=ZeroGPU init
    [  2.3s] progress 49 desc=ZeroGPU init
    [  2.4s] progress 50 desc=ZeroGPU init
    [  2.4s] progress 51 desc=ZeroGPU init
    [  2.4s] progress 52 desc=ZeroGPU init
    [  2.4s] progress 53 desc=ZeroGPU init
    [  2.5s] progress 54 desc=ZeroGPU init
    [  2.5s] progress 55 desc=ZeroGPU init
    [  2.5s] progress 56 desc=ZeroGPU init
    [  2.5s] progress 57 desc=ZeroGPU init
    [  2.6s] progress 58 desc=ZeroGPU init
    [  2.6s] progress 59 desc=ZeroGPU init
    [  2.6s] progress 60 desc=ZeroGPU init
    [  2.6s] progress 61 desc=ZeroGPU init
    [  2.7s] progress 62 desc=ZeroGPU init
    [  2.7s] progress 63 desc=ZeroGPU init
    [  2.7s] progress 64 desc=ZeroGPU init
    [  2.7s] progress 65 desc=ZeroGPU init
    [  2.8s] progress 66 desc=ZeroGPU init
    [  2.8s] progress 67 desc=ZeroGPU init
    [  2.8s] progress 68 desc=ZeroGPU init
    [  2.8s] progress 69 desc=ZeroGPU init
    [  2.8s] progress 70 desc=ZeroGPU init
    [  2.9s] progress 71 desc=ZeroGPU init
    [  2.9s] progress 72 desc=ZeroGPU init
    [  2.9s] progress 73 desc=ZeroGPU init
    [  2.9s] progress 74 desc=ZeroGPU init
    [  3.0s] progress 75 desc=ZeroGPU init
    [  3.0s] progress 76 desc=ZeroGPU init
    [  3.0s] progress 77 desc=ZeroGPU init
    [  3.0s] progress 78 desc=ZeroGPU init
    [  3.1s] progress 79 desc=ZeroGPU init
    [  3.1s] progress 80 desc=ZeroGPU init
    [  3.1s] progress 81 desc=ZeroGPU init
    [  3.1s] progress 82 desc=ZeroGPU init
    [  3.2s] progress 83 desc=ZeroGPU init
    [  3.2s] progress 84 desc=ZeroGPU init
    [  3.2s] progress 85 desc=ZeroGPU init
    [  3.2s] progress 86 desc=ZeroGPU init
    [  3.3s] progress 87 desc=ZeroGPU init
    [  3.3s] progress 88 desc=ZeroGPU init
    [  3.3s] progress 89 desc=ZeroGPU init
    [  3.4s] progress 90 desc=ZeroGPU init
    [  3.4s] progress 91 desc=ZeroGPU init
    [  3.4s] progress 92 desc=ZeroGPU init
    [  3.4s] progress 93 desc=ZeroGPU init
    [  3.5s] progress 94 desc=ZeroGPU init
    [  3.5s] progress 95 desc=ZeroGPU init
    [  3.5s] progress 96 desc=ZeroGPU init
    [  3.5s] progress 97 desc=ZeroGPU init
    [  3.6s] progress 98 desc=ZeroGPU init
    [  3.6s] progress 99 desc=ZeroGPU init
    [  3.6s] progress 100 desc=ZeroGPU init
    [  3.6s] progress None desc=None
    [  4.6s] progress 0 desc=None
    [  5.3s] progress 1 desc=None
    [  5.8s] progress 2 desc=None
    [  6.4s] progress 3 desc=None
    [  7.0s] progress None desc=None
    [  8.1s] process_completed success=None data_len=2 error='None'
  gen#1: OK in 8.2s · mp4 34846 bytes ct=video/mp4 cors='https://darthjarjar345.github.io'
  gen#2: joined event_id=d45840335e44448f84b87f6feeadb288
    [  0.2s] estimation rank=0 eta=50.9175765903425
    [  0.2s] process_starts rank=None eta=50.9175765903425
    [  0.7s] progress 0 desc=None
    [  1.3s] progress 1 desc=None
    [  1.8s] progress 2 desc=None
    [  2.4s] progress 3 desc=None
    [  2.9s] progress None desc=None
    [  3.9s] process_completed success=None data_len=2 error='None'
  gen#2: OK in 4.0s · mp4 34846 bytes ct=video/mp4 cors='https://darthjarjar345.github.io'
  gen#3: joined event_id=178625d136dd4d9baab8f0d44d936756
    [  0.1s] estimation rank=0 eta=50.721432913343115
    [  0.1s] process_starts rank=None eta=50.721432913343115
    [  0.7s] progress 0 desc=None
    [  1.4s] progress 1 desc=None
    [  1.9s] progress 2 desc=None
    [  2.5s] progress 3 desc=None
    [  3.0s] progress None desc=None
    [  4.0s] process_completed success=None data_len=2 error='None'
  gen#3: OK in 4.1s · mp4 34846 bytes ct=video/mp4 cors='https://darthjarjar345.github.io'
  gen#4: joined event_id=dc8fff18fc4241feb6b085f8ad9b285c
    [  0.2s] estimation rank=0 eta=50.527188019139146
    [  0.2s] process_starts rank=None eta=50.527188019139146
    [  0.2s] process_completed success=None data_len=None error='You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens'
  gen#4: NO VIDEO URL. full process_completed payload:
    {"msg": "process_completed", "event_id": "dc8fff18fc4241feb6b085f8ad9b285c", "output": {"error": "You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens", "duration": 10, "visible": true, "title": "ZeroGPU quota exceeded"}, "success": false, "title": "ZeroGPU quota exceeded"}

  generations succeeded: 3/4

==============================================================================
### SUMMARY
==============================================================================
FAILURES:
  - jsdelivr serves index.html as non-HTML
  - jsdelivr serves index.html as non-HTML
  - gen#4 completed without video url
  - only 3/4 generations succeeded
```
total 36
-rw-r--r-- 1 runner runner 34846 Oct 10 23:46 probe_output.mp4
