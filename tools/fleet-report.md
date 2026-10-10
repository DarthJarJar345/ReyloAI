# Fleet probe report

- run: 38090471889.1 · ref: arena/50b14632-reyloai
- utc: 2026-10-10T22:11:43Z

```text

==============================================================================
### 1) discover I2V-capable public Gradio Spaces
==============================================================================
  I2V  https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space  endpoint=/generate_video params=['input_image', 'prompt', 'steps', 'negative_prompt', 'duration_seconds', 'guidance_scale', 'guidance_scale_2', 'seed', 'randomize_seed']
  --   https://zerogpu-aoti-wan2-2-fp8da-aoti.hf.space (no i2v endpoint)
  --   https://multimodalart-wan2-2-i2v-fast.hf.space (no i2v endpoint)
  --   https://fffiloni-diffusers-image-to-video.hf.space (no i2v endpoint)
  --   https://fffiloni-wan2-2-i2v.hf.space (no i2v endpoint)
  --   https://kijai-wan2-2-i2v.hf.space (no i2v endpoint)
  --   https://lightricks-ltx-video-playground.hf.space (no i2v endpoint)
  --   https://camenduru-wan22-i2v.hf.space (no i2v endpoint)
  --   https://Saravutw-WAN2.2_I2V_LIGHTNING_4-8step_custom.hf.space (no i2v endpoint)
  --   https://makiblek-Wan_2.2_I2V_14B_Custom_Lora_Wow.hf.space (no i2v endpoint)
  --   https://YasrBndr-Wan-AI-Wan2.2-I2V-A14B-Diffusers.hf.space (no i2v endpoint)
  --   https://traderharikrishna-Wan_2.2_I2V_14B_Custom_Lora.hf.space (no i2v endpoint)
  --   https://Cludo2-Wan_2.2_I2V_14B_Custom_Lora_Wow_HITMAN911.hf.space (no i2v endpoint)
  --   https://amisima-Wan_2.2_I2V_Studio.hf.space (no i2v endpoint)
  --   https://raubatz-Wan_2.2_I2V_14B-Custom-Lora.hf.space (no i2v endpoint)
  --   https://Fgasa-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://ufogr-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://isage1445-Wan-AI-Wan2.2-I2V-A14B-Diffusers.hf.space (no i2v endpoint)
  --   https://Beatwrecka-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Bshanej1986-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://ahmedfikryg-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Zzzhhmm-Wan-AI-Wan2.2-I2V-A14B-Diffusers.hf.space (no i2v endpoint)
  --   https://Jatin264-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Canhug777-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Hujiwhiwud-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Gee6ix-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://hugger666666-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://alhassane-douk-Wan-AI-Wan2.2-I2V-A14B-Diffusers.hf.space (no i2v endpoint)
  --   https://Surendara1991-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Elto0-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Obunr-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://FabricioEstrada-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://Andrewgars-Wan-AI-Wan2.2-I2V-A14B.hf.space (no i2v endpoint)
  --   https://hcsmediacorp-Wan-2.1-i2v-480p-Ultra-Fast.hf.space (no i2v endpoint)
  --   https://rajeshcbe2000-Wan-2.1-i2v-480p-Ultra-Fast-Raj.hf.space (no i2v endpoint)
  --   https://MrPixar-Wan-2.1-i2v-480p-Ultra-Fast.hf.space (no i2v endpoint)
  --   https://drandrea-Wan-2.1-i2v-480p-Ultra-Fast.hf.space (no i2v endpoint)
  --   https://Eeeee83-Wan-2.1-i2v-480p-Ultra-Fast.hf.space (no i2v endpoint)
  --   https://Indivilimandimio-Wan-2.1-i2v-480p-Ultra-Fast.hf.space (no i2v endpoint)
  --   https://rhaps0dy-ltx-video-i2v.hf.space (no i2v endpoint)

==============================================================================
### 2) exhaust anonymous quota on the primary engine
==============================================================================
  exhaust#1 on https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> OK 4.0s
  exhaust#2 on https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> OK 4.1s
  exhaust#3 on https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> OK 4.0s
  exhaust#4 on https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> QUOTA You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens
  primary quota exhausted: True

==============================================================================
### 3) cross-space quota test: alternates from the SAME ip, right now
==============================================================================

==============================================================================
### SUMMARY
==============================================================================
  alternates that worked while primary blocked/degraded: 0
   - exhaust  https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> OK 4.0s
   - exhaust  https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> OK 4.1s
   - exhaust  https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> OK 4.0s
   - exhaust  https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space -> QUOTA You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens
  VERDICT: quota looks platform-wide; fleet still adds resilience ✅-ish
```
