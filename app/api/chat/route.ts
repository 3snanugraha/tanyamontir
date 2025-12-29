import { GoogleGenAI } from "@google/genai";
import { searchWeb } from "@/lib/tavily";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, sessionId } = await req.json();

    if (!sessionId) {
      return new Response("Session ID required", { status: 400 });
    }

    // Validate session ownership and check message limit
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!chatSession) {
      return new Response("Session not found", { status: 404 });
    }

    if (chatSession.messageCount >= 3) {
      return new Response("Session message limit reached", { status: 403 });
    }

    // Extract the last user message
    const lastUserMessage = messages
      .filter((m: any) => m.role === "user")
      .pop();

    let webContext = "";

    // Web search enhancement
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
      content: m.content.replace(/<search>[\s\S]*?<\/search>/g, ""),
    }));

    const streamingResp = await ai.models.generateContentStream({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: processedMessages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: { parts: [{ text: systemMessage }] },
      },
    });

    let fullResponse = "";
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamingResp) {
          if (chunk.text) {
            fullResponse += chunk.text;
            controller.enqueue(encoder.encode(chunk.text));
          }
        }

        // Save messages to database after streaming completes
        try {
          await prisma.$transaction([
            // Save user message
            prisma.message.create({
              data: {
                sessionId,
                role: "user",
                content: lastUserMessage.content,
              },
            }),
            // Save assistant message
            prisma.message.create({
              data: {
                sessionId,
                role: "assistant",
                content: fullResponse,
              },
            }),
            // Update message count
            prisma.chatSession.update({
              where: { id: sessionId },
              data: { messageCount: { increment: 1 } },
            }),
          ]);
        } catch (error) {
          console.error("Error saving messages:", error);
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
