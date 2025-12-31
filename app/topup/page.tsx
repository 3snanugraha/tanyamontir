import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreditPackageList } from "@/components/topup/credit-package-list";
import { TransactionHistory } from "@/components/topup/transaction-history";
import { PusherListener } from "@/components/pusher-listener";
import { UserMenu } from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TopUpPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const packages = await prisma.creditPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/chat">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-lg sm:w-8 sm:h-8"
              />
              <span className="font-bold text-sm sm:text-base hidden xs:inline-block">
                TopUp Kredit
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 md:py-10">
          <div className="space-y-6 sm:space-y-8">
            {/* Credit Display */}
            <div className="text-center space-y-2 px-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Kredit Anda
              </h1>
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary">
                {session.user.credits} Kredit
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Gunakan kredit untuk memulai sesi diagnosis baru atau
                melanjutkan chat.
              </p>
            </div>

            {/* Package Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
              <CreditPackageList packages={packages} />
            </div>

            {/* Transaction History */}
            <div className="mt-8">
              <TransactionHistory />
            </div>

            {/* WhatsApp Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Mengalami masalah dengan transaksi?
              </p>
              <a
                href="https://wa.me/6285643722265?text=Halo,%20saya%20mengalami%20masalah%20dengan%20transaksi%20di%20TanyaMontir"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Hubungi WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Pusher Real-time Listener */}
      <PusherListener />
    </div>
  );
}
