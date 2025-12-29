import { prisma } from "./prisma";

/**
 * Check if user has sufficient credits
 */
export async function checkCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.credits >= amount;
}

/**
 * Deduct credits from user account with audit trail
 */
export async function deductCredits(
  userId: string,
  amount: number,
  action: "diagnosis" | "chat",
  sessionId?: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.credits < amount) {
    throw new Error("Insufficient credits");
  }

  // Atomic transaction: deduct credits and log usage
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    }),
    prisma.creditUsage.create({
      data: {
        userId,
        sessionId,
        credits: amount,
        action,
      },
    }),
  ]);
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.credits;
}
