// Usage: node server/scripts/seedRandom.js
// Auto-approve must be ON in /admin before running.

const BASE = "http://localhost:3002";
const COUNT = 150;

const TYPES = ["Startup", "Investor", "Research Institution", "Industry Partner", "Government"];

const TAGS = [
  "AgriTech", "CleanTech", "Creative Industries", "EdTech", "FinTech",
  "HealthTech", "Manufacturing", "Professional Services", "Tourism & Hospitality", "Other",
];

const STAGES = ["Idea", "MVP", "Growth"];

const EMAIL_DOMAINS = ["gmail.com", "outlook.com", "bigpond.com", "icloud.com"];

const WORDS_A = [
  "Coast", "Reef", "Solar", "Pacific", "Hinterland", "Noosa", "Caloundra", "Marochy",
  "Sunny", "Coral", "Ginger", "Ironbark", "Banksia", "Dune", "Tide", "Canopy",
  "Summit", "Anchor", "Ember", "Flint", "Cedar", "Wattle", "Prism", "Nexus",
];

const WORDS_B = [
  "Tech", "Labs", "Works", "Ventures", "Studio", "Digital", "Health", "Eco",
  "Data", "Smart", "Green", "Blue", "Forward", "Dynamics", "Systems", "Hub",
  "Collective", "Partners", "Group", "Industries", "Innovations", "Research",
];

const SUFFIXES = ["", "", "", " Co", " Pty Ltd", " Australia", " Group", " SC"];

const DESC_TEMPLATES = [
  (t) => `${t} focused on delivering practical outcomes for Sunshine Coast businesses and communities.`,
  (t) => `Building ${t.toLowerCase()} solutions tailored to the regional Queensland market.`,
  (t) => `A Sunshine Coast-based organisation working in ${t.toLowerCase()} with local government and industry.`,
  (t) => `Connecting ${t.toLowerCase()} expertise across the Sunshine Coast ecosystem.`,
  (t) => `Developing ${t.toLowerCase()} products and services for the Australian market from the Sunshine Coast.`,
  (t) => `Providing ${t.toLowerCase()} capability to SMEs, councils, and research partners across South-East Queensland.`,
  (t) => `Working at the intersection of ${t.toLowerCase()} and community impact on the Sunshine Coast.`,
  (t) => `Regional ${t.toLowerCase()} organisation supporting local businesses, startups, and institutions.`,
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function genName() {
  return `${pick(WORDS_A)} ${pick(WORDS_B)}${pick(SUFFIXES)}`;
}

function genPhone() {
  return `04${randInt(10, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`;
}

function genEmail(name) {
  const slug = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12);
  return `${slug}@${pick(EMAIL_DOMAINS)}`;
}

function genWebsite(name) {
  const slug = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 16);
  return `https://${slug}.com.au`;
}

function genEntry(i) {
  const type = TYPES[i % TYPES.length];
  const tags = pickN(TAGS, 1, type === "Startup" ? 2 : 3);
  const primaryTag = tags[0];
  const description = pick(DESC_TEMPLATES)(primaryTag);
  const name = genName();

  const entry = {
    type,
    name,
    tags,
    description,
    email: Math.random() > 0.2 ? genEmail(name) : "",
    website: Math.random() > 0.3 ? genWebsite(name) : "",
    phone: Math.random() > 0.4 ? genPhone() : "",
  };

  if (type === "Startup") {
    entry.stage = pick(STAGES);
    entry.year = randInt(2015, 2025);
    entry.employees = randInt(1, 40);
  }

  if (type === "Research Institution") {
    entry.year = randInt(1990, 2020);
    entry.employees = randInt(5, 200);
  }

  return entry;
}

const entries = Array.from({ length: COUNT }, (_, i) => genEntry(i));

console.log(`\nSeed — ${COUNT} random entries`);
console.log("Make sure auto-approve is ON in /admin, then press Enter...\n");

process.stdin.once("data", async () => {
  process.stdin.destroy();
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < entries.length; i++) {
    try {
      const res = await fetch(`${BASE}/api/startups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries[i]),
      });
      if (res.ok) {
        ok++;
        process.stdout.write(`\r${ok + fail}/${COUNT}`);
      } else {
        fail++;
        const body = await res.json().catch(() => ({}));
        console.log(`\n✕ ${entries[i].name} — ${body.error ?? res.status}`);
      }
    } catch (err) {
      fail++;
      console.log(`\n✕ ${entries[i].name} — ${err.message}`);
    }
  }

  console.log(`\n\nDone. ${ok} inserted, ${fail} failed.`);
});
