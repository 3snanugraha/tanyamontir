"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrisString: string;
  amount: number;
  packageName: string;
  checkoutUrl?: string;
}

export function QrisModal({
  isOpen,
  onClose,
  qrisString,
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
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG value={qrisString} size={240} level="H" />
          </div>

          {/* Payment Details */}
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-primary">
              Rp {amount.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-muted-foreground">{packageName}</p>
          </div>

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Kredit akan otomatis ditambahkan ke akun Anda setelah pembayaran
              berhasil. Proses biasanya memakan waktu beberapa detik.
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
