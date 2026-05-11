import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("innovation-portal");
const stories = db.collection("stories");

const now = new Date();

const seed = [
  {
    title: "Noosa-based AgriTech startup secures $2.1M seed round",
    body: `Sunshine Coast agri-tech venture CropSense has closed a $2.1 million seed round led by Rethink Capital Partners, with participation from UniSC's commercialisation arm.\n\nThe startup's soil-sensor platform has been trialled across 14 macadamia and cane farms on the Sunshine Coast hinterland, reducing irrigation water use by an average of 31% in its first full season.\n\nCo-founder Priya Nair said the funding would be used to expand the sensor network to 200 farms by end of 2026 and begin a pilot in the Lockyer Valley. "The data story we can tell growers now is something they've never had access to before," she said.\n\nCropSense is the second agri-tech exit from the UniSC Innovation Hub program in three years.`,
    imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&auto=format&fit=crop",
    featured: true,
    status: "published",
    publishedAt: new Date("2026-04-28"),
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Sunshine Coast named top 3 regional innovation hub in CSIRO report",
    body: `The Sunshine Coast has been ranked third among Australian regional centres for innovation ecosystem strength, according to CSIRO's 2026 Regional Innovation Index released this week.\n\nThe report cited the region's concentration of health-tech and digital businesses, the University of the Sunshine Coast's research commercialisation pipeline, and the Sunshine Coast Council's Digital Economy Strategy as key drivers.\n\nSunshine Coast Council Mayor Rosanna Natoli welcomed the recognition. "This confirms what local founders already know — the infrastructure, the talent, and the collaborative culture here are genuinely world-class for a regional city."\n\nThe index measured 48 regional centres across 12 indicators including startup density, R&D investment, graduate retention, and government innovation spend. The Sunshine Coast ranked first nationally for founder collaboration score.`,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop",
    featured: true,
    status: "published",
    publishedAt: new Date("2026-03-15"),
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "HealthTech founder brings remote diagnostics to rural Queensland",
    body: `When Caloundra-based nurse practitioner Jonah Whitfield couldn't get a specialist appointment for a patient in Gympie for six weeks, he decided to build the solution himself.\n\nThree years later, his company ClearDx has deployed AI-assisted diagnostic triage tools in 11 rural Queensland health clinics, cutting median specialist referral wait times from 34 days to nine.\n\n"The tech is not replacing the clinician — it's giving them better information faster," Whitfield said at last month's Sunshine Coast Health Innovation Forum.\n\nClearDx recently signed a partnership agreement with Queensland Health to expand the platform to 40 additional sites over the next 18 months. The company was incubated through the USC Health Innovation Lab and received early-stage support from the Sunshine Coast Regional Council's Digital Economy Fund.`,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop",
    featured: false,
    status: "published",
    publishedAt: new Date("2026-02-03"),
    createdAt: now,
    updatedAt: now,
  },
];

const existing = await stories.countDocuments();
if (existing > 0) {
  console.log(`Stories collection already has ${existing} documents — skipping seed.`);
} else {
  await stories.insertMany(seed);
  console.log(`Seeded ${seed.length} stories.`);
}

await client.close();
