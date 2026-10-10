# Fleet probe report

- run: 38094693965.1 · ref: arena/50b14632-reyloai
- utc: 2026-10-10T23:29:18Z

```text

==============================================================================
### 1) discover I2V engines via /config (hardware-prefiltered)
==============================================================================
      woke in 0s
  I2V  zerogpu-aoti-wan2-2-fp8da-aoti-faster  hw=? fn=0 gradio=6.1.0
       params=[('image', 'Input Image'), ('textbox', 'Prompt'), ('slider', 'Inference Steps'), ('textbox', 'Negative Prompt'), ('slider', 'Duration (seconds)'), ('slider', 'Guidance Scale - high noise stage'), ('slider', 'Guidance Scale 2 - low noise stage'), ('slider', 'Seed'), ('checkbox', 'Randomize seed')]
      wake failed after 120s: URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai
  --   hcsmediacorp-Wan-2.1-i2v-480p-Ultra-Fast hw=? (no usable i2v endpoint)
      wake failed after 120s: HTTPError: HTTP Error 503: Service Unavailable
  --   rhaps0dy-ltx-video-i2v hw=? (no usable i2v endpoint)
      wake failed after 120s: URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai
  --   amisima-Wan-2.2-I2V-Studio hw=? (no usable i2v endpoint)
      wake failed after 120s: URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai
  --   raubatz-Wan_2_2_I2V_14B-Custom-Lora hw=? (no usable i2v endpoint)
  discovery budget spent, stopping
  discovered 1 i2v engines

==============================================================================
### 2) exhaust ZeroGPU quota on primary (same IP)
==============================================================================
  exhaust#1 zerogpu-aoti-wan2-2-fp8da-aoti-faster -> OK 10.4s
  exhaust#2 zerogpu-aoti-wan2-2-fp8da-aoti-faster -> OK 4.1s
  exhaust#3 zerogpu-aoti-wan2-2-fp8da-aoti-faster -> OK 4.1s
  exhaust#4 zerogpu-aoti-wan2-2-fp8da-aoti-faster -> QUOTA You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens

==============================================================================
### 3) alternates from the SAME exhausted IP (exhausted=True)
==============================================================================

==============================================================================
### SUMMARY
==============================================================================
   - exhaust  zerogpu-aoti-wan2-2-fp8da-aoti-faster -> OK 10.4s
   - exhaust  zerogpu-aoti-wan2-2-fp8da-aoti-faster -> OK 4.1s
   - exhaust  zerogpu-aoti-wan2-2-fp8da-aoti-faster -> OK 4.1s
   - exhaust  zerogpu-aoti-wan2-2-fp8da-aoti-faster -> QUOTA You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens
  alternates OK while primary quota-blocked: 0
```
