import Anthropic from "@anthropic-ai/sdk";

// Allow generation up to 30 seconds
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "https://api.anthropic.com", // Explicit base URL
});

export async function POST(req: Request) {
  try {
    const { vehicleData, selectedCategory, symptom } = await req.json();

    console.log("Diagnose API called with:", {
      vehicleData,
      selectedCategory,
      symptom,
    });

    const systemPrompt = `Anda adalah mekanik ahli (TanyaMontir AI).
Tugas: Buat 3-4 pertanyaan diagnosa lanjutan yang SPESIFIK untuk mengerucutkan masalah mobil user.
Konteks:
- Mobil: ${vehicleData.brand} ${vehicleData.model} (${vehicleData.year})
- Kategori: ${selectedCategory}
- Keluhan Awal: "${symptom}"

Aturan:
1. Pertanyaan harus teknis tapi mudah dipahami awam.
2. Pilihan jawaban harus menuntun ke kesimpulan penyebab (misal: "Bunyi kasar", "Bunyi halus", "Tidak bunyi").
3. Gunakan Bahasa Indonesia yang luwes (bengkel style).
4. Berikan 2-4 pilihan jawaban per pertanyaan.

PENTING: Berikan response dalam format JSON yang valid dengan struktur:
{
  "questions": [
    {
      "id": "q1",
      "question": "Pertanyaan diagnosa?",
      "options": [
        {"label": "Pilihan 1", "value": "val1"},
        {"label": "Pilihan 2", "value": "val2"}
      ]
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content:
            systemPrompt +
            "\n\nGenerate diagnostic questions based on the symptom.",
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Strip markdown code blocks if present
    let jsonText = content.text.trim();

    // Remove ```json and ``` markers
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText
        .replace(/^```json\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const parsed = JSON.parse(jsonText.trim());
    console.log("Generated questions:", parsed);

    return Response.json(parsed);
  } catch (error: any) {
    console.error("Diagnosis API Error:", error);
    console.error("Error details:", error.message, error.stack);
    return Response.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}
