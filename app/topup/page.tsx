import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreditPackageList } from "@/components/topup/credit-package-list";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold hidden sm:inline-block">
                TopUp Kredit
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Kredit Anda</h1>
            <div className="text-4xl font-extrabold text-primary">
              {session.user.credits} Kredit
            </div>
            <p className="text-muted-foreground">
              Gunakan kredit untuk memulai sesi diagnosis baru atau melanjutkan
              chat.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-4 md:px-0">
            <CreditPackageList packages={packages} />
          </div>
        </div>
      </main>
    </div>
  );
}
