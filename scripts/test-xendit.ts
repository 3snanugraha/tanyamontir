// scripts/test-xendit.ts
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Manually load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envConfig = dotenv.parse(fs.readFileSync(envPath));

console.log("Testing Xendit Connection...");
const mode = envConfig.XENDIT_MODE;
console.log("Mode:", mode);

const apiKey =
  mode === "PRODUCTION"
    ? envConfig.XENDIT_PRODUCTION_SECRET_KEY || envConfig.XENDIT_PRODUCTION_KEY
    : envConfig.XENDIT_DEVELOPMENT_SECRET_KEY ||
      envConfig.XENDIT_DEVELOPMENT_KEY;

console.log("API Key present:", !!apiKey);
if (apiKey) {
  if (apiKey.includes("public")) {
    console.error(
      "WARNING: You are using a PUBLIC KEY. Please use SECRET KEY for backend operations."
    );
  }
  console.log("API Key prefix:", apiKey.substring(0, 15) + "...");
}

async function testConnection() {
  if (!apiKey) {
    console.error("No API Key found!");
    return;
  }

  const token = Buffer.from(apiKey + ":").toString("base64");
  const externalId = `TEST-${Date.now()}`;

  try {
    console.log("Sending request to Xendit...");
    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: 10000,
        payer_email: "test@example.com",
        description: "Test Connection via Script",
      }),
    });

    const data = await response.json();
    console.log("Status:", response.status);

    if (!response.ok) {
      console.error("Xendit API Error Check:");
      console.error(JSON.stringify(data, null, 2));
    } else {
      console.log("Success! Invoice created.");
      console.log("Invoice URL:", data.invoice_url);
    }
  } catch (error) {
    console.error("Network/Script Error:", error);
  }
}

testConnection();
