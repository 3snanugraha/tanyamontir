"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white dark:bg-zinc-900 p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="TanyaMontir"
              width={80}
              height={80}
              className="rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tanya<span className="text-primary">Montir</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk mulai mendiagnosis kendaraan Anda
          </p>
        </div>

        {/* Welcome Message */}
        <div className="rounded-lg bg-primary/10 p-4 text-center">
          <p className="text-sm font-medium text-primary">
            🎉 Dapatkan 1 kredit gratis saat mendaftar!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Setiap kredit = 1 sesi diagnosis
          </p>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          size="lg"
          className="w-full h-12 text-base gap-3"
        >
          <Chrome className="h-5 w-5" />
          Lanjutkan dengan Google
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Dengan melanjutkan, Anda menyetujui Syarat Layanan dan Kebijakan
          Privasi kami
        </p>
      </div>
    </div>
  );
}
