import { prisma } from "@/lib/prisma";
import { triggerPaymentSuccess } from "@/lib/pusher-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(
      "[QRIS Polling Webhook] Received:",
      JSON.stringify(body, null, 2)
    );

    const { event, data } = body;

    // Handle transaction status updated event
    if (event === "transaction.status_updated" && data?.status === "PAID") {
      const transaction = await prisma.transaction.findFirst({
        where: { externalId: data.external_id },
        include: { package: true },
      });

      if (!transaction) {
        console.error(
          `[QRIS Polling] Transaction not found: ${data.external_id}`
        );
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Idempotency check
      if (transaction.status === "PAID") {
        console.log(
          `[QRIS Polling] Transaction already processed: ${data.external_id}`
        );
        return new NextResponse("OK", { status: 200 });
      }

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "PAID",
          paidAt: new Date(data.paid_at),
          paymentMethod: data.payment_method || "QRIS",
        },
      });

      // Add credits to user
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: { increment: transaction.package.credits },
        },
      });

      // Trigger Pusher real-time notification
      await triggerPaymentSuccess(
        transaction.userId,
        transaction.package.credits
      );

      console.log(
        `[QRIS Polling Webhook] ✅ Payment settled: ${data.external_id} - User ${transaction.userId} +${transaction.package.credits} credits`
      );
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("[QRIS Polling Webhook] Error:", error.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
