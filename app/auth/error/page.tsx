"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You denied access. Please try again.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during sign in. Please try again.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  return (
    <>
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Authentication Error
        </h2>
        <p className="text-sm text-muted-foreground">
          {errorMessages[error] || errorMessages.Default}
        </p>
      </div>

      <div className="space-y-3 pt-4">
        <Link href="/auth/signin" className="block">
          <Button size="lg" className="w-full">
            Try Again
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button size="lg" variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white dark:bg-zinc-900 p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        {/* Logo */}
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
        </div>

        {/* Error Message */}
        <Suspense
          fallback={
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
