# Cara Mendapatkan Groq API Key (GRATIS)

1. Buka https://console.groq.com/
2. Sign up dengan Google/GitHub
3. Klik "API Keys" di sidebar
4. Klik "Create API Key"
5. Copy key dan tambahkan ke `.env.local`:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

## Model yang Tersedia (Gratis):

- `llama-3.3-70b-versatile` - **Paling pintar & terbaru** (recommended) ✨
- `llama-3.1-8b-instant` - Paling cepat
- `mixtral-8x7b-32768` - Bagus untuk reasoning
- `gemma2-9b-it` - Alternatif ringan

## Rate Limits (Free Tier):

- 30 requests/minute
- 6,000 tokens/minute
- Cukup untuk development!
