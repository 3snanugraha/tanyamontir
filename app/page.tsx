"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, Grid, Stethoscope, FileText } from "lucide-react";
import { motion } from "framer-motion";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/store/useWizardStore";

export default function Home() {
  const router = useRouter();
  const { isCompleted } = useWizardStore();

  useEffect(() => {
    // If user has completed diagnosis history, redirect to chat directly
    if (isCompleted) {
      router.replace("/chat");
    }
  }, [isCompleted, router]);
  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Image
            src="/logo.png"
            alt="TanyaMontir Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span>
            Tanya<span className="text-primary">Montir</span>
          </span>
        </div>
        <ModeToggle />
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background shadow-sm hover:bg-accent cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            AI Diagnostic System v1.0
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-500 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent pb-2">
            Diagnosa Masalah Mobil <br className="hidden sm:block" />
            Secara Mandiri
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tidak perlu bingung saat mobil bermasalah. Gunakan panduan
            interaktif kami untuk menemukan penyebab kerusakan dan estimasi
            perbaikan dalam hitungan menit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/diagnose" passHref>
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-full"
              >
                Mulai Diagnosa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base rounded-full"
            >
              Pelajari Cara Kerja
            </Button>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-zinc-100/50 dark:bg-zinc-900/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
            Cara Menggunakan
          </h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-zinc-300 via-primary to-zinc-300 dark:from-zinc-800 dark:via-primary dark:to-zinc-800 -z-10 opacity-30"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background border-4 border-muted flex items-center justify-center shadow-lg z-10">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">1. Identitas Mobil</h3>
              <p className="text-sm text-muted-foreground px-4">
                Masukkan merek, model, dan detail kendaraan Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background border-4 border-muted flex items-center justify-center shadow-lg z-10">
                <Grid className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">2. Pilih Masalah</h3>
              <p className="text-sm text-muted-foreground px-4">
                Pilih kategori kerusakan (Mesin, AC, Rem, dll).
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background border-4 border-muted flex items-center justify-center shadow-lg z-10">
                <Stethoscope className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">3. Jawab Diagnosa</h3>
              <p className="text-sm text-muted-foreground px-4">
                Jawab pertanyaan interaktif seputar gejala.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-background border-4 border-muted flex items-center justify-center shadow-lg z-10">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">4. Hasil & Solusi</h3>
              <p className="text-sm text-muted-foreground px-4">
                Dapatkan analisa penyebab dan rekomendasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 TanyaMontir. All rights reserved.</p>
      </footer>
    </main>
  );
}
