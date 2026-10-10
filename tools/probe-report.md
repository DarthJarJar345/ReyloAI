# Space API probe report

- run: 38084237457 / attempt 1
- ref: arena/50b14632-reyloai
- sha: fdc25ef8643b2c8425688d9195e22f0c6951f06c
- utc: 2026-10-10T20:33:57Z

```text
Space : https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space
Origin: https://darthjarjar345.github.io

==============================================================================
### 1) GET /gradio_api/config  (anonymous, with browser Origin)
==============================================================================
  FAILED: HTTPError: HTTP Error 404: Not Found

==============================================================================
### 2) GET /gradio_api/info  (named endpoints)
==============================================================================
  HTTP 200  endpoints: ['/generate_video']
    /generate_video
      params: ['input_image', 'prompt', 'steps', 'negative_prompt', 'duration_seconds', 'guidance_scale', 'guidance_scale_2', 'seed', 'randomize_seed']
      returns: ['Generated Video', 'Seed']
      api_visibility: public

==============================================================================
### 3) CORS preflight OPTIONS /gradio_api/queue/join
==============================================================================
  HTTP 200
  access-control-allow-methods: POST
  access-control-allow-headers: content-type
  access-control-max-age: 600
  access-control-allow-origin: https://darthjarjar345.github.io

==============================================================================
### 3b) CORS preflight OPTIONS /gradio_api/upload
==============================================================================
  HTTP 200
  access-control-allow-methods: POST
  access-control-allow-headers: content-type
  access-control-max-age: 600
  access-control-allow-origin: https://darthjarjar345.github.io

==============================================================================
### 4) Anonymous end-to-end generation via /queue/join + SSE /queue/data
==============================================================================
  test image: 2335 bytes 512x288
  queue/join -> HTTP 400
  access-control-allow-credentials: true
  access-control-allow-origin: https://darthjarjar345.github.io
  access-control-expose-headers: *
  body: {"detail":"No function index provided."}

==============================================================================
### SUMMARY
==============================================================================
FAILURES:
  - config request failed: HTTP Error 404: Not Found
  - queue/join HTTP 400: {"detail":"No function index provided."}
```
