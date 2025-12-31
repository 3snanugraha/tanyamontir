import { checkTransactionStatus } from "@/lib/qris-polling";
import { prisma } from "@/lib/prisma";
import { triggerPaymentSuccess } from "@/lib/pusher-server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { externalId } = await req.json();

    // Check status from QRIS Polling API
    const qrisStatus = await checkTransactionStatus(externalId);

    // Find transaction in DB
    const transaction = await prisma.transaction.findFirst({
      where: { externalId: externalId },
      include: { package: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // If PAID and not yet processed
    if (qrisStatus.data.status === "PAID" && transaction.status !== "PAID") {
      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "PAID",
          paidAt: new Date(qrisStatus.data.paid_at!),
          paymentMethod: "QRIS",
        },
      });

      // Add credits
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: { increment: transaction.package.credits },
        },
      });

      // Trigger Pusher notification
      await triggerPaymentSuccess(
        transaction.userId,
        transaction.package.credits
      );

      console.log(
        `[QRIS Polling] ✅ Payment confirmed: ${externalId} - User ${transaction.userId} +${transaction.package.credits} credits`
      );
    }

    return NextResponse.json({
      status: qrisStatus.data.status,
      paidAt: qrisStatus.data.paid_at,
    });
  } catch (error: any) {
    console.error("[Check Status] Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
