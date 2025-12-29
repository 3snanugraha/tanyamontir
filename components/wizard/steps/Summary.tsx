"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardLayout } from "../WizardLayout";
import {
  Loader2,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { InsufficientCredits } from "@/components/insufficient-credits";
import { toast } from "sonner";

export function Summary() {
  const router = useRouter();
  const { data: session } = useSession();
  const { vehicleData, selectedCategory, answers, symptoms, completeWizard } =
    useWizardStore();
  const [analyzing, setAnalyzing] = useState(true);
  const [creating, setCreating] = useState(false);
  const [hasCredits, setHasCredits] = useState(true);

  useEffect(() => {
    // Check credits on mount
    const checkUserCredits = async () => {
      try {
        const response = await fetch("/api/credits/check");
        const data = await response.json();

        if (data.credits < 1) {
          setHasCredits(false);
        }
      } catch (error) {
        console.error("Error checking credits:", error);
      }
    };

    checkUserCredits();

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

  const handleConsultation = async () => {
    if (!hasCredits) {
      return;
    }

    setCreating(true);

    try {
      // Create diagnosis session in database
      const response = await fetch("/api/diagnosis/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleData,
          category: selectedCategory,
          symptoms: symptoms || [],
          answers,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Insufficient credits
        setHasCredits(false);
        setCreating(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat sesi");
      }

      // Complete wizard and redirect to chat with sessionId
      completeWizard();
      router.push(`/chat?sessionId=${data.sessionId}`);
    } catch (error) {
      console.error("Error creating diagnosis session:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setCreating(false);
    }
  };

  // Show insufficient credits UI
  if (!hasCredits && !analyzing) {
    return <InsufficientCredits />;
  }

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

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleConsultation}
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Membuat Sesi...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Mulai Konsultasi (1 Kredit)
              </>
            )}
          </Button>
        </div>
      )}
    </WizardLayout>
  );
}
