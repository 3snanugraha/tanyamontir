import { GoogleGenAI } from "@google/genai";

// Allow generation up to 30 seconds
export const maxDuration = 30;

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

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
4. Berikan 2-4 pilihan jawaban per pertanyaan.`;

    const schema = {
      type: "OBJECT",
      properties: {
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    label: { type: "STRING" },
                    value: { type: "STRING" },
                  },
                  required: ["label", "value"],
                },
              },
            },
            required: ["id", "question", "options"],
          },
        },
      },
      required: ["questions"],
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Generate diagnostic questions based on the symptom." },
          ],
        },
      ],
      config: {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const responseText = result.text;
    let object;
    try {
      if (responseText) {
        object = JSON.parse(responseText);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (e) {
      console.error("Failed to parse JSON:", responseText);
      throw e;
    }

    console.log("Generated questions:", object);

    return Response.json(object);
  } catch (error: unknown) {
    console.error("Diagnosis API Error:", error);
    return Response.json(
      {
        error: "Failed to generate questions",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
