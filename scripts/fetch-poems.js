const PASSCODE = "17092006";
const TARGET_URL = "https://linespedia-community.shraj.workers.dev/api/v1/admin/seed-poems";

async function run() {
  console.log("Triggering server-side classical poetry fetch and seed...");
  
  const res = await fetch(TARGET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      passcode: PASSCODE
    })
  });

  const json = await res.json();
  if (res.ok) {
    console.log(`Success! Seeded ${json.seededCount} new classical poems to the database.`);
  } else {
    console.error("Seeding failed on server:", json);
  }
}

run().catch(console.error);
