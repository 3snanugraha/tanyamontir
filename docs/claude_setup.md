# Claude API Setup Guide

## Cara Mendapatkan Claude API Key

1. Buka https://console.anthropic.com/
2. Sign up / Login
3. Klik "API Keys" di dashboard
4. Klik "Create Key"
5. Copy key dan tambahkan ke `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

## Model yang Tersedia

### Claude 3.5 Sonnet (Recommended)

- Model ID: `claude-3-5-sonnet-20241022`
- Paling pintar dan balanced
- Support: Streaming, JSON mode, Tool use
- Rate limit (Free tier): 50 requests/day

### Claude 3 Haiku (Fastest)

- Model ID: `claude-3-haiku-20240307`
- Paling cepat dan murah
- Bagus untuk task sederhana

## Pricing (Pay-as-you-go)

- Claude 3.5 Sonnet: $3/MTok input, $15/MTok output
- Claude 3 Haiku: $0.25/MTok input, $1.25/MTok output
- **Free tier**: $5 credit untuk new users

## Best Practice dengan Vercel AI SDK

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateObject } from "ai";

// Streaming chat
const result = streamText({
  model: anthropic("claude-3-5-sonnet-20241022"),
  messages: [...],
});

// Structured output (JSON)
const { object } = await generateObject({
  model: anthropic("claude-3-5-sonnet-20241022"),
  schema: z.object({...}),
  prompt: "...",
});
```
