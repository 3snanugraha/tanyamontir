"use client";

import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chrome, Shield, Zap } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Masuk untuk Melanjutkan
          </DialogTitle>
          <DialogDescription className="text-center">
            Autentikasi diperlukan untuk mengakses fitur diagnosis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">1 Kredit Gratis</p>
                <p className="text-xs text-muted-foreground">
                  Mulai diagnosis segera
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Aman & Privat</p>
                <p className="text-xs text-muted-foreground">
                  Data Anda terenkripsi dan terlindungi
                </p>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={() => signIn("google", { callbackUrl: "/diagnose" })}
            size="lg"
            className="w-full gap-2"
          >
            <Chrome className="h-5 w-5" />
            Lanjutkan dengan Google
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui Syarat & Kebijakan Privasi kami
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
