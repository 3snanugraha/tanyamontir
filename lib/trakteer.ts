import axios from "axios";
import * as cheerio from "cheerio";

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

  try {
    const targetPage = `https://trakteer.id/${targetUsername}`;

    // 1. Fetch CSRF Token
    const pageRes = await axios.get(targetPage, {
      headers: { "User-Agent": USER_AGENT },
    });

    const $ = cheerio.load(pageRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      throw new Error("Failed to fetch CSRF token from Trakteer");
    }

    // 2. Create Transaction Payload
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

    // 3. Send Payment Request
    const payRes = await axios.post(
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

    const checkoutUrl = payRes.data.redirect_url || payRes.data.checkout_url;

    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from Trakteer");
    }

    // 4. Extract QRIS String
    const checkRes = await axios.get(checkoutUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    const match =
      checkRes.data.match(/decodeURI\(['"]( 000201[^'"]+)['"]\)/) ||
      checkRes.data.match(/000201[a-zA-Z0-9.\-_]+/);

    if (!match) {
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

    return {
      checkoutUrl,
      qrisString,
      transactionId,
    };
  } catch (error: any) {
    console.error("Trakteer Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.status, error.response.data);
    }
    throw new Error(`Trakteer API Error: ${error.message}`);
  }
}
