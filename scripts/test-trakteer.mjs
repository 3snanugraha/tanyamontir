// Test script to verify Trakteer API connection
import { createQRISPayment } from "./lib/trakteer.js";

async function test() {
  try {
    console.log("Testing Trakteer QRIS generation...\n");

    const result = await createQRISPayment({
      quantity: 5, // Rp 5,000
      displayName: "Test User",
      message: "Testing Trakteer Integration",
      email: "test@tanyamontir.com",
    });

    console.log("\n✅ SUCCESS!");
    console.log("Checkout URL:", result.checkoutUrl);
    console.log("Transaction ID:", result.transactionId);
    console.log("QRIS String Length:", result.qrisString.length);
    console.log("\nQRIS Preview:", result.qrisString.substring(0, 50) + "...");
  } catch (error) {
    console.error("\n❌ FAILED!");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

test();
