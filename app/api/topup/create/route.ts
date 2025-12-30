import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createQRISPayment } from "@/lib/trakteer";
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

    // Generate Transaction ID
    const externalId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Pending Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        packageId: packageId,
        externalId: externalId,
        amount: creditPackage.price,
        status: "PENDING",
      },
    });

    // Calculate quantity based on price (Rp 1,000 per unit)
    const quantity = Math.floor(creditPackage.price / 1000);

    // Call Trakteer QRIS API
    const qrisPayment = await createQRISPayment({
      quantity: quantity,
      displayName: session.user.name || "TanyaMontir User",
      message: `TopUp ${creditPackage.credits} Kredit`,
      email: session.user.email || "guest@tanyamontir.com",
    });

    // Update Transaction with QRIS data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentUrl: qrisPayment.qrisString, // Store QRIS string
        externalId: qrisPayment.transactionId, // Update with actual Trakteer ID
      },
    });

    return NextResponse.json({
      qrisString: qrisPayment.qrisString,
      checkoutUrl: qrisPayment.checkoutUrl,
      amount: creditPackage.price,
      packageName: creditPackage.name,
      externalId: qrisPayment.transactionId,
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
