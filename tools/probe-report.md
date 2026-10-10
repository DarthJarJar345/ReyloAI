# Space API probe report

- run: 38084587906 / attempt 1
- ref: arena/50b14632-reyloai
- sha: 621d3f89ad852041b46f5ea444181c3a8672d0ed
- utc: 2026-10-10T20:39:34Z

```text
Space : https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space
Origin: https://darthjarjar345.github.io

==============================================================================
### 1) GET /gradio_api/config  (anonymous, with browser Origin)
==============================================================================
  /gradio_api/config -> HTTP 404
  config served at: /config
  HTTP 200  in 0.4s
  api_prefix     : '/gradio_api' -> using '/gradio_api'
  protocol       : 'sse_v3'
  connect_heartbeat: False
  space_id       : 'zerogpu-aoti/wan2-2-fp8da-aoti-faster'
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
  queue/join -> HTTP 200 in 0.2s
  access-control-allow-credentials: true
  access-control-allow-origin: https://darthjarjar345.github.io
  access-control-expose-headers: *
  body: {"event_id":"d64ef5b61fa24c7cb1f6eb4ff0fc12ae"}

  listening on SSE /queue/data?session_hash=cca44c732ffc4855 ...
  access-control-allow-credentials: true
  access-control-allow-origin: https://darthjarjar345.github.io
  access-control-expose-headers: *
    [   0.3s] event=None {"msg": "estimation", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "rank": 0, "queue_size": 1, "rank_eta": 47.794954210690086}
    [   0.3s] event=None {"msg": "process_starts", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "eta": 47.794954210690086}
    [   0.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 10, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   0.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 20, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 20, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 21, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 21, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 21, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 22, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 22, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 23, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 23, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 23, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 24, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 24, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 24, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 25, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 25, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 26, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 26, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 26, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 27, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 27, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 27, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 27, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 28, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 28, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 28, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 29, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 29, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 29, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 30, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 30, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 31, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 31, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 32, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 32, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 32, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 33, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 33, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 34, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 34, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 34, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 35, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 35, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 36, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 36, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 37, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 37, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 37, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 38, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 38, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 39, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 39, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 39, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 40, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 40, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 41, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 41, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 41, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 42, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 42, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 42, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 43, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 43, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 44, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 44, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 44, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 45, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 45, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 45, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 46, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 46, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 47, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 47, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 47, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 47, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 48, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 48, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 49, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 49, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 49, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 50, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 50, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 51, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 51, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 52, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 52, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 52, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   1.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 53, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 53, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 53, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 54, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 54, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 54, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 55, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 55, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 55, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 56, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 56, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 56, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 57, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 57, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 57, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 57, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 58, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 58, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 59, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 59, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 60, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 60, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 60, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 60, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 61, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 61, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 62, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 62, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 62, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 62, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 63, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 63, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 64, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 64, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 64, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 65, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 65, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 66, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.3s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 66, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 66, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 67, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 67, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 68, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 68, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 69, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 69, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 69, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 70, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 70, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 71, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 71, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 72, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 72, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 73, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 73, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 73, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 74, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.5s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 74, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 75, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 75, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 75, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 76, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 76, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 77, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 77, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 78, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 78, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 79, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 79, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 79, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 80, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 80, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 81, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 81, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 81, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.7s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 82, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 82, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 83, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 83, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 84, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 84, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 84, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 85, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 85, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.8s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 86, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 86, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 87, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 87, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 87, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 88, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 88, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 89, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 89, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 89, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   2.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 90, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 90, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 91, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 91, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 92, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 92, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 93, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 93, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 93, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.0s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 94, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 94, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 95, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 95, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 95, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 96, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 96, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 97, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 97, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 98, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 98, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 99, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 99, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 100, "length": 100, "unit": "steps", "progress": null, "desc": "ZeroGPU init"}]}
    [   3.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": []}
    [   4.2s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 0, "length": 4, "unit": "steps", "progress": null, "desc": null}]}
    [   4.9s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 1, "length": 4, "unit": "steps", "progress": null, "desc": null}]}
    [   5.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 2, "length": 4, "unit": "steps", "progress": null, "desc": null}]}
    [   6.1s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": [{"index": 3, "length": 4, "unit": "steps", "progress": null, "desc": null}]}
    [   6.6s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": []}
    [   7.4s] event=None {"msg": "progress", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "progress_data": []}
    [   7.7s] event=None {"msg": "process_completed", "event_id": "d64ef5b61fa24c7cb1f6eb4ff0fc12ae", "output": {"data": [{"path": "/tmp/gradio/4bb46d07ceb2978749cfc1d595fc441b9b8dbfd8527dfc41a00bcd00aed7424b/tmpxbahwc_9.mp4", "url": "https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space/gradio_api/file=/tmp/gradio/4bb46d07ceb2978749cfc1d595fc441b9b8dbfd8527dfc41a00bcd00aed7424b/tmpxbahwc_9.mp4", "size": null, "orig_name
    [   7.7s] event=None {"msg": "close_stream", "event_id": null}

  total wall time: 7.7s
  video_url: None

==============================================================================
### SUMMARY
==============================================================================
FAILURES:
  - no video URL returned
```
