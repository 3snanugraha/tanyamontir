import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const webhookToken = req.headers.get("x-webhook-token");
    const expectedToken = process.env.TRAKTEER_WEBHOOK_TOKEN;

    // Verify webhook token
    if (expectedToken && webhookToken !== expectedToken) {
      console.error(`[!] Unauthorized Webhook. Token: ${webhookToken}`);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("► TRAKTEER WEBHOOK:", JSON.stringify(body, null, 2));

    const {
      transaction_id,
      supporter_name,
      supporter_message,
      net_amount,
      unit,
    } = body;

    // Find transaction by external_id (transaction_id from Trakteer)
    const transaction = await prisma.transaction.findFirst({
      where: {
        externalId: {
          contains: transaction_id, // Partial match since we might have modified ID
        },
      },
      include: { package: true },
    });

    if (!transaction) {
      console.error(`Transaction not found for ID: ${transaction_id}`);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Idempotency check
    if (transaction.status === "PAID") {
      console.log(`Transaction ${transaction_id} already processed`);
      return NextResponse.json({ message: "Already processed" });
    }

    // Update transaction status
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
        credits: {
          increment: transaction.package.credits,
        },
      },
    });

    console.log(
      `✅ TopUp Success: User ${transaction.userId} +${transaction.package.credits} credits`
    );
    console.log(`   Supporter: ${supporter_name}`);
    console.log(`   Amount: ${net_amount} (${unit})`);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error?.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
