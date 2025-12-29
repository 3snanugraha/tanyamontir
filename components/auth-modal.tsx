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
            Sign in to Continue
          </DialogTitle>
          <DialogDescription className="text-center">
            Authentication required to access diagnosis features
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
                <p className="text-sm font-medium">5 Free Credits</p>
                <p className="text-xs text-muted-foreground">
                  Start diagnosing immediately
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Secure & Private</p>
                <p className="text-xs text-muted-foreground">
                  Your data is encrypted and protected
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
            Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
