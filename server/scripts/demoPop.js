// Usage: node server/scripts/demoPop.js [delay_seconds]
// Default delay: 4 seconds between each entry.
// Auto-approve must be ON in /admin before running.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const entries = JSON.parse(readFileSync(join(__dir, "../seed.json"), "utf-8"));
const delay = parseFloat(process.argv[2] ?? "1.5") * 1000;
const BASE = "http://localhost:3002";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

console.log(`\nDemo pop — ${entries.length} entries, ${delay / 1000}s apart`);
console.log("Make sure auto-approve is ON in /admin, then press Enter to start...\n");

process.stdin.once("data", async () => {
  process.stdin.destroy();

  for (let i = 0; i < entries.length; i++) {
    const { name, tag, description, year, employees, stage, email, website, phone } = entries[i];

    try {
      const res = await fetch(`${BASE}/api/startups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tag, description, year, employees, stage, email, website, phone }),
      });

      const label = `[${String(i + 1).padStart(2, "0")}/${entries.length}] ${name}`;
      if (res.ok) {
        console.log(`✓ ${label}`);
      } else {
        const body = await res.json().catch(() => ({}));
        console.log(`✕ ${label} — ${body.error ?? res.status}`);
      }
    } catch (err) {
      console.log(`✕ [${i + 1}] ${entries[i].name} — ${err.message}`);
    }

    if (i < entries.length - 1) await sleep(delay);
  }

  console.log("\nDone.");
});
