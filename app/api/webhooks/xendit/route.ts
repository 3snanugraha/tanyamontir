import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const callbackToken = req.headers.get("x-callback-token");
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (webhookToken && callbackToken !== webhookToken) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("► WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    const { external_id, status, paid_at, payment_method } = body;

    // Only process invoice callbacks (or check event type if using new version)
    // Assuming simple invoice callback structure

    const transaction = await prisma.transaction.findUnique({
      where: { externalId: external_id },
      include: { package: true },
    });

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    // Idempotency check
    if (transaction.status === "PAID") {
      return NextResponse.json({ message: "Already processed" });
    }

    if (status === "PAID" || status === "SETTLED") {
      // 1. Update Transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "PAID",
          paidAt: new Date(paid_at || new Date().toISOString()),
          paymentMethod: payment_method || "XENDIT",
        },
      });

      // 2. Add Credits to User
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: {
            increment: transaction.package.credits,
          },
        },
      });

      console.log(
        `TopUp Success: User ${transaction.userId} +${transaction.package.credits} credits`
      );
    } else if (status === "EXPIRED") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "EXPIRED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
