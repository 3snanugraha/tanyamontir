import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// --- Configuration from .env ---
const CONFIG = {
  targetUsername: process.env.TRAKTEER_USERNAME || "trisna_nugraha2",
  creator_id: "l0865y7npbj5bgme",
  unit_id: process.env.TRAKTEER_UNIT_ID || "6grd4eb97gx48kye",
  quantity: parseInt(process.env.TRAKTEER_QUANTITY) || 1,
  displayName: process.env.TRAKTEER_DISPLAY_NAME || "Simple requester",
  message: process.env.TRAKTEER_MESSAGE || "Testing simplified logic",
};

async function execute() {
  try {
    const targetPage = `https://trakteer.id/${CONFIG.targetUsername}`;
    console.log(`[1] Fetching Context from: ${targetPage}`);

    // 1. Fetch Page for CSRF Token & Cookies
    const pageRes = await client.get(targetPage, {
      headers: { "User-Agent": USER_AGENT },
    });
    const $ = cheerio.load(pageRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    console.log(`    CSRF Token: ${csrfToken ? "captured" : "MISSING"}`);

    // 2. Create Transaction Payload
    const payload = {
      form: "create-tip",
      creator_id: CONFIG.creator_id,
      unit_id: CONFIG.unit_id,
      quantity: CONFIG.quantity,
      display_name: CONFIG.displayName,
      support_message: CONFIG.message,
      times: "once",
      payment_method: "qris",
      stream_options: { on_livetip: true },
      guest_email: "simple@example.com",
    };

    console.log("[2] Sending Payload:", JSON.stringify(payload, null, 2));
    const payRes = await client.post(
      "https://trakteer.id/pay/xendit/qris",
      payload,
      {
        headers: {
          "User-Agent": USER_AGENT,
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
          Referer: targetPage,
          Origin: "https://trakteer.id",
        },
      }
    );

    // 3. Handle Response
    const checkoutUrl = payRes.data.redirect_url || payRes.data.checkout_url;

    if (checkoutUrl) {
      console.log(`[3] Success! Checkout URL: ${checkoutUrl}`);

      // Optional: Fetch QRIS string immediately
      console.log("[4] Extracting QRIS Data...");
      const checkRes = await client.get(checkoutUrl, {
        headers: { "User-Agent": USER_AGENT },
      });

      // Regex to find QRIS
      const match =
        checkRes.data.match(/decodeURI\(['"](000201[^'"]+)['"]\)/) ||
        checkRes.data.match(/000201[a-zA-Z0-9.\-_]+/);

      if (match) {
        let qris = match[1] || match[0];
        try {
          qris = decodeURIComponent(qris);
        } catch (e) {}
        console.log("\n=== RAW QRIS PAYLOAD ===");
        console.log(qris);
        console.log("========================\n");
      } else {
        console.log(
          "    Warning: Could not extract raw QRIS string from page."
        );
      }
    } else {
      console.error("    Failed. No checkout URL returned.", payRes.data);
    }
  } catch (e) {
    console.error("Critical Error:", e.message);
    if (e.response)
      console.error("Response:", e.response.status, e.response.data);
  }
}

execute();
