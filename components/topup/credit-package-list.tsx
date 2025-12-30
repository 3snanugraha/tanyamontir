"use client";

// Client Component for Displaying Packages

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditPackage } from "@prisma/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreditPackageListProps {
  packages: CreditPackage[];
}

export function CreditPackageList({ packages }: CreditPackageListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast.success("TopUp Berhasil! Kredit telah ditambahkan.", {
        icon: <CheckCircle2 className="text-green-500" />,
        duration: 5000,
      });
      // Clear query params
      router.replace("/topup");
    } else if (status === "failed") {
      toast.error("Pembayaran Gagal atau Dibatalkan.", {
        icon: <XCircle className="text-destructive" />,
      });
      router.replace("/topup");
    }
  }, [searchParams, router]);

  const handleBuy = async (pkg: CreditPackage) => {
    try {
      setLoadingId(pkg.id);
      const response = await fetch("/api/topup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const data = await response.json();

      // Redirect to Xendit
      window.location.href = data.invoiceUrl;
    } catch (error) {
      console.error("Buy Error:", error);
      toast.error("Gagal memproses transaksi. Silakan coba lagi.");
      setLoadingId(null);
    }
  };

  return (
    <>
      {packages.map((pkg) => (
        <Card
          key={pkg.id}
          className="flex flex-col relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
        >
          {pkg.credits === 10 && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-bl-lg">
              POPULAR
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{pkg.name}</CardTitle>
            <CardDescription>{pkg.credits} Kredit Diagnosis</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold">
              Rp {pkg.price.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Rp {(pkg.price / pkg.credits).toLocaleString("id-ID")} / kredit
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleBuy(pkg)}
              disabled={loadingId !== null}
            >
              {loadingId === pkg.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Beli Sekarang"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
