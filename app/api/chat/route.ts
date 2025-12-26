import { GoogleGenAI } from "@google/genai";
import { searchWeb } from "@/lib/tavily";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

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

  const systemMessage = `Anda adalah TanyaMontir AI, sistem diagnosa otomotif berbasis artificial intelligence.

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

REFERENSI WEB:${webContext}`;

  const processedMessages = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    content: m.content.replace(/<search>[\s\S]*?<\/search>/g, ""), // Strip search tags from history
  }));

  const streamingResp = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: processedMessages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    config: {
      systemInstruction: { parts: [{ text: systemMessage }] },
    },
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of streamingResp) {
        if (chunk.text) {
          controller.enqueue(encoder.encode(chunk.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
