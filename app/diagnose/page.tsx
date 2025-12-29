"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { VehicleIdentity } from "@/components/wizard/steps/VehicleIdentity";
import { CategorySelection } from "@/components/wizard/steps/CategorySelection";
import { DynamicQuestion } from "@/components/wizard/steps/DynamicQuestion";
import { Summary } from "@/components/wizard/steps/Summary";
import { useEffect, useState } from "react";

export default function DiagnosePage() {
  const { step, isCompleted, reset } = useWizardStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Auto-reset if wizard was completed (user coming back to start new diagnosis)
    if (isCompleted) {
      reset();
    }
  }, [isCompleted, reset]);

  if (!mounted) return null;

  switch (step) {
    case 1:
      return <VehicleIdentity />;
    case 2:
      return <CategorySelection />;
    case 3:
      return <DynamicQuestion />;
    case 4:
      return <Summary />;
    default:
      return <VehicleIdentity />;
  }
}
