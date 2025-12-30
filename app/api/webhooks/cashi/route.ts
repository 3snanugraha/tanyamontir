import { prisma } from "@/lib/prisma";
import { triggerPaymentSuccess } from "@/lib/pusher-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[Cashi Webhook] Received:", JSON.stringify(body, null, 2));

    const { event, data } = body;

    // Handle test webhook from Cashi dashboard
    if (data?.order_id?.startsWith("TEST-")) {
      console.log("[Cashi] Test webhook received");
      return new NextResponse("Test OK", { status: 200 });
    }

    // Handle payment settled event
    if (event === "PAYMENT_SETTLED" && data?.status === "SETTLED") {
      const transaction = await prisma.transaction.findFirst({
        where: { externalId: data.order_id },
        include: { package: true },
      });

      if (!transaction) {
        console.error(`[Cashi] Transaction not found: ${data.order_id}`);
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Idempotency check
      if (transaction.status === "PAID") {
        console.log(`[Cashi] Transaction already processed: ${data.order_id}`);
        return new NextResponse("OK", { status: 200 });
      }

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod: "QRIS",
        },
      });

      // Add credits to user
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: { increment: transaction.package.credits },
        },
      });

      console.log(
        `[Cashi] ✅ Payment settled: ${data.order_id} - User ${transaction.userId} +${transaction.package.credits} credits`
      );

      // Trigger Pusher real-time notification
      await triggerPaymentSuccess(
        transaction.userId,
        transaction.package.credits
      );
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("[Cashi Webhook] Error:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
