"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardLayout } from "../WizardLayout";
import { Loader2, Bot, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Summary() {
  const router = useRouter();
  const { vehicleData, selectedCategory, answers, completeWizard } =
    useWizardStore();
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI Analysis delay
    const timer = setTimeout(() => {
      setAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const generatePrompt = () => {
    let prompt = `Identitas Kendaraan:\n`;
    prompt += `- ${vehicleData.brand} ${vehicleData.model} (${vehicleData.year})\n`;
    prompt += `- KM: ${vehicleData.odometer}\n`;
    prompt += `- Transmisi: ${vehicleData.transmission}\n`;
    prompt += `- BBM: ${vehicleData.fuel}\n\n`;

    prompt += `Kategori Masalah: ${selectedCategory}\n\n`;

    prompt += `Gejala & Kronologi:\n`;
    Object.entries(answers).forEach(([q, a]) => {
      prompt += `- ${q} : ${a}\n`;
    });

    return prompt;
  };

  const handleConsultation = () => {
    completeWizard();
    router.push("/chat");
  };

  return (
    <WizardLayout
      title={analyzing ? "Menganalisa Diagnosa..." : "Hasil Analisa Awal"}
      description="Sistem sedang memproses data gejala yang Anda berikan."
      progress={100}
    >
      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Menghubungkan ke knowledge base...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-muted">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold">
              <Bot className="h-4 w-4" /> Generated AI Prompt
            </div>
            {generatePrompt()}
          </div>

          <Button className="w-full" size="lg" onClick={handleConsultation}>
            Konsultasi dengan Montir Ahli via Chat
          </Button>
        </div>
      )}
    </WizardLayout>
  );
}
