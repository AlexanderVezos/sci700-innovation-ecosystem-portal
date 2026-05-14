import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

const LEVELUP_BASE =
  "https://levelup.sunshinecoast.qld.gov.au/business-upgrades";

const resources = [
  {
    title: "Business Planning",
    description:
      "Get your business off to the best start or map your business growth. Business planning helps you identify exactly what your business is and its journey to success.",
    detail1:
      "LevelUp walks you through registering your ABN, business name, and GST, with a checklist to track where you are up to.",
    detail2:
      "Covers everything from sole traders to companies, whether you are just starting out or formalising an existing operation.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    link: `${LEVELUP_BASE}/business-planning`,
  },
  {
    title: "Funding & Grants",
    description:
      "Find opportunities from government and the private sector that will help raise capital, build capabilities, and invest in innovation.",
    detail1:
      "State government programs include Business Basics, Business Boost, and the Business Growth Fund, each targeting different stages of growth.",
    detail2:
      "SunCoast Angels is a local seed fund for ventures seeking $50,000 or more that can demonstrate a sustainable competitive advantage.",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    link: `${LEVELUP_BASE}/grants-funding-and-programs`,
  },
  {
    title: "Networks & Mentors",
    description:
      "Build networks with your local Chamber of Commerce, industry groups, and the wider Sunshine Coast business community.",
    detail1:
      "The Sunshine Coast has 14 Chambers of Commerce, covering areas from Caloundra and Kawana through to Maleny, Montville, and Nambour.",
    detail2:
      "Each Chamber runs its own events, advocacy, and membership programs. The Young Chamber is worth a look if you are an early-stage founder.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    link: `${LEVELUP_BASE}/networks-and-support`,
  },
  {
    title: "Legal & Compliance",
    description:
      "Starting or expanding a business? Investigate the local, state, and federal permits, licences, and regulations relevant to you.",
    detail1:
      "Covers local permits for food businesses, tourism and accommodation, beauty and tattooing, and environmentally relevant activities.",
    detail2:
      "The Development.i platform lets you search, track, and get alerts on development applications across the Sunshine Coast local government area.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    link: `${LEVELUP_BASE}/permits-licences-and-regulations`,
  },
  {
    title: "Digital Tools",
    description:
      "Harness online tools, programs, and strategies to improve processes, collaboration, and innovation in the workplace.",
    detail1:
      "LevelUp covers advertising channels outside Meta and Google, including Reddit, TikTok, Pinterest, Snapchat, and ROKT.",
    detail2:
      "Worth noting the content is from 2022 so some platform details may be dated, but the strategic framing still holds.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    link: `${LEVELUP_BASE}/digital-upskilling`,
  },
  {
    title: "Market Research",
    description:
      "Understand your market before you commit to it. Tools and data to validate demand, size your opportunity, and identify who you are selling to.",
    detail1:
      "ABS data and industry reports give you a starting point. Customer discovery interviews get you the rest.",
    detail2:
      "Knowing your market size and who you are selling to is the foundation of any serious investor conversation.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    link: LEVELUP_BASE,
  },
  {
    title: "Sustainability",
    description:
      "Sustainability can increase operational efficiencies, improve consumer attractiveness, and consolidate business relationships.",
    detail1:
      "LevelUp's guide walks through measuring your waste output, finding local recyclers, and switching to better waste collection arrangements.",
    detail2:
      "Upparel is listed as a textile recovery option for businesses with uniforms, offcuts, or unsold stock.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    link: `${LEVELUP_BASE}/sustainability-in-business`,
  },
  {
    title: "Talent & Hiring",
    description:
      "Find the right people and understand your obligations as an employer. Resources covering hiring, contractor arrangements, and local talent pipelines.",
    detail1:
      "UniSC runs graduate placement programs that are underused by local businesses. Worth reaching out directly if you need early-career talent.",
    detail2:
      "Your local Chamber of Commerce is also a good first call for referrals into regional hiring networks and job boards.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    link: `${LEVELUP_BASE}/networks-and-support`,
  },
  {
    title: "Accelerators",
    description:
      "Digitalisation has evolved how businesses operate and work in a global economy. Businesses can now harness online tools, programs and strategies to help improve processes, collaboration and innovation in the workplace.",
    detail1:
      "LevelUp covers how to use online tools and digital platforms to improve collaboration, workflows, and day-to-day operations.",
    detail2:
      "Includes guidance on digital advertising channels, automation tools, and strategies for running a more connected team.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    link: `${LEVELUP_BASE}/digital-upskilling`,
  },
  {
    title: "Working Spaces",
    description:
      "Find the right space to conduct your work and get your idea off the ground. Buildings for lease, hot desks, event spaces, and more across the Sunshine Coast.",
    detail1:
      "Options range from beachside co-working hubs and university precincts to CBD offices and dedicated innovation spaces.",
    detail2:
      "Most venues offer flexible arrangements from day passes through to long-term leases, so you can trial before you commit.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    link: LEVELUP_BASE,
  },
];

function ResourceCard({ resource, reduceMotion }) {
  const [flipped, setFlipped] = useState(false);
  const { ref, onMouseMove, onMouseLeave, cardStyle, imgStyle } = useTilt(
    reduceMotion || flipped,
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={cardStyle}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer select-none h-80 xl:h-96"
      onClick={() => setFlipped((f) => !f)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!flipped ? (
          <motion.div
            key="front"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="h-40 xl:h-52 overflow-hidden shrink-0">
              <motion.img
                src={resource.image}
                alt={resource.title}
                style={imgStyle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1 overflow-hidden">
              <span className="font-black bg-amber-400 text-slate-900 text-sm uppercase px-2 py-0.5 rounded-full w-fit shrink-0">
                {resource.title}
              </span>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                {resource.description}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className="absolute inset-0 flex flex-col p-4 xl:p-5 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <span className="font-black bg-amber-400 text-slate-900 text-sm uppercase px-2 py-0.5 rounded-full w-fit shrink-0">
              {resource.title}
            </span>
            <p className="text-sm text-slate-500 leading-relaxed">
              {resource.detail1}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              {resource.detail2}
            </p>
            <div className="mt-auto flex flex-col gap-2">
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 font-medium">
                  Tap to close
                </p>
                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-600 underline underline-offset-2"
                  >
                    Visit LevelUp →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Resources() {
  const { reduceMotion } = useMotion();

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              Everything you need
              <br />
              to build.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Practical guides, tools, and programmes to help you start, fund,
              and grow your venture on the Sunshine Coast.
            </p>
          </div>
        </div>

        <div className="px-8 md:px-16 pt-10 pb-4">
          <div className="max-w-7xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-slate-600 leading-relaxed flex-1">
              Resources on this page link to{" "}
              <a
                href="https://levelup.sunshinecoast.qld.gov.au/business-upgrades"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800"
              >
                LevelUp Sunshine Coast
              </a>
              , a business support programme run by Sunshine Coast Council. Flip
              a card to find the link. This portal was developed as a research
              prototype at the request of Sunshine Coast Council and is not an
              official Council product or service.
            </p>
          </div>
        </div>

        <div className="px-8 md:px-16 py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 xl:grid-cols-5 gap-3 xl:gap-4">
            {resources.map((r) => (
              <ResourceCard
                key={r.title}
                resource={r}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Resources;
