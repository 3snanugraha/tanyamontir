import Anthropic from "@anthropic-ai/sdk";
import { searchWeb } from "@/lib/tavily";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "https://api.anthropic.com", // Explicit base URL
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Extract the last user message to potentially search for
  const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();

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

  const systemPrompt = `Anda adalah "TanyaMontir AI", asisten mekanik ahli yang ramah dan profesional.
Tugas Anda adalah membantu pengguna mendiagnosa masalah kendaraan mereka berdasarkan data yang diberikan.

Panduan:
1. Berikan analisa teknis yang mendalam namun mudah dimengerti.
2. Berikan estimasi solusi yang praktis.
3. Selalu ingatkan bahwa ini adalah diagnosa awal dan disarankan pengecekan fisik ke bengkel jika ragu.
4. Gunakan bahasa Indonesia yang baik, sopan, dan teknis (bengkel style).
5. Jika ada referensi web yang diberikan, gunakan sebagai tambahan informasi (tapi tetap prioritaskan expertise Anda).${webContext}`;

  // Convert messages to Anthropic format
  const anthropicMessages = messages.map((m: any) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    system: systemPrompt,
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
