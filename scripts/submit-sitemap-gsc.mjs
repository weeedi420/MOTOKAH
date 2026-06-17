/**
 * Submit motokah.com sitemap to Google Search Console
 * Uses service account: search-console-reader@tidal-mason-480121-a8.iam.gserviceaccount.com
 * SA is Owner on motokah.com property
 */
import { GoogleAuth } from "google-auth-library";
import { fileURLToPath } from "url";
import path from "path";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KEY_FILE = path.join(ROOT, "secrets", "tidal-mason-sa.json");

const SITE_URL = "sc-domain:motokah.com";
const SITEMAP_URL = "https://www.motokah.com/sitemap.xml";

async function main() {
  const auth = new GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  console.log("Got access token:", token.token ? "✓" : "✗ FAILED");

  // Submit sitemap via GSC API
  const encodedSite = encodeURIComponent(SITE_URL);
  const encodedSitemap = encodeURIComponent(SITEMAP_URL);
  const apiPath = `/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`;

  const result = await new Promise((resolve, reject) => {
    const options = {
      hostname: "www.googleapis.com",
      path: apiPath,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Length": 0,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.end();
  });

  console.log(`Sitemap submit: HTTP ${result.status}`);
  if (result.body) console.log("Response:", result.body);

  if (result.status === 200 || result.status === 204) {
    console.log("\n✅ Sitemap submitted successfully to Google Search Console!");
    console.log(`   Site: ${SITE_URL}`);
    console.log(`   Sitemap: ${SITEMAP_URL}`);
  } else {
    console.log("\n⚠️  Non-2xx response — check output above");
  }

  // Also fetch sitemap info to verify
  const infoResult = await new Promise((resolve, reject) => {
    const options = {
      hostname: "www.googleapis.com",
      path: `/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token.token}` },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.end();
  });

  console.log(`\nSitemap info: HTTP ${infoResult.status}`);
  try {
    const info = JSON.parse(infoResult.body);
    console.log("  lastDownloaded:", info.lastDownloaded || "pending");
    console.log("  isPending:", info.isPending);
    console.log("  isSitemapsIndex:", info.isSitemapsIndex);
    if (info.contents) {
      for (const c of info.contents) {
        console.log(`  - ${c.type}: ${c.submitted} submitted, ${c.indexed} indexed`);
      }
    }
  } catch {
    console.log("  Body:", infoResult.body.slice(0, 300));
  }
}

main().catch(console.error);
