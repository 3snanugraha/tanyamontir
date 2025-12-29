import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { deductCredits, checkCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, action, sessionId } = body;

    if (!amount || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has sufficient credits
    const hasCredits = await checkCredits(session.user.id, amount);

    if (!hasCredits) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Deduct credits
    await deductCredits(session.user.id, amount, action, sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deducting credits:", error);

    if (error instanceof Error && error.message === "Insufficient credits") {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
