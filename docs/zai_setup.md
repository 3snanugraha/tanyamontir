# Z.AI API Setup Guide

## Cara Mendapatkan Z.AI API Key

1. Buka https://z.ai/
2. Sign up / Login
3. Dapatkan API key dari dashboard
4. Tambahkan ke `.env.local`:

```
ZAI_API_KEY=your-z-ai-api-key
```

## Model yang Tersedia

### GLM-4.7 (Recommended)

- Model ID: `glm-4.7`
- Model AI dari Zhipu AI (China)
- Support: Streaming, JSON mode
- Bagus untuk Bahasa Indonesia

## Penggunaan dengan OpenAI SDK

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: "https://api.z.ai/api/paas/v4/"
});

// Streaming chat
const stream = await client.chat.completions.create({
  model: "glm-4.7",
  messages: [...],
  stream: true,
});

// JSON mode
const response = await client.chat.completions.create({
  model: "glm-4.7",
  messages: [...],
  response_format: { type: "json_object" },
});
```

## Keuntungan Z.AI

- ✅ Mudah digunakan (OpenAI-compatible)
- ✅ Model bagus untuk Bahasa Indonesia
- ✅ Harga kompetitif
