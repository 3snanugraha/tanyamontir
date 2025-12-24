export interface FlowStep {
  id: string;
  question: string;
  options: {
    label: string;
    nextStepId: string | "FINAL";
    value: string;
  }[];
  type?: "radio" | "checkbox";
}

export const AC_FLOW: Record<string, FlowStep> = {
  root: {
    id: "root",
    question: "Kapan kondisi AC tidak dingin terjadi?",
    options: [
      {
        label: "Saat Diam (Macet/Lampu Merah)",
        nextStepId: "node_compressor",
        value: "diam",
      },
      { label: "Saat Jalan", nextStepId: "node_compressor", value: "jalan" },
      {
        label: "Keduanya (Selalu)",
        nextStepId: "node_compressor",
        value: "selalu",
      },
    ],
  },
  node_compressor: {
    id: "node_compressor",
    question: "Cek Kompresor AC: Apakah hidup?",
    options: [
      {
        label: "Tidak Hidup (Magnetic Clutch diam)",
        nextStepId: "node_electrical",
        value: "mati",
      },
      {
        label: "Hidup-Mati (Ctak-cetoken cepat)",
        nextStepId: "node_pressure",
        value: "cycling",
      },
      {
        label: "Hidup Normal (Berputar terus)",
        nextStepId: "node_fan",
        value: "normal",
      },
    ],
  },
  node_fan: {
    id: "node_fan",
    question: "Apakah Extra Fan (Kipas AC) menyala kencang?",
    options: [
      {
        label: "Tidak / Lemah / Mati",
        nextStepId: "node_fan_check",
        value: "fan_mati",
      },
      {
        label: "Ya, Menyala kencang",
        nextStepId: "node_evap",
        value: "fan_hidup",
      },
    ],
  },
  node_fan_check: {
    id: "node_fan_check",
    question: "Coba jumper/langsungkan fan ke aki, apakah menyala?",
    options: [
      { label: "Ya, Menyala", nextStepId: "FINAL", value: "relay_issue" },
      { label: "Tidak Menyala", nextStepId: "FINAL", value: "motor_issue" },
    ],
  },
  node_electrical: {
    id: "node_electrical",
    question: "Cek Kotak Sekring (Fuse) AC",
    options: [
      { label: "Putus / Meleleh", nextStepId: "FINAL", value: "fuse_blown" },
      { label: "Utuh / Bagus", nextStepId: "FINAL", value: "sensor_issue" },
    ],
  },
  node_pressure: {
    id: "node_pressure",
    question: "Indikasi tekanan freon",
    options: [
      {
        label: "Lanjut ke hasil",
        nextStepId: "FINAL",
        value: "pressure_issue",
      },
    ],
  },
  node_evap: {
    id: "node_evap",
    question: "Lanjut ke pengecekan Evaporator",
    options: [{ label: "Lanjut", nextStepId: "FINAL", value: "evap_issue" }],
  },
};

// Simple fallback for other categories for prototype
export const GENERIC_FLOW: Record<string, FlowStep> = {
  root: {
    id: "root",
    question: "Jelaskan gejala lebih detail",
    options: [
      { label: "Lanjut ke Analisa AI", nextStepId: "FINAL", value: "generic" },
    ],
  },
};
