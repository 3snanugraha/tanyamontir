import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify session ownership and reset message count
    const chatSession = await prisma.chatSession.updateMany({
      where: {
        id: sessionId,
        userId: session.user.id, // Ensure user owns this session
      },
      data: {
        messageCount: 0,
      },
    });

    if (chatSession.count === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting message count:", error);
    return NextResponse.json(
      { error: "Failed to reset message count" },
      { status: 500 }
    );
  }
}
