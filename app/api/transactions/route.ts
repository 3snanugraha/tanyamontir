import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user's transactions with package details
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { package: true },
      orderBy: { createdAt: "desc" },
      take: 10, // Last 10 transactions
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch Transactions Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
