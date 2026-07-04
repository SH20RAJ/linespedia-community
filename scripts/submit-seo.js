const fs = require('fs');
const path = require('path');

// Manually load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.warn("Could not load .env.local", e);
}

const BING_API_KEY = process.env.BING_API_KEY;
const INDEXNOW_KEY = "65839f7685f34767abd5f5233cb141b4";
const HOST = "linespedia.com";

async function submitSeo() {
  console.log("=== SEO Submission Script ===");
  console.log("Loading all active URLs from production API...");

  let writings = [];
  try {
    const res = await fetch("https://linespedia-community.shraj.workers.dev/api/v1/writings?limit=50000");
    if (!res.ok) throw new Error(`API status: ${res.status}`);
    const json = await res.json();
    writings = json.data || [];
  } catch (e) {
    console.error("Failed to fetch writings list:", e);
    return;
  }

  const baseUrls = [
    "https://linespedia.com",
    "https://linespedia.com/explore",
    "https://linespedia.com/about",
    "https://linespedia.com/contact",
    "https://linespedia.com/privacy",
    "https://linespedia.com/terms",
    "https://linespedia.com/latest",
    "https://linespedia.com/trending",
  ];

  const postUrls = writings.map(w => `https://linespedia.com/post/${w.slug}`);
  const urlList = [...baseUrls, ...postUrls];
  console.log(`Total URLs found: ${urlList.length}`);

  // 1. Submit to IndexNow API
  console.log("\n--- Submitting to IndexNow ---");
  try {
    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urlList
      })
    });
    console.log(`IndexNow Status: ${indexNowRes.status} (${indexNowRes.statusText})`);
  } catch (e) {
    console.error("IndexNow submission failed:", e);
  }

  // 2. Submit to Bing Webmaster Submission API in batches of 50
  if (!BING_API_KEY) {
    console.log("\n[Skip] Bing API Key not found in env. Skipping direct Bing submissions.");
    return;
  }

  console.log("\n--- Submitting to Bing Webmaster Submission API ---");
  const batchSize = 50;
  for (let i = 0; i < urlList.length; i += batchSize) {
    const batch = urlList.slice(i, i + batchSize);
    console.log(`Submitting batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs)...`);

    try {
      const res = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          siteUrl: `https://${HOST}`,
          urlList: batch
        })
      });

      if (res.ok) {
        console.log(`Batch ${Math.floor(i / batchSize) + 1} Succeeded! Status: ${res.status}`);
      } else {
        const errText = await res.text();
        console.error(`Batch ${Math.floor(i / batchSize) + 1} Failed. Status: ${res.status}, Response: ${errText}`);
      }
    } catch (e) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} Request error:`, e);
    }
  }

  console.log("\n=== SEO Submission Complete ===");
}

submitSeo().catch(console.error);
