import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3001;
const WEBHOOK_TOKEN = process.env.TRAKTEER_WEBHOOK_TOKEN;

// Middleware
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Trakteer Webhook Listener is Running...");
});

app.post("/webhook", (req, res) => {
  const receivedToken = req.headers["x-webhook-token"];

  // 1. Security Check
  if (WEBHOOK_TOKEN && receivedToken !== WEBHOOK_TOKEN) {
    console.error(`[!] Unauthorized Webhook Attempt. Token: ${receivedToken}`);
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2. Process Payload
  const data = req.body;
  console.log("\n--- 🔔 NEW WEBHOOK NOTIFICATION ---");
  console.log(`ID      : ${data.transaction_id}`);
  console.log(`Supporter: ${data.supporter_name}`);
  console.log(`Amount  : ${data.net_amount} (${data.unit})`);
  console.log(`Message : ${data.supporter_message}`);
  console.log("------------------------------------");

  // Optional: Log full payload for debug
  // console.log(JSON.stringify(data, null, 2));

  // 3. Respond immediately
  res.status(200).send("OK");
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Webhook Listener running on http://localhost:${PORT}`);
  console.log(`👉 Webhook URL: http://localhost:${PORT}/webhook (Local)`);
  if (WEBHOOK_TOKEN) console.log("🔒 Token Verification: ENABLED");
  else
    console.log(
      "⚠️ Token Verification: DISABLED (Set TRAKTEER_WEBHOOK_TOKEN in .env)"
    );
});
