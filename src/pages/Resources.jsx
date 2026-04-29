import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

const resources = [
  {
    title: "Business Planning",
    description:
      "Templates, frameworks, and guides to help you validate your idea and build a solid business case.",
    detail1: "Covers lean canvas, financial modelling, and go-to-market planning.",
    detail2: "Suited to early-stage founders through to scaling ventures.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
  {
    title: "Funding & Grants",
    description:
      "Local, state, and federal funding opportunities, grants, and incentives for early-stage and growing ventures.",
    detail1: "Includes Advance Queensland, CSIRO programmes, and private grant databases.",
    detail2: "Updated regularly as new rounds open.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  },
  {
    title: "Networks & Mentors",
    description:
      "Connect with experienced founders, mentors, and industry leaders who have been where you are.",
    detail1: "Links to Sunshine Coast and broader Queensland mentor networks.",
    detail2: "Includes peer founder groups and industry-specific communities.",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
  },
  {
    title: "Legal & Compliance",
    description:
      "Plain-English guidance on business structures, IP, contracts, and regulatory requirements.",
    detail1: "Covers company registration, founder agreements, and IP basics.",
    detail2: "Links to Queensland Business and ACCC resources.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  },
  {
    title: "Digital Tools",
    description:
      "Recommended platforms and tools to help you build, manage, and scale your startup.",
    detail1: "Covers product, operations, marketing, and team collaboration.",
    detail2: "Includes free tiers and startup discount programmes.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  },
  {
    title: "Market Research",
    description:
      "Tools and resources to understand your market, validate demand, and size your opportunity.",
    detail1: "Includes ABS data, industry reports, and customer discovery frameworks.",
    detail2: "Useful for pitch preparation and investor due diligence.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "Sustainability",
    description:
      "Frameworks and support for building environmental and social responsibility into your business from day one.",
    detail1: "Covers B Corp certification, carbon measurement, and ESG basics.",
    detail2: "Links to Queensland sustainability grants and programmes.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
  },
  {
    title: "Talent & Hiring",
    description:
      "Find the right people, understand your obligations as an employer, and build a team that lasts.",
    detail1: "Covers Fair Work obligations, equity agreements, and hiring platforms.",
    detail2: "Links to UniSC graduate networks and regional talent pipelines.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
  {
    title: "Accelerators",
    description:
      "Structured programmes offering mentorship, funding pathways, and networks to accelerate your growth.",
    detail1: "Includes local, national, and sector-specific accelerators.",
    detail2: "Covers application tips and what to expect from each programme.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
    title: "Working Spaces",
    description:
      "Hot desks, dedicated offices, and collaborative environments across the Sunshine Coast.",
    detail1: "From beachside hubs to university precincts and CBD co-working.",
    detail2: "Includes day pass options through to long-term leases.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  },
];

function ResourceCard({ resource, reduceMotion }) {
  const [flipped, setFlipped] = useState(false);
  const { ref, onMouseMove, onMouseLeave, cardStyle, imgStyle } = useTilt(reduceMotion || flipped);

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
            className="absolute inset-0 flex flex-col p-4 xl:p-5 gap-2.5 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <span className="font-black bg-amber-400 text-slate-900 text-sm uppercase px-2 py-0.5 rounded-full w-fit shrink-0">
              {resource.title}
            </span>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {resource.description}
            </p>
            <div className="h-px bg-slate-100 shrink-0" />
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{resource.detail1}</p>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{resource.detail2}</p>
            <p className="text-xs text-slate-300 font-medium mt-auto">Tap to close</p>
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

        <div className="px-8 md:px-16 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 xl:grid-cols-5 gap-3 xl:gap-4">
            {resources.map((r) => (
              <ResourceCard key={r.title} resource={r} reduceMotion={reduceMotion} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Resources;
