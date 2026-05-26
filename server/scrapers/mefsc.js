import * as cheerio from "cheerio";

const URL = "https://mefsc.org.au/events/";
const MONTHS = { january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };

function parseDate(str) {
  // "Wednesday, 29 April, 4:45pm - 7pm AEST" or "Tuesday, 12 May 4pm - 6pm AEST"
  const m = str.match(/(\d{1,2})\s+(\w+)/i);
  if (!m) return null;
  const [, day, month] = m;
  const mo = MONTHS[month.toLowerCase()];
  if (mo === undefined) return null;
  const yr = new Date().getFullYear();
  return `${yr}-${String(mo + 1).padStart(2, "0")}-${String(parseInt(day)).padStart(2, "0")}`;
}

export async function scrapeMefsc() {
  const res = await fetch(URL, { headers: { "User-Agent": "StartupSC Portal/1.0" } });
  if (!res.ok) throw new Error(`MEFSC fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  // Scope to the "Upcoming events" section only — section index 1 on the page
  const $section = $(".ct-section").filter((_, el) => $(el).find("h1, h2").text().includes("Upcoming events")).first();
  if (!$section.length) return events;

  $section.find(".ct-div-block").each((_, block) => {
    const $block = $(block);
    const $btn = $block.children("a.ct-link-button");
    if (!$btn.length) return;
    if (/coming soon/i.test($btn.text())) return;

    const title = $block.children(".ct-text-block").first().text().trim();
    if (!title) return;

    const $innerDivs = $block.children(".ct-div-block");
    if ($innerDivs.length < 2) return;

    const dateRaw = $innerDivs.eq(0).find(".ct-text-block").first().text().trim();
    const locHtml = $innerDivs.eq(1).find(".ct-text-block").first().html() || "";
    const location = locHtml.split(/<br\s*\/?>/i)[0].replace(/<[^>]+>/g, "").trim() || "Sunshine Coast";

    const rsvpUrl = $btn.attr("href") || "#";
    const sourceUrl = rsvpUrl !== "#" ? rsvpUrl : `${URL}#${encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-"))}`;

    const key = `${title}::${dateRaw}`;
    if (seen.has(key)) return;
    seen.add(key);

    const date = parseDate(dateRaw);

    events.push({
      title,
      description: `${title} — a Manufacturing Excellence Forum Sunshine Coast event.`,
      date: date ?? dateRaw,
      location,
      type: "Other",
      organizer: "Manufacturing Excellence Forum SC",
      rsvpUrl: rsvpUrl !== "#" ? rsvpUrl : URL,
      imageUrl: null,
      sourceUrl,
      source: "MEFSC",
    });
  });

  return events;
}
