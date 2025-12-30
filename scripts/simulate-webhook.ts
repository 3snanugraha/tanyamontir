// scripts/simulate-webhook.ts
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Manually load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Assign to process.env so Prisma can pick it up
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const prisma = new PrismaClient();

async function simulateWebhook() {
  try {
    console.log("Looking for latest PENDING transaction...");
    const transaction = await prisma.transaction.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { package: true },
    });

    if (!transaction) {
      console.log("No PENDING transaction found.");
      return;
    }

    console.log(
      `Found Transaction: ${transaction.externalId} (${transaction.package.name})`
    );

    // Prepare Webhook Payload
    const payload = {
      id: "inv_" + Date.now(),
      external_id: transaction.externalId,
      user_id: "user_" + Date.now(),
      status: "PAID",
      merchant_name: "TanyaMontir",
      amount: transaction.amount,
      paid_amount: transaction.amount,
      paid_at: new Date().toISOString(),
      payer_email: "test@example.com",
      description: "Simulation Webhook",
      created: transaction.createdAt.toISOString(),
      updated: new Date().toISOString(),
      currency: "IDR",
      payment_method: "VIRTUAL_ACCOUNT",
    };

    const webhookToken =
      envConfig.XENDIT_MODE === "PRODUCTION"
        ? envConfig.XENDIT_PRODUCTION_WEBHOOK_TOKEN
        : envConfig.XENDIT_DEVELOPMENT_WEBHOOK_TOKEN;

    console.log("Sending Webhook Simulation to localhost:3000...");

    const response = await fetch("http://localhost:3000/api/webhooks/xendit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-callback-token": webhookToken || "",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response Status:", response.status);
    const data = await response.text();
    console.log("Response Body:", data);
  } catch (error) {
    console.error("Simulation Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateWebhook();
