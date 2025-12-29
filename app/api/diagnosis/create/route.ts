import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkCredits, deductCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleData, category, symptoms, answers } = body;

    // Validate required fields
    if (!vehicleData || !category || !symptoms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has sufficient credits (1 credit for diagnosis)
    const hasCredits = await checkCredits(session.user.id, 1);

    if (!hasCredits) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Create diagnosis session
    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        brand: String(vehicleData.brand),
        model: String(vehicleData.model),
        year: String(vehicleData.year),
        odometer: String(vehicleData.odometer),
        transmission: String(vehicleData.transmission),
        fuel: String(vehicleData.fuel),
        category,
        symptoms,
        answers: answers || {},
        messageCount: 0,
        isActive: true,
      },
    });

    // Deduct 1 credit for diagnosis
    await deductCredits(session.user.id, 1, "diagnosis", chatSession.id);

    return NextResponse.json({
      sessionId: chatSession.id,
      success: true,
    });
  } catch (error) {
    console.error("Error creating diagnosis session:", error);

    if (error instanceof Error && error.message === "Insufficient credits") {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create diagnosis session" },
      { status: 500 }
    );
  }
}
