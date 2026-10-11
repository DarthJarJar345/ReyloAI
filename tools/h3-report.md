# H3/LTX fleet expansion report

- run: 38152424959.1 · ref: arena/50b14632-reyloai
- utc: 2026-10-11T16:03:20Z

```text

==============================================================================
### 1) discover video engines across 68 candidate spaces
==============================================================================
  I2V ysharma/gr-workflow-h3-zerogpu  hw=zero-a10g fn=4 api=video_soundtrack gradio=6.22.0
       params=[('image', 'Image'), ('textbox', 'Motion prompt')]
  I2V MiniMaxAI/MiniMax-H3-Turbo-Lora  hw=zero-a10g fn=4 api=output_video gradio=6.25.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('textbox', 'Canvas'), ('number', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample Prompt'), ('textbox', 'LoRA')]
  I2V akhaliq/MiniMax-H3-Turbo-Lora  hw=zero-a10g fn=4 api=output_video gradio=6.25.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('textbox', 'Canvas'), ('number', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample Prompt'), ('textbox', 'LoRA')]
  I2V abidlabs/MiniMax-H3-Turbo-Lora  hw=zero-a10g fn=4 api=output_video gradio=6.24.0
       params=[('textbox', 'Prompt'), ('image', 'First Frame (optional)'), ('image', 'Last Frame (optional)'), ('textbox', 'Canvas'), ('number', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample Prompt'), ('textbox', 'LoRA')]
  I2V zakirovrinatik/minimax-h3-audio-to-video  hw=zero-a10g fn=3 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('audio', 'Soundtrack'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample prompt')]
  I2V multimodalart/minimax-h3-audio-to-video  hw=zero-a10g fn=3 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('audio', 'Soundtrack'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('checkbox', 'Upsample prompt')]
  I2V hugging-apps/h3-world-action-demo  hw=zero-a10g fn=7 api=generate gradio=6.26.0
       params=[('textbox', 'Scene description'), ('image', 'First frame'), ('textbox', 'Action script'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('slider', 'Steps'), ('number', 'Seed'), ('textbox', 'Subject'), ('checkbox', 'Directed attention mask'), ('radio', 'Sampling')]
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
  --   boltguo/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   jli1122/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   raubatz/minimax-h3-ultra-fast  hw=cpu-basic (wake timeout)
  --   slymun/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   ramu23/minimax-h3-i2v-r2v-nvfp4-cn  hw=zero-a10g (wake timeout)
  --   LLMhacker/MiniMax-H3-video-generator  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   akshat2512/MiniMax-H3-video-generator  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   mc8126/minimax-h3-turbo-demo  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   vml12/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   rahul7star/MiniMax-H3-Turbo-Lora  hw=cpu-basic (wake timeout)
  I2V owenisas/minimax-h3-profile-larry  hw=zero-a10g fn=0 api=generate gradio=6.20.0
       params=[('textbox', 'Prompt'), ('image', 'First frame'), ('image', 'Last frame'), ('dropdown', 'Canvas'), ('slider', 'Duration (s)'), ('number', 'Steps'), ('number', 'Seed'), ('file', 'file'), ('textbox', 'textbox'), ('textbox', 'textbox')]
  --   jameshuntercarter/minimax-h3-ultra-fast  hw=l40sx1 (wake timeout)
  --   bened/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   FelipeAzambuja/MiniMax-H3-Turbo-Lora-Demo  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   amisima/LTX_2.5_Turbo_Studio  hw=zero-a10g (dead cert)
  --   ZeroCollabs/LTX-2.3-turbo  hw=zero-a10g (dead cert)
  --   Phamthihong/LTX-2.3-turbo  hw=zero-a10g (dead cert)
  --   rahul7star/LTX-2.3-turbo  hw=cpu-basic (dead cert)
  --   Imosu/LTX-2.3-turboX  hw=zero-a10g (dead cert)
  --   Artist89/wan2-video-generation  hw=cpu-basic (wake timeout)
  --   Opera8/minimax-h3-audio-to-video  hw=cpu-basic (wake timeout)
  --   TurboKyle/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   ChapouX/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   AdamSongjam/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   logeshr24/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   adamnusic/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   ACool007/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   Pedrozz/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   Menyudadas/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   Velvetperil/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   edwahh/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   avnigashi/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   paulo101977/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   sitekf/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   tk29780930/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   eoboygamingrb/MiniMax-H3-Turbo-Lora  hw=RUNNING (HTTP 404)
  --   RAGHURAMRAO/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   Sairockssss/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  --   Mamasita101/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   AlexCdDg/MiniMax-H3-Turbo-Lora  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   lbmodels/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   Radiotomy/Nova-H3  hw=zero-a10g gradio=6.20.0 (no video-output dep)
  --   Lampyy/MiniMax-H3-Turbo-Lora-Vid-Maker  hw=zero-a10g (wake timeout)
  --   systemraquel/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   jojobrentley/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   abdullahhshafique/minimax-h3-ultra-fast  hw=zero-a10g (wake timeout)
  --   Vyro909/MiniMax-H3-Turbo-Lora  hw=zero-a10g (wake timeout)
  discovery budget spent, stopping

  discovered 14 video engines (10 i2v / 4 t2v)

==============================================================================
### 2) anonymous minimal generation test (first 5, prefer non-zerogpu)
==============================================================================
  GEN FAIL ysharma/gr-workflow-h3-zerogpu hw=zero-a10g kind=i2v: ERROR 'The requested GPU duration (362s) is larger than the maximum allowed'
  GEN FAIL MiniMaxAI/MiniMax-H3-Turbo-Lora hw=zero-a10g kind=i2v: ERROR float() argument must be a string or a real number, not 'NoneType'
  GEN FAIL akhaliq/MiniMax-H3-Turbo-Lora hw=zero-a10g kind=i2v: ERROR float() argument must be a string or a real number, not 'NoneType'
  GEN FAIL abidlabs/MiniMax-H3-Turbo-Lora hw=zero-a10g kind=i2v: ERROR float() argument must be a string or a real number, not 'NoneType'
  GEN FAIL zakirovrinatik/minimax-h3-audio-to-video hw=zero-a10g kind=i2v: ERROR A soundtrack is required.

==============================================================================
### SUMMARY — registry candidates
==============================================================================
   - ysharma/gr-workflow-h3-zerogpu  hw=zero-a10g  fn=4  kind=i2v  api=video_soundtrack  verdict=ERROR    cors=None
   - MiniMaxAI/MiniMax-H3-Turbo-Lora  hw=zero-a10g  fn=4  kind=i2v  api=output_video  verdict=ERROR    cors=None
   - akhaliq/MiniMax-H3-Turbo-Lora  hw=zero-a10g  fn=4  kind=i2v  api=output_video  verdict=ERROR    cors=None
   - abidlabs/MiniMax-H3-Turbo-Lora  hw=zero-a10g  fn=4  kind=i2v  api=output_video  verdict=ERROR    cors=None
   - zakirovrinatik/minimax-h3-audio-to-video  hw=zero-a10g  fn=3  kind=i2v  api=generate  verdict=ERROR    cors=None
```
