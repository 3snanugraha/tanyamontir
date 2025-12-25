import Anthropic from "@anthropic-ai/sdk";
import { searchWeb } from "@/lib/tavily";

interface Message {
  role: string;
  content: string;
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "https://api.anthropic.com", // Explicit base URL
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Extract the last user message to potentially search for
  const lastUserMessage = messages
    .filter((m: Message) => m.role === "user")
    .pop();

  let webContext = "";

  // If user asks a specific question, try to enhance with web search
  if (lastUserMessage && lastUserMessage.content) {
    const searchQuery = `${lastUserMessage.content} automotive repair troubleshooting`;
    const searchResults = await searchWeb(searchQuery);

    if (searchResults && searchResults.results.length > 0) {
      webContext = `\n\nReferensi Web (Tavily Search):\n${searchResults.results
        .map(
          (r, i) =>
            `${i + 1}. ${r.title}\n   ${r.content.substring(
              0,
              200
            )}...\n   Source: ${r.url}`
        )
        .join("\n\n")}`;
    }
  }

  const systemMessage = {
    role: "system",
    content: `Anda adalah TanyaMontir AI, sistem diagnosa otomotif berbasis artificial intelligence.

ATURAN KOMUNIKASI:
1. Gunakan bahasa Indonesia yang standar dan profesional
2. Berikan respons yang objektif berdasarkan data dan fakta teknis
3. Hindari penggunaan emoji atau emoticon
4. Sampaikan informasi secara langsung dan efisien tanpa bertele-tele
5. Gunakan istilah teknis yang tepat namun tetap mudah dipahami

TUGAS UTAMA:
- Menganalisa masalah kendaraan berdasarkan data yang diberikan
- Memberikan diagnosa yang akurat dan terstruktur
- Menyarankan solusi praktis dengan estimasi biaya jika memungkinkan
- Mengingatkan bahwa ini adalah diagnosa awal dan pemeriksaan fisik tetap disarankan

FORMAT RESPONS:
- Mulai dengan ringkasan masalah
- Jelaskan kemungkinan penyebab secara sistematis
- Berikan rekomendasi tindakan yang konkret
- Tutup dengan catatan penting jika ada

REFERENSI WEB:${webContext}`,
  };

  // Convert messages to Anthropic format
  const anthropicMessages = messages.map((m: Message) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content.replace(/<search>[\s\S]*?<\/search>/g, ""), // Strip search tags from history
  }));

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    system: systemMessage.content,
    messages: anthropicMessages,
  });

  // Convert Anthropic stream to Response stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
