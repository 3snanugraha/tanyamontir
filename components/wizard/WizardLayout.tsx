"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useWizardStore } from "@/store/useWizardStore";
import { UserMenu } from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import Image from "next/image";

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
  const router = useRouter();
  const { step, setStep } = useWizardStore();

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep(step - 1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2 font-bold tracking-tight">
              <Image
                src="/logo.png"
                alt="TanyaMontir"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl text-zinc-900 dark:text-white">
                Tanya<span className="text-primary">Montir</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
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
