# H3/LTX fleet expansion report

- run: 38150484826.1 · ref: arena/50b14632-reyloai
- utc: 2026-10-11T15:38:40Z

```text

==============================================================================
### 1) discover video engines across 35 candidate spaces
==============================================================================
  I2V MiniMaxAI/MiniMax-H3-Turbo-Lora  hw=zero-a10g fn=4 api=output_video gradio=6.25.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('textbox', 'Canvas'), ('number', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample Prompt'), ('textbox', 'LoRA')]
  I2V akhaliq/MiniMax-H3-Turbo-Lora  hw=zero-a10g fn=4 api=output_video gradio=6.25.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('textbox', 'Canvas'), ('number', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample Prompt'), ('textbox', 'LoRA')]
  I2V abidlabs/MiniMax-H3-Turbo-Lora  hw=zero-a10g fn=4 api=output_video gradio=6.24.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('textbox', 'Canvas'), ('number', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample Prompt'), ('textbox', 'LoRA')]
  I2V multimodalart/minimax-h3-audio-to-video  hw=zero-a10g fn=3 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('audio', 'Soundtrack'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample prompt')]
  I2V prithivMLmods/MiniMax-H3-Turbo-LoRA-Fast  hw=zero-a10g fn=9 api=generate gradio=6.28.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('dropdown', 'Canvas'), ('slider', 'Length (s)'), ('radio', 'Duration mode'), ('slider', 'Steps'), ('number', 'Seed (clip i = seed + i)'), ('checkbox', 'Prompt upsampling (+15–50s)'), ('dropdown', 'Turbo/Style-LoRA'), ('checkbox', 'Generate audio'), ('slider', 'GPU Duration (s per clip)')]
  --   boltguo/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   jli1122/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   raubatz/minimax-h3-ultra-fast  hw=cpu-basic (wake timeout)
  --   slymun/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   ramu23/minimax-h3-i2v-r2v-nvfp4-cn  hw=zero-a10g (wake timeout)
  I2V owenisas/minimax-h3-fl2va  hw=zero-a10g fn=0 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('image', 'Last frame'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('file', 'file'), ('textbox', 'textbox'), ('textbox', 'textbox')]
  T2V ifroyou/minimax-h3-ref2va-sketch-p15b  hw=zero-a10g fn=22 api=generate_p15b gradio=6.20.0
       params=[('textbox', 'textbox'), ('textbox', 'textbox'), ('file', 'file'), ('file', 'file'), ('file', 'file'), ('file', 'file'), ('file', 'file')]
  I2V ysharma/gr-workflow-h3-zerogpu  hw=zero-a10g fn=4 api=video_soundtrack gradio=6.22.0
       params=[('image', 'Image'), ('textbox', 'Motion prompt')]
  --   LLMhacker/MiniMax-H3-video-generator  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   akshat2512/MiniMax-H3-video-generator  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   mc8126/minimax-h3-turbo-demo  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  I2V mpasila/minimax-h3-reference-4-step-lora  hw=zero-a10g fn=18 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'Subject, style or scene'), ('audio', 'A voice or a piece of music'), ('video', 'Motion & camera, 2–15 s. Its soundtrack comes along.'), ('dropdown', 'Canvas'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('image', 'Subject, style or scene'), ('checkbox', 'Match the reference soundtrack'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample prompt'), ('textbox', 'LoRA 1'), ('slider', 'Strength'), ('textbox', 'LoRA 2'), ('slider', 'Strength'), ('textbox', 'LoRA 3'), ('slider', 'Strength')]
  I2V AlexSinHF/MiniMax-H3-Turbo-Loras  hw=zero-a10g fn=61 api=run gradio=6.24.0
       params=[('textbox', 'textbox'), ('image', 'First frame'), ('image', 'Last frame'), ('radio', 'radio'), ('slider', 'Megapixels'), ('radio', 'Upscale (two-pass)'), ('slider', 'Draft steps (two-pass)'), ('dropdown', 'Refine ladder (two-pass)'), ('checkbox', 'Stop after the draft (diagnostic)'), ('slider', 'Duration (seconds)'), ('slider', 'Steps'), ('number', 'Seed'), ('checkbox', 'Random seed'), ('dropdown', 'dropdown'), ('textbox', 'textbox'), ('slider', 'Weight'), ('dropdown', 'dropdown'), ('textbox', 'textbox'), ('slider', 'Weight'), ('dropdown', 'dropdown'), ('textbox', 'textbox'), ('slider', 'Weight'), ('dropdown', 'dropdown'), ('textbox', 'textbox'), ('slider', 'Weight'), ('dropdown', 'dropdown'), ('textbox', 'textbox'), ('slider', 'Weight')]
  --   vml12/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   rahul7star/MiniMax-H3-Turbo-Lora  hw=cpu-basic (wake timeout)
  I2V zakirovrinatik/minimax-h3-audio-to-video  hw=zero-a10g fn=3 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('audio', 'Soundtrack'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample prompt')]
  I2V owenisas/minimax-h3-profile-larry  hw=zero-a10g fn=0 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('image', 'Last frame'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('file', 'file'), ('textbox', 'textbox'), ('textbox', 'textbox')]
  --   jameshuntercarter/minimax-h3-ultra-fast  hw=l40sx1 (wake timeout)
  --   bened/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   FelipeAzambuja/MiniMax-H3-Turbo-Lora-Demo  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  I2V hugging-apps/h3-world-action-demo  hw=zero-a10g fn=7 api=generate gradio=6.26.0
       params=[('textbox', 'Scene description'), ('image', 'First frame'), ('textbox', 'Action script'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('textbox', 'Subject'), ('checkbox', 'Directed attention mask'), ('radio', 'Sampling')]
  --   amisima/LTX_2.5_Turbo_Studio  hw=zero-a10g (dead cert)
  --   ZeroCollabs/LTX-2.3-turbo  hw=zero-a10g (dead cert)
  --   Phamthihong/LTX-2.3-turbo  hw=zero-a10g (dead cert)
  --   rahul7star/LTX-2.3-turbo  hw=cpu-basic (dead cert)
  --   Imosu/LTX-2.3-turboX  hw=zero-a10g (dead cert)
  T2V DeepRat/LTX-Video-ZeroGPU-Optimized  hw=zero-a10g fn=6 api=text_to_video gradio=5.49.1
       params=[('textbox', 'Prompt'), ('textbox', 'Negative Prompt'), ('textbox', 'image_n'), ('textbox', 'video_n'), ('slider', 'Height'), ('slider', 'Width'), ('dropdown', 'task'), ('slider', 'Video Duration (seconds)'), ('slider', 'Frames to use from input video'), ('number', 'Seed'), ('checkbox', 'Randomize Seed'), ('slider', 'Guidance Scale (CFG)'), ('checkbox', 'Improve Texture (multi-scale)'), ('checkbox', '🎬 Slow Motion')]
  I2V DeepRat/LTX-Video-ZeroGPU-Optimized  hw=zero-a10g fn=7 api=image_to_video gradio=5.49.1
       params=[('textbox', 'Prompt'), ('textbox', 'Negative Prompt'), ('image', 'Upload your image'), ('textbox', 'video_i'), ('slider', 'Height'), ('slider', 'Width'), ('dropdown', 'task'), ('slider', 'Video Duration (seconds)'), ('slider', 'Frames to use from input video'), ('number', 'Seed'), ('checkbox', 'Randomize Seed'), ('slider', 'Guidance Scale (CFG)'), ('checkbox', 'Improve Texture (multi-scale)'), ('checkbox', '🎬 Slow Motion')]
  T2V DeepRat/LTX-Video-ZeroGPU-Optimized  hw=zero-a10g fn=8 api=video_to_video gradio=5.49.1
       params=[('textbox', 'Prompt'), ('textbox', 'Negative Prompt'), ('textbox', 'image_v'), ('video', 'Input Video'), ('slider', 'Height'), ('slider', 'Width'), ('dropdown', 'task'), ('slider', 'Video Duration (seconds)'), ('slider', 'Frames to use from input video'), ('number', 'Seed'), ('checkbox', 'Randomize Seed'), ('slider', 'Guidance Scale (CFG)'), ('checkbox', 'Improve Texture (multi-scale)'), ('checkbox', '🎬 Slow Motion')]
  T2V yuvraj108c/ltx25-bbox-control-demo  hw=zero-a10g fn=5 api=generate gradio=6.26.0
       params=[('textbox', 'Prompt'), ('textbox', 'Objects'), ('slider', 'Box prompt weight'), ('slider', 'Global prompt weight'), ('textbox', 'Negative prompt'), ('number', 'Seed'), ('checkbox', 'Randomize')]
  T2V yuvraj108c/ltx25-bbox-control-demo  hw=zero-a10g fn=6 api=preview_control gradio=6.26.0
       params=[('textbox', 'Objects')]
  I2V OpenKing/wan2-video-generation  hw=cpu-basic fn=1 api=generate_video gradio=5.49.0
       params=[('textbox', 'Prompt'), ('image', 'Input Image (Optional - for Image-to-Video)'), ('slider', 'Width'), ('slider', 'Height'), ('slider', 'Number of Frames (more frames = longer video)'), ('slider', 'Inference Steps (more steps = better quality, slower)'), ('slider', 'Guidance Scale (higher = closer to prompt)'), ('number', 'Seed (-1 for random)')]
  --   Artist89/wan2-video-generation  hw=cpu-basic (wake timeout)

  discovered 19 video engines (14 i2v / 5 t2v)

==============================================================================
### 2) anonymous minimal generation test (first 6, prefer non-zerogpu)
==============================================================================
  GEN FAIL MiniMaxAI/MiniMax-H3-Turbo-Lora hw=zero-a10g kind=i2v: ERROR float() argument must be a string or a real number, not 'NoneType'
  GEN FAIL akhaliq/MiniMax-H3-Turbo-Lora hw=zero-a10g kind=i2v: ERROR float() argument must be a string or a real number, not 'NoneType'
  GEN FAIL abidlabs/MiniMax-H3-Turbo-Lora hw=zero-a10g kind=i2v: ERROR float() argument must be a string or a real number, not 'NoneType'
  GEN FAIL multimodalart/minimax-h3-audio-to-video hw=zero-a10g kind=i2v: sse deadline
  GEN FAIL prithivMLmods/MiniMax-H3-Turbo-LoRA-Fast hw=zero-a10g kind=i2v: sse deadline
  GEN FAIL owenisas/minimax-h3-fl2va hw=zero-a10g kind=i2v: ERROR Internal conditioner hops are disabled because caller ZeroGPU attribution cannot be forwarded. Use the authenticated two-stage runner.

==============================================================================
### SUMMARY — registry candidates
==============================================================================
   - MiniMaxAI/MiniMax-H3-Turbo-Lora  hw=zero-a10g  fn=4  kind=i2v  api=output_video  verdict=ERROR    cors=None
   - akhaliq/MiniMax-H3-Turbo-Lora  hw=zero-a10g  fn=4  kind=i2v  api=output_video  verdict=ERROR    cors=None
   - abidlabs/MiniMax-H3-Turbo-Lora  hw=zero-a10g  fn=4  kind=i2v  api=output_video  verdict=ERROR    cors=None
   - multimodalart/minimax-h3-audio-to-video  hw=zero-a10g  fn=3  kind=i2v  api=generate  verdict=sse    cors=None
   - prithivMLmods/MiniMax-H3-Turbo-LoRA-Fast  hw=zero-a10g  fn=9  kind=i2v  api=generate  verdict=sse    cors=None
   - owenisas/minimax-h3-fl2va  hw=zero-a10g  fn=0  kind=i2v  api=generate  verdict=ERROR    cors=None
```
