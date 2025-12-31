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
          </div>
        </div>
      </main>

      {/* Pusher Real-time Listener */}
      <PusherListener />
    </div>
  );
}
