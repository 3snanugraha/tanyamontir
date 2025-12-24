"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardLayout } from "../WizardLayout";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
}

export function DynamicQuestion() {
  const {
    selectedCategory,
    setStep,
    setAnswer,
    vehicleData,
    addSymptom,
    symptoms,
  } = useWizardStore();

  const [mode, setMode] = useState<"input" | "analyzing" | "questions">(
    "input"
  );
  const [symptomInput, setSymptomInput] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If we already have questions loaded (e.g. from previous session state if we persisted it,
  // but for now we assume fresh start or user re-enters).
  // Ideally store should cache this, but local state is fine for prototype.

  const handleAnalyze = async () => {
    if (!symptomInput.trim()) return;

    setMode("analyzing");
    setError(null);
    addSymptom(symptomInput); // Store initial symptom

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleData,
          selectedCategory,
          symptom: symptomInput,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Gagal menganalisa");
      }

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setMode("questions");
      } else {
        throw new Error("Format respon tidak valid");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal terhubung ke AI. Silakan coba lagi.");
      setMode("input");
    }
  };

  const handleNextQuestion = () => {
    if (!selectedOption) return;

    const currentQ = questions[currentQIndex];
    // Find the label for the selected value to store readable answer
    const selectedLabel = currentQ.options.find(
      (opt) => opt.value === selectedOption
    )?.label;

    setAnswer(currentQ.question, selectedLabel || selectedOption);
    setSelectedOption(null);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Done
      setStep(4);
    }
  };

  // Render: Loading / Analyzing
  if (mode === "analyzing") {
    return (
      <WizardLayout
        title="Menganalisa Gejala..."
        description="AI kami sedang mempelajari keluhan Anda."
        progress={50}
      >
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="bg-primary/10 p-6 rounded-full relative">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Sedang menyusun pertanyaan diagnosa spesifik untuk mobil{" "}
            <span className="font-semibold text-foreground">
              {vehicleData.model}
            </span>{" "}
            Anda...
          </p>
        </div>
      </WizardLayout>
    );
  }

  // Render: Question Flow
  if (mode === "questions" && questions.length > 0) {
    const currentQ = questions[currentQIndex];
    const progress = 50 + ((currentQIndex + 1) / questions.length) * 40;

    return (
      <WizardLayout
        title="Diagnosa Lanjutan"
        description={`Pertanyaan ${currentQIndex + 1} dari ${questions.length}`}
        progress={progress}
      >
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold leading-relaxed">
                {currentQ.question}
              </h3>

              <RadioGroup
                value={selectedOption || ""}
                onValueChange={setSelectedOption}
                className="space-y-3 pt-2"
              >
                {currentQ.options.map((opt) => (
                  <div key={opt.value}>
                    <RadioGroupItem
                      value={opt.value}
                      id={opt.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={opt.value}
                      className="flex items-center justify-between rounded-xl border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary cursor-pointer transition-all shadow-sm"
                    >
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-6 border-t">
            {/* Back button logic could be added here if tracking history */}
            <div />
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedOption}
              size="lg"
              className="px-8"
            >
              {currentQIndex === questions.length - 1
                ? "Lihat Hasil Analisa"
                : "Lanjut"}
            </Button>
          </div>
        </div>
      </WizardLayout>
    );
  }

  // Render: Initial Input
  return (
    <WizardLayout
      title="Ceritakan Masalahnya"
      description="Jelaskan gejala yang Anda rasakan pada mobil."
      progress={40}
    >
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>
            Ceritakan sedetail mungkin. Contoh: "Bunyi berdecit saat AC nyala",
            "Mesin bergetar saat lampu merah", atau "Rem bunyi saat diinjak".
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptom">Deskripsi Gejala</Label>
          <Textarea
            id="symptom"
            placeholder="Ketik keluhan Anda di sini..."
            className="min-h-[150px] text-base resize-none"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={!symptomInput.trim()}
            size="lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Analisa Sekarang
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
