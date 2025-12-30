import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/cashi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { packageId } = await req.json();

    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId },
    });

    if (!creditPackage) {
      return new NextResponse("Package not found", { status: 404 });
    }

    // Generate Order ID
    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Pending Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        packageId: packageId,
        externalId: orderId,
        amount: creditPackage.price,
        status: "PENDING",
      },
    });

    // Call Cashi API
    const cashiOrder = await createOrder({
      amount: creditPackage.price,
      orderId: orderId,
    });

    // Update Transaction with Cashi data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentUrl: cashiOrder.qrUrl, // Store base64 QR image
        externalId: cashiOrder.order_id,
        amount: cashiOrder.amount, // Update with unique amount
      },
    });

    return NextResponse.json({
      qrUrl: cashiOrder.qrUrl,
      checkoutUrl: cashiOrder.checkout_url,
      amount: cashiOrder.amount,
      packageName: creditPackage.name,
      orderId: cashiOrder.order_id,
    });
  } catch (error: any) {
    console.error("TopUp Error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
