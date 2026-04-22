import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

const resources = [
  {
    title: "Business Planning",
    description:
      "Templates, frameworks, and guides to help you validate your idea and build a solid business case.",
    detail1:
      "Covers lean canvas, financial modelling, and go-to-market planning.",
    detail2: "Suited to early-stage founders through to scaling ventures.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
  {
    title: "Funding & Grants",
    description:
      "Local, state, and federal funding opportunities, grants, and incentives for early-stage and growing ventures.",
    detail1:
      "Includes Advance Queensland, CSIRO programmes, and private grant databases.",
    detail2: "Updated regularly as new rounds open.",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  },
  {
    title: "Networks & Mentors",
    description:
      "Connect with experienced founders, mentors, and industry leaders who have been where you are.",
    detail1: "Links to Sunshine Coast and broader Queensland mentor networks.",
    detail2: "Includes peer founder groups and industry-specific communities.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
  },
  {
    title: "Legal & Compliance",
    description:
      "Plain-English guidance on business structures, IP, contracts, and regulatory requirements.",
    detail1: "Covers company registration, founder agreements, and IP basics.",
    detail2: "Links to Queensland Business and ACCC resources.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  },
  {
    title: "Digital Tools",
    description:
      "Recommended platforms and tools to help you build, manage, and scale your startup.",
    detail1: "Covers product, operations, marketing, and team collaboration.",
    detail2: "Includes free tiers and startup discount programmes.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  },
  {
    title: "Market Research",
    description:
      "Tools and resources to understand your market, validate demand, and size your opportunity.",
    detail1:
      "Includes ABS data, industry reports, and customer discovery frameworks.",
    detail2: "Useful for pitch preparation and investor due diligence.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "Sustainability",
    description:
      "Frameworks and support for building environmental and social responsibility into your business from day one.",
    detail1: "Covers B Corp certification, carbon measurement, and ESG basics.",
    detail2: "Links to Queensland sustainability grants and programmes.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
  },
  {
    title: "Talent & Hiring",
    description:
      "Find the right people, understand your obligations as an employer, and build a team that lasts.",
    detail1:
      "Covers Fair Work obligations, equity agreements, and hiring platforms.",
    detail2: "Links to UniSC graduate networks and regional talent pipelines.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
  {
    title: "Accelerators",
    description:
      "Structured programmes offering mentorship, funding pathways, and networks to accelerate your growth.",
    detail1: "Includes local, national, and sector-specific accelerators.",
    detail2: "Covers application tips and what to expect from each programme.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
    title: "Working Spaces",
    description:
      "Hot desks, dedicated offices, and collaborative environments across the Sunshine Coast.",
    detail1: "From beachside hubs to university precincts and CBD co-working.",
    detail2: "Includes day pass options through to long-term leases.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  },
];

const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 1 };

// 5 cols × 2 rows = 10 cards, 12 row-tracks total.
// Normal: each card spans 1 col × 6 tracks.
// Expanded: 2 cols × 12 tracks. Remaining 9 cards fill 3 cols × 3 cards × 4 tracks each.
function computeGridStyles(expandedId) {
  const result = Array(10).fill(null);

  if (expandedId === null) {
    for (let i = 0; i < 10; i++) {
      result[i] = {
        gridColumn: `${(i % 5) + 1} / span 1`,
        gridRow: `${Math.floor(i / 5) * 6 + 1} / span 6`,
      };
    }
    return result;
  }

  const expandLeft = expandedId % 5 < 3;
  const expandCol = expandLeft ? 1 : 4;
  const remainingCols = expandLeft ? [3, 4, 5] : [1, 2, 3];

  result[expandedId] = {
    gridColumn: `${expandCol} / span 2`,
    gridRow: "1 / span 12",
  };

  const byReadingOrder = (a, b) =>
    Math.floor(a / 5) - Math.floor(b / 5) || (a % 5) - (b % 5);

  const remaining = Array.from({ length: 10 }, (_, i) => i)
    .filter((i) => i !== expandedId)
    .sort(byReadingOrder);

  remaining.forEach((idx, pos) => {
    const col = remainingCols[Math.floor(pos / 3)];
    const rowWithinCol = pos % 3;
    result[idx] = {
      gridColumn: `${col} / span 1`,
      gridRow: `${rowWithinCol * 4 + 1} / span 4`,
    };
  });

  return result;
}

function ResourceCard({
  title,
  description,
  detail1,
  detail2,
  image,
  gridStyle,
  isExpanded,
  hasExpanded,
  onToggle,
  reduceMotion,
}) {
  const { ref, onMouseMove, onMouseLeave, cardStyle, imgStyle } = useTilt(
    reduceMotion || isExpanded || hasExpanded,
  );

  const cardClass = [
    "h-full flex flex-col rounded-2xl overflow-hidden border cursor-pointer select-none bg-white",
    isExpanded
      ? "shadow-2xl border-amber-300 z-10"
      : "shadow-sm border-slate-100",
  ].join(" ");

  const cardInner = (
    <>
      <div className="relative overflow-hidden bg-slate-100 basis-[50%] shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-hidden flex flex-col gap-1.5">
        <span className="font-black bg-amber-400 text-slate-900 text-sm shrink-0 uppercase px-2 py-0.5 rounded-full z-10 w-fit">
          {title}
        </span>
        <p
          className={`text-base text-slate-500 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}
        >
          {description}
        </p>

        {isExpanded && (
          <div className="mt-2 flex flex-col gap-2 flex-1">
            <div className="h-px bg-slate-100" />
            <p className="text-lg text-slate-600">{detail1}</p>
            <p className="text-lg text-slate-600">{detail2}</p>
          </div>
        )}
      </div>
    </>
  );

  if (reduceMotion) {
    return (
      <div
        onClick={onToggle}
        style={{
          gridColumn: gridStyle.gridColumn,
          gridRow: gridStyle.gridRow,
          opacity: hasExpanded && !isExpanded ? 0.65 : 1,
        }}
        className={cardClass}
      >
        {cardInner}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      layout
      onClick={isExpanded ? (e) => e.stopPropagation() : onToggle}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        gridColumn: gridStyle.gridColumn,
        gridRow: gridStyle.gridRow,
        ...(isExpanded || hasExpanded ? {} : cardStyle),
      }}
      animate={{ opacity: hasExpanded && !isExpanded ? 0.65 : 1 }}
      transition={SPRING}
      className={cardClass}
    >
      <div className="relative overflow-hidden bg-slate-100 basis-[50%] shrink-0">
        <motion.img
          src={image}
          alt={title}
          style={isExpanded || hasExpanded ? {} : imgStyle}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-hidden flex flex-col gap-1.5">
        <span className="font-black bg-amber-400 text-slate-900 text-sm shrink-0 uppercase px-2 py-0.5 rounded-full z-10 w-fit">
          {title}
        </span>
        <p
          className={`text-base text-slate-500 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}
        >
          {description}
        </p>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, ...SPRING }}
            className="mt-2 flex flex-col gap-2 flex-1"
          >
            <div className="h-px bg-slate-100" />
            <p className="text-xs text-slate-600">{detail1}</p>
            <p className="text-xs text-slate-600">{detail2}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function Resources() {
  const { reduceMotion } = useMotion();
  const [expandedId, setExpandedId] = useState(null);
  const gridStyles = computeGridStyles(expandedId);

  return (
    <PageTransition>
      {reduceMotion ? (
        expandedId !== null && (
          <div
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setExpandedId(null)}
          />
        )
      ) : (
        <AnimatePresence>
          {expandedId !== null && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setExpandedId(null)}
            />
          )}
        </AnimatePresence>
      )}
      <div className="bg-slate-50 min-h-screen">
        {/* Page hero */}
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-[1440px] mx-auto">
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

        {/* Bento grid */}
        <div className="px-8 md:px-16 py-16 max-w-[1440px] mx-auto relative z-10">
          <LayoutGroup>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gridTemplateRows: "repeat(12, 1fr)",
                height: "580px",
                gap: "12px",
              }}
            >
              {resources.map((r, i) => (
                <ResourceCard
                  key={r.title}
                  {...r}
                  gridStyle={gridStyles[i]}
                  reduceMotion={reduceMotion}
                  isExpanded={expandedId === i}
                  hasExpanded={expandedId !== null}
                  onToggle={() => setExpandedId(expandedId === i ? null : i)}
                />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>
    </PageTransition>
  );
}

export default Resources;
