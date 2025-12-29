import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getCreditBalance } from "@/lib/credits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await getCreditBalance(session.user.id);

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
