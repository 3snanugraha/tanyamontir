import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const packages = [
    { name: "Paket Pemula", credits: 1, price: 5000 }, // qty: 5 (Rp 5,000)
    { name: "Paket Hemat", credits: 3, price: 25000 }, // qty: 25 (Rp 25,000)
    { name: "Paket Mantap", credits: 5, price: 35000 }, // qty: 35 (Rp 35,000)
    { name: "Paket Sultan", credits: 10, price: 80000 }, // qty: 80 (Rp 80,000)
  ];

  try {
    // Delete existing to avoid duplicates if re-run (optional, or upgrade to upsert)
    // For safety, let's just create if not exists or upsert using name as unique key?
    // Since name isn't unique in schema, I'll delete all first or check count.

    // Simple approach: Delete all and recreate.
    await prisma.creditPackage.deleteMany({});

    for (const pkg of packages) {
      await prisma.creditPackage.create({
        data: pkg,
      });
    }

    return NextResponse.json({ success: true, message: "Packages seeded" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
