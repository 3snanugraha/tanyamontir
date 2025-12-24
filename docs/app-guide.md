> ✅ Sudah mencakup: identitas mobil, kategori masalah, adaptive question, validasi, dan output ke AI.
> ✅ Data User disimpan di local storage, dan sewaktu-waktu bisa diedit untuk fine tuning.

---

## 1️⃣ OVERALL FLOW (GLOBAL)

```mermaid
flowchart TD
    A[Start] --> B[Identitas Kendaraan]
    B --> C{Data lengkap?}
    C -- Tidak --> B
    C -- Ya --> D[Pilih Kategori Masalah]

    D -->|Mesin| E1[Flow Mesin]
    D -->|AC| E2[Flow AC]
    D -->|Kelistrikan| E3[Flow Kelistrikan]
    D -->|Kaki-kaki| E4[Flow Kaki-kaki]
    D -->|Rem| E5[Flow Rem]
    D -->|Transmisi| E6[Flow Transmisi]
    D -->|Overheat| E7[Flow Overheat]

    E1 --> Z[Normalisasi Data]
    E2 --> Z
    E3 --> Z
    E4 --> Z
    E5 --> Z
    E6 --> Z
    E7 --> Z

    Z --> Y[Generate Prompt AI]
    Y --> X[AI Analisa Awal]
    X --> W[Hasil + Skor Keyakinan + Disclaimer]
```

---

## 2️⃣ IDENTITAS KENDARAAN (DETAIL)

```mermaid
flowchart TD
    A[Input Merek & Model]
    --> B[Tahun Kendaraan]
    --> C[Transmisi MT / AT / CVT]
    --> D[Bahan Bakar]
    --> E[Odometer ±]
    --> F{Valid?}
    F -- Tidak --> A
    F -- Ya --> G[Next]
```

---

## 3️⃣ FLOW MASALAH **AC** (Lengkap & Adaptif)

```mermaid
flowchart TD
    A[AC Tidak Dingin] --> B{Kondisi terjadi?}
    B -->|Diam| C
    B -->|Jalan| C
    B -->|Keduanya| C

    C{Kompresor AC?}
    C -->|Tidak hidup| D1[Kelistrikan AC]
    C -->|Hidup-mati| D2[Pressure / Sensor]
    C -->|Hidup normal| D3[Fan / Sirkulasi]

    D3 --> E{Extra fan menyala?}
    E -->|Tidak| F1[Relay / Fuse / Fan Motor]
    E -->|Ya| F2[Evaporator / Expansion Valve]

    F1 --> G{Fan nyala jika dijumper?}
    G -->|Ya| H1[Relay / Jalur arus]
    G -->|Tidak| H2[Motor fan rusak]

    D1 --> I{Fuse AC putus / meleleh?}
    I -->|Ya| J1[Korsleting / Beban berlebih]
    I -->|Tidak| J2[Switch / Pressure sensor]

    D2 --> K[Freon / Sensor tekanan]

    H1 --> Z[Data AC Final]
    H2 --> Z
    J1 --> Z
    J2 --> Z
    K --> Z
    F2 --> Z
```

---

## 4️⃣ FLOW MASALAH **MESIN**

```mermaid
flowchart TD
    A[Masalah Mesin] --> B{Terjadi saat?}
    B -->|Dingin| C
    B -->|Panas| C
    B -->|Keduanya| C

    C{Gejala utama}
    C -->|Brebet| D1
    C -->|Tenaga hilang| D2
    C -->|Sulit hidup| D3
    C -->|Mati mendadak| D4

    D1 --> E[Pengapian / BBM]
    D2 --> F[Sensor / Intake]
    D3 --> G[Starter / Fuel pump]
    D4 --> H[CKP / Kelistrikan]

    E --> I{Check Engine menyala?}
    F --> I
    G --> I
    H --> I

    I -->|Ya| J[Scan OBD]
    I -->|Tidak| K[Pengecekan manual]

    J --> Z[Data Mesin Final]
    K --> Z
```

---

## 5️⃣ FLOW **KELISTRIKAN**

```mermaid
flowchart TD
    A[Kelistrikan Bermasalah]
    --> B{Gejala}
    B -->|Aki cepat habis| C1
    B -->|Lampu redup| C2
    B -->|Aksesoris mati| C3

    C1 --> D[Alternator / Regulator]
    C2 --> D
    C3 --> E[Fuse / Relay]

    D --> F{Tegangan < 13.5V?}
    F -->|Ya| G[Alternator lemah]
    F -->|Tidak| H[Aki drop]

    E --> Z
    G --> Z
    H --> Z
```

---

## 6️⃣ NORMALISASI DATA → AI PROMPT

```mermaid
flowchart TD
    A[Jawaban User]
    --> B[Mapping Istilah Awam → Teknis]
    --> C[Buang noise]
    --> D[Susun Kronologi]
    --> E[Prompt Siap Kirim ke AI]
```

---

## 7️⃣ OUTPUT KE USER

```mermaid
flowchart TD
    A[AI Analisa]
    --> B[Daftar Penyebab + Probabilitas]
    --> C[Langkah Cek Mandiri]
    --> D[Estimasi Risiko & Biaya]
    --> E[Disclaimer Konsultasi Awal]
```

---

## 🔧 Catatan Penting (Best Practice)

- ❌ **Jangan langsung chat AI**
- ✅ AI **hanya dipakai di akhir**
- ✅ Flow = rule-based
- ✅ AI = reasoning & penjelasan

---
