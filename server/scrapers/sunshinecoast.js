import * as cheerio from "cheerio";

const BASE = "https://events.sunshinecoast.qld.gov.au";
const URL  = `${BASE}/category/business-trade`;
const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-AU,en;q=0.9",
};

function parseDate(str) {
  const m = str.match(/(\d{1,2})\s+(\w{3})/i);
  if (!m) return null;
  const [, day, month] = m;
  const mo = MONTHS[month.slice(0,3).toLowerCase()];
  if (mo === undefined) return null;
  const yr = new Date().getFullYear();
  return `${yr}-${String(mo + 1).padStart(2, "0")}-${String(parseInt(day)).padStart(2, "0")}`;
}

async function fetchOrganizer(url) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const $ = cheerio.load(await res.text());
    return $(".orginizer span").first().text().trim() || null;
  } catch {
    return null;
  }
}

export async function scrapeSunshineCoast() {
  const res = await fetch(URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`SC Events fetch failed: ${res.status}`);
  const $ = cheerio.load(await res.text());
  const raw = [];
  const seen = new Set();

  $(".item").each((_, el) => {
    const $el = $(el);
    const $mainImg = $el.find("a.main-img");
    if (!$mainImg.length) return;

    const title = $mainImg.attr("title") || $el.find("h3 a.title span").text().trim();
    const href  = $mainImg.attr("href") || $el.find("h3 a.title").attr("href");
    if (!title || !href) return;

    const fullUrl = `${BASE}${href}`;
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);

    raw.push({
      title,
      description: $el.find(".desc-content").text().trim(),
      date: parseDate($el.find("p.date").text().trim()),
      dateRaw: $el.find("p.date").text().trim(),
      location: $el.find("p.location").text().trim() || "Sunshine Coast",
      imageUrl: $mainImg.find("img").attr("data-src") || null,
      fullUrl,
    });
  });

  // Fetch organizers concurrently
  const organizers = await Promise.all(raw.map(e => fetchOrganizer(e.fullUrl)));

  return raw.map((e, i) => ({
    title: e.title,
    description: e.description || `${e.title} — a Sunshine Coast Council business and trade event.`,
    date: e.date ?? e.dateRaw,
    location: e.location,
    type: "Other",
    organizer: organizers[i] || "Sunshine Coast Council",
    rsvpUrl: e.fullUrl,
    imageUrl: e.imageUrl,
    sourceUrl: e.fullUrl,
    source: "Sunshine Coast Council",
  }));
}
