"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrImage: string; // Base64 image
  amount: number;
  originalAmount: number;
  correction: number;
  packageName: string;
  externalId: string;
  expiresAt?: string;
}

export function QrisModal({
  isOpen,
  onClose,
  qrImage,
  amount,
  originalAmount,
  correction,
  packageName,
  externalId,
  expiresAt,
}: QrisModalProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "PAID">("PENDING");
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Auto-polling every 10 seconds
  useEffect(() => {
    if (!isOpen || status === "PAID") return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isOpen, status, externalId]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || status === "PAID") return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status]);

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      const response = await fetch("/api/topup/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "PAID") {
          setStatus("PAID");
          toast.success("Pembayaran berhasil! Kredit telah ditambahkan.");

          // Force refresh to update credits everywhere
          router.refresh();

          setTimeout(() => onClose(), 2000);
        }
      }
    } catch (error) {
      console.error("Check status error:", error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === "PAID"
              ? "Pembayaran Berhasil!"
              : "Scan QRIS untuk Membayar"}
          </DialogTitle>
          {status === "PENDING" && timeLeft && (
            <DialogDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Berlaku: {timeLeft}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {status === "PAID" ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <p className="text-lg font-medium">Kredit telah ditambahkan!</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img
                  src={qrImage}
                  alt="QRIS Code"
                  className="w-60 h-60 object-contain"
                />
              </div>

              {/* Payment Details */}
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">
                  Rp {amount.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-muted-foreground">{packageName}</p>
                <p className="text-xs text-yellow-600 font-medium">
                  *Nominal sudah termasuk kode unik Rp {correction} untuk
                  verifikasi
                </p>
              </div>

              {/* Instructions */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Scan QR code dengan aplikasi e-wallet. Status akan otomatis
                  diperbarui setiap 10 detik.
                </AlertDescription>
              </Alert>

              {/* Manual Check Button */}
              <Button
                onClick={checkPaymentStatus}
                disabled={checking}
                variant="outline"
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`}
                />
                {checking ? "Mengecek..." : "Cek Status Pembayaran"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
