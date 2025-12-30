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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QrisModal } from "./qris-modal";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreditPackageListProps {
  packages: CreditPackage[];
}

interface QrisData {
  qrUrl: string; // Base64 image from Cashi
  checkoutUrl: string;
  amount: number;
  packageName: string;
}

export function CreditPackageList({ packages }: CreditPackageListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [qrisData, setQrisData] = useState<QrisData | null>(null);
  const [showQrisModal, setShowQrisModal] = useState(false);

  const handleBuy = async (pkg: CreditPackage) => {
    try {
      setLoadingId(pkg.id);
      const response = await fetch("/api/topup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to create transaction");
      }

      const data = await response.json();

      // Show QRIS Modal with Cashi data
      setQrisData({
        qrUrl: data.qrUrl, // Base64 image
        checkoutUrl: data.checkoutUrl,
        amount: data.amount, // With unique digits
        packageName: data.packageName,
      });
      setShowQrisModal(true);
      setLoadingId(null);
    } catch (error: any) {
      console.error("Buy Error:", error);
      toast.error(
        error.message || "Gagal memproses transaksi. Silakan coba lagi."
      );
      setLoadingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowQrisModal(false);
    setQrisData(null);
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

      {/* QRIS Modal */}
      {qrisData && (
        <QrisModal
          isOpen={showQrisModal}
          onClose={handleCloseModal}
          qrUrl={qrisData.qrUrl}
          amount={qrisData.amount}
          packageName={qrisData.packageName}
          checkoutUrl={qrisData.checkoutUrl}
        />
      )}
    </>
  );
}
