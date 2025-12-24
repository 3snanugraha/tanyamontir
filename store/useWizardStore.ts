import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VehicleIdentity {
  brand: string;
  model: string;
  year: string;
  transmission: "manual" | "automatic" | "cvt";
  fuel: "gasoline" | "diesel" | "hybrid" | "electric";
  odometer: number;
}

interface WizardState {
  step: number;
  vehicleData: VehicleIdentity;
  selectedCategory: string | null;
  symptoms: string[];
  answers: Record<string, string>;
  isCompleted: boolean;

  setStep: (step: number) => void;
  setVehicleData: (data: Partial<VehicleIdentity>) => void;
  setCategory: (category: string) => void;
  addSymptom: (symptom: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  reset: () => void;
  completeWizard: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      step: 1,
      vehicleData: {
        brand: "",
        model: "",
        year: "",
        transmission: "automatic",
        fuel: "gasoline",
        odometer: 0,
      },
      selectedCategory: null,
      symptoms: [],
      answers: {},
      isCompleted: false,

      setStep: (step) => set({ step }),
      setVehicleData: (data) =>
        set((state) => ({ vehicleData: { ...state.vehicleData, ...data } })),
      setCategory: (category) => set({ selectedCategory: category }),
      addSymptom: (symptom) =>
        set((state) => ({ symptoms: [...state.symptoms, symptom] })),
      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),
      completeWizard: () => set({ isCompleted: true }),
      reset: () =>
        set({
          step: 1,
          vehicleData: {
            brand: "",
            model: "",
            year: "",
            transmission: "automatic",
            fuel: "gasoline",
            odometer: 0,
          },
          selectedCategory: null,
          symptoms: [],
          answers: {},
          isCompleted: false,
        }),
    }),
    {
      name: "wizard-storage",
    }
  )
);
