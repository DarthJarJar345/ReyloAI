# Space API probe report

- run: 38084379947 / attempt 1
- ref: arena/50b14632-reyloai
- sha: 6903d94101a38893fa088eb95791ce04c732f7a3
- utc: 2026-10-10T20:36:08Z

```text
Space : https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space
Origin: https://darthjarjar345.github.io

==============================================================================
### 1) GET /gradio_api/config  (anonymous, with browser Origin)
==============================================================================
  /gradio_api/config -> HTTP 404
  config served at: /config
  HTTP 200  in 0.4s
  access-control-allow-credentials: true
  access-control-allow-origin: https://darthjarjar345.github.io
  access-control-expose-headers: *
  gradio version : 6.1.0
  auth_required  : None
  auth_message   : None
  enable_queue   : True
  max_file_size: None
  #dependencies  : 3
    [0] api_name='generate_video' inputs=9 outputs=2 queue=True
    [1] api_name='load_example_input' inputs=1 outputs=3 queue=False
    [2] api_name='load_example' inputs=1 outputs=2 queue=True

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
    dep[0] api_name='generate_video'
    dep[1] api_name='load_example_input'
    dep[2] api_name='load_example'
  using fn_index = 0
  queue/join -> HTTP 405
  access-control-allow-origin: https://darthjarjar345.github.io
  access-control-expose-headers: *
  body: {"type":"error","error":{"message":"Method Not Allowed"}}

==============================================================================
### SUMMARY
==============================================================================
FAILURES:
  - queue/join HTTP 405: {"type":"error","error":{"message":"Method Not Allowed"}}
```
