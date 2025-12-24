"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { WizardLayout } from "../WizardLayout";
import {
  ThermometerSnowflake,
  Wrench, // Replaces Engine
  Zap,
  Disc,
  ArrowUpFromLine, // Suspension substitute
  Cog, // Transmission
  ThermometerSun, // Overheat
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    id: "engine",
    label: "Mesin",
    icon: Wrench,
    desc: "Brebet, tenaga hilang, sulit starter",
  },
  {
    id: "ac",
    label: "AC",
    icon: ThermometerSnowflake,
    desc: "Tidak dingin, bau, berisik",
  },
  {
    id: "electrical",
    label: "Kelistrikan",
    icon: Zap,
    desc: "Aki tekor, lampu mati, korslet",
  },
  {
    id: "suspension",
    label: "Kaki-kaki",
    icon: ArrowUpFromLine,
    desc: "Bunyi asing, setir getar, limbung",
  },
  {
    id: "brakes",
    label: "Pengereman",
    icon: Disc,
    desc: "Rem blong, bunyi mencit, getar",
  },
  {
    id: "transmission",
    label: "Transmisi",
    icon: Cog,
    desc: "Jedug, slip, susah oper gigi",
  },
  {
    id: "overheat",
    label: "Overheat",
    icon: ThermometerSun,
    desc: "Temperature naik, air radiator habis",
  },
];

export function CategorySelection() {
  const { setCategory, setStep, selectedCategory } = useWizardStore();

  const handleSelect = (id: string) => {
    setCategory(id);
    // Small delay for visual feedback before next step
    setTimeout(() => setStep(3), 200);
  };

  return (
    <WizardLayout
      title="Pilih Kategori Masalah"
      description="Bagian mana yang mengalami kendala?"
      progress={40}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
              selectedCategory === cat.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-muted bg-card hover:border-primary/50 hover:bg-accent"
            )}
          >
            <div
              className={cn(
                "p-3 rounded-full mb-3",
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <cat.icon className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{cat.label}</h3>
            <p className="text-xs text-center text-muted-foreground line-clamp-2">
              {cat.desc}
            </p>
          </button>
        ))}
      </div>
    </WizardLayout>
  );
}
