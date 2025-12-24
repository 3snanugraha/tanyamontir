"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RotateCcw } from "lucide-react";

interface WizardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  progress: number;
}

export function WizardLayout({
  children,
  title,
  description,
  progress,
}: WizardLayoutProps) {
  const { step, setStep, reset } = useWizardStore();

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep(step - 1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2 font-bold tracking-tight">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-xl text-zinc-900 dark:text-white">
                Tanya<span className="text-primary">Montir</span>
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 md:p-8">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
