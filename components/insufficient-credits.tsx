"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coins, Home, CreditCard } from "lucide-react";
import Image from "next/image";

export function InsufficientCredits() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white dark:bg-zinc-900 p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="TanyaMontir"
            width={80}
            height={80}
            className="rounded-2xl"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-500/10 p-6">
            <Coins className="h-16 w-16 text-amber-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Kredit Tidak Cukup</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki cukup kredit untuk memulai sesi diagnosis baru.
          </p>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-primary/10 p-4 text-sm">
          <p className="font-medium mb-1">Butuh lebih banyak kredit?</p>
          <p className="text-muted-foreground text-xs">
            Beli kredit sekarang untuk melanjutkan diagnosis kendaraan Anda.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/topup")}
            size="lg"
            className="w-full gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Beli Kredit Sekarang
          </Button>
          <Button
            onClick={() => router.push("/")}
            size="lg"
            variant="outline"
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
