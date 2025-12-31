"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { toast } from "sonner";

export function PusherListener() {
  const router = useRouter();
  const { data: session, update } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize Pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to user-specific channel
    const channel = pusher.subscribe(`user-${session.user.id}`);

    // Listen for payment success event
    channel.bind("payment-success", async (data: { credits: number }) => {
      console.log("[Pusher] Payment success received:", data);

      // Show success toast
      toast.success(
        `Pembayaran berhasil! +${data.credits} kredit ditambahkan`,
        {
          duration: 5000,
        }
      );

      // Force session update to refresh credits in dropdown
      await update();

      // Refresh page to update credits display everywhere
      router.refresh();
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session?.user?.id, router, update]);

  return null; // This is a listener component, no UI
}
