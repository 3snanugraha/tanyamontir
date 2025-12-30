"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string; // Base64 image string
  amount: number;
  packageName: string;
  checkoutUrl?: string;
}

export function QrisModal({
  isOpen,
  onClose,
  qrUrl,
  amount,
  packageName,
  checkoutUrl,
}: QrisModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QRIS untuk Membayar</DialogTitle>
          <DialogDescription>
            Scan kode QR di bawah menggunakan aplikasi e-wallet Anda
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code Image */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img
              src={qrUrl}
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
              *Nominal sudah termasuk kode unik untuk verifikasi
            </p>
          </div>

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Transfer sesuai nominal yang tertera. Kredit akan otomatis
              ditambahkan dalam 1-2 menit setelah pembayaran berhasil.
            </AlertDescription>
          </Alert>

          {/* Optional: Checkout URL */}
          {checkoutUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(checkoutUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buka Halaman Pembayaran
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
