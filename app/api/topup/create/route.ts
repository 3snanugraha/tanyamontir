import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/lib/qris-polling";
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

    // Generate External ID
    const externalId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Pending Transaction in DB
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        packageId: packageId,
        externalId: externalId,
        amount: creditPackage.price,
        status: "PENDING",
      },
    });

    // Call QRIS Polling API
    const qrisResponse = await createTransaction({
      amount: creditPackage.price,
      externalId: externalId,
    });

    // Update Transaction with QRIS data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentUrl: qrisResponse.data.qr_image, // Store base64 QR image
        amount: qrisResponse.data.expected_amount, // Update with corrected amount
      },
    });

    return NextResponse.json({
      qrImage: qrisResponse.data.qr_image,
      amount: qrisResponse.data.expected_amount,
      originalAmount: qrisResponse.data.amount,
      correction: qrisResponse.data.correction,
      packageName: creditPackage.name,
      externalId: externalId,
      expiresAt: qrisResponse.data.expires_at,
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
