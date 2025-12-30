import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createInvoice } from "@/lib/xendit";
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

    // Generate Invoice ID
    const externalId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

    // Validasi URL (Environment aware)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Call Xendit
    const xenditInvoice = await createInvoice({
      externalId: externalId,
      amount: creditPackage.price,
      payerEmail: session.user.email || undefined,
      description: `TopUp ${creditPackage.credits} Kredit - TanyaMontir`,
      successRedirectUrl: `${baseUrl}/topup?status=success`,
      failureRedirectUrl: `${baseUrl}/topup?status=failed`,
    });

    // Update Transaction with invoice URL
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentUrl: xenditInvoice.invoice_url,
      },
    });

    return NextResponse.json({
      invoiceUrl: xenditInvoice.invoice_url,
      externalId: externalId,
    });
  } catch (error: any) {
    console.error("TopUp Error:", error?.message || error);
    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
