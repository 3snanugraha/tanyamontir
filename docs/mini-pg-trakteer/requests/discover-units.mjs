import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const USERNAME = process.env.TRAKTEER_USERNAME || "trisna_nugraha2";

async function discoverUnits() {
  try {
    console.log(`[1] Resolving Internal ID for: ${USERNAME}...`);

    // 1. Get Main Page to find Internal Creator ID
    const pageUrl = `https://trakteer.id/${USERNAME}`;
    const pageRes = await client.get(pageUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    const $ = cheerio.load(pageRes.data);

    // Try scraping ID
    let creatorId = $('input[name="creator_id"]').val();
    if (!creatorId) {
      const html = pageRes.data;
      const match = html.match(/"creator_id":"([^"]+)"/);
      if (match) creatorId = match[1];
    }

    if (!creatorId)
      throw new Error("Could not find Internal Creator ID on page.");
    console.log(`    Creator ID Found: ${creatorId}`);

    // 2. Call Summary API
    const apiUrl = `https://api.trakteer.id/v2/fe/creator/${creatorId}/summary`;
    console.log(`[2] Fetching Units from API: ${apiUrl}`);

    const apiRes = await client.get(apiUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: pageUrl,
        Origin: "https://trakteer.id",
      },
    });

    // 3. Parse & Display Units
    const data = apiRes.data.data;
    if (data && data.active_unit) {
      console.log("\n=== AVAILABLE UNITS ===");
      const unit = data.active_unit.data;
      console.log(
        `[DEFAULT] Name: ${unit.name} | Price: ${unit.price} | ID: ${unit.id}`
      );
      console.log("=======================\n");
    } else {
      console.log("No active unit data found.");
    }
  } catch (e) {
    console.error("Error:", e.message);
    if (e.response) console.log("API Response:", e.response.status);
  }
}

discoverUnits();
