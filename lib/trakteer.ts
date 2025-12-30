import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface CreateQRISParams {
  quantity: number;
  displayName: string;
  message: string;
  email: string;
}

export interface QRISPaymentResult {
  checkoutUrl: string;
  qrisString: string;
  transactionId: string;
}

export async function createQRISPayment(
  params: CreateQRISParams
): Promise<QRISPaymentResult> {
  const targetUsername = process.env.TRAKTEER_USERNAME;
  const creatorId = process.env.TRAKTEER_CREATOR_ID;
  const unitId = process.env.TRAKTEER_UNIT_ID;

  if (!targetUsername || !creatorId || !unitId) {
    throw new Error("Trakteer configuration missing in environment variables");
  }

  // Create axios instance with cookie jar support (exactly like reference)
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  try {
    const targetPage = `https://trakteer.id/${targetUsername}`;
    console.log(`[Trakteer] Fetching Context from: ${targetPage}`);

    // 1. Fetch Page for CSRF Token & Cookies (exactly like reference)
    const pageRes = await client.get(targetPage, {
      headers: { "User-Agent": USER_AGENT },
    });

    const $ = cheerio.load(pageRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      throw new Error("Failed to fetch CSRF token from Trakteer");
    }

    console.log(`[Trakteer] CSRF Token: ${csrfToken ? "captured" : "MISSING"}`);

    // 2. Create Transaction Payload (exactly like reference)
    const payload = {
      form: "create-tip",
      creator_id: creatorId,
      unit_id: unitId,
      quantity: params.quantity,
      display_name: params.displayName,
      support_message: params.message,
      times: "once",
      payment_method: "qris",
      stream_options: { on_livetip: true },
      guest_email: params.email,
    };

    console.log(
      "[Trakteer] Sending Payload:",
      JSON.stringify(payload, null, 2)
    );

    // 3. Send Payment Request (exactly like reference)
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

    // 4. Handle Response (exactly like reference)
    const checkoutUrl = payRes.data.redirect_url || payRes.data.checkout_url;

    if (!checkoutUrl) {
      console.error(
        "[Trakteer] Failed. No checkout URL returned.",
        payRes.data
      );
      throw new Error("No checkout URL returned from Trakteer");
    }

    console.log(`[Trakteer] Success! Checkout URL: ${checkoutUrl}`);

    // 5. Extract QRIS String (exactly like reference)
    console.log("[Trakteer] Extracting QRIS Data...");
    const checkRes = await client.get(checkoutUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    // Regex to find QRIS (exactly like reference)
    const match =
      checkRes.data.match(/decodeURI\(['"](000201[^'"]+)['"]\)/) ||
      checkRes.data.match(/000201[a-zA-Z0-9.\-_]+/);

    if (!match) {
      console.log(
        "[Trakteer] Warning: Could not extract raw QRIS string from page."
      );
      throw new Error("Failed to extract QRIS string from checkout page");
    }

    let qrisString = match[1] || match[0];
    try {
      qrisString = decodeURIComponent(qrisString);
    } catch (e) {
      // If decode fails, use as-is
    }

    // Extract transaction ID from checkout URL
    const transactionId = checkoutUrl.split("/").pop() || Date.now().toString();

    console.log("[Trakteer] QRIS generated successfully");
    console.log("[Trakteer] QRIS String Length:", qrisString.length);

    return {
      checkoutUrl,
      qrisString,
      transactionId,
    };
  } catch (error: any) {
    console.error("[Trakteer] Critical Error:", error.message);
    if (error.response) {
      console.error(
        "[Trakteer] Response:",
        error.response.status,
        error.response.data
      );
    }
    throw new Error(`Trakteer API Error: ${error.message}`);
  }
}
