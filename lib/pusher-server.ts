import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

export function getPusherInstance(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }

  return pusherInstance;
}

export async function triggerPaymentSuccess(userId: string, credits: number) {
  const pusher = getPusherInstance();

  await pusher.trigger(`user-${userId}`, "payment-success", {
    credits: credits,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Pusher] Triggered payment-success for user ${userId}`);
}
