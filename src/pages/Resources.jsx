//TODO: Apply Motion Off to cards

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

const resources = [
  {
    title: "Business Planning",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    to: "/resources/business-planning",
  },
  {
    title: "Funding & Grants",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    to: "/resources/funding",
  },
  {
    title: "Networks & Mentors",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    to: "/resources/networks",
  },
  {
    title: "Legal & Compliance",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    to: "/resources/legal",
  },
  {
    title: "Digital Tools",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    to: "/resources/digital-tools",
  },
  {
    title: "Market Research",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    to: "/resources/market-research",
  },
  {
    title: "Sustainability",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    to: "/resources/sustainability",
  },
  {
    title: "Talent & Hiring",
    description: "**",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    to: "/resources/talent",
  },
];

const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 1 };

// Grid is always 4 cols × 12 row-tracks. In the normal state each card spans 6 rows
// (2 visual rows × 6 tracks each = 12 total). When one card expands it takes all 12
// row-tracks and 2 columns. The remaining 7 cards fill the other 2 columns:
//   near column → 3 cards × 4 tracks = 12
//   far  column → 4 cards × 3 tracks = 12
// All three columns are exactly the same total height.
function computeGridStyles(expandedId) {
  const result = Array(8).fill(null);

  if (expandedId === null) {
    for (let i = 0; i < 8; i++) {
      result[i] = {
        gridColumn: `${(i % 4) + 1} / span 1`,
        gridRow: `${Math.floor(i / 4) * 6 + 1} / span 6`,
      };
    }
    return result;
  }

  const expandLeft = expandedId % 4 <= 1;

  result[expandedId] = {
    gridColumn: expandLeft ? "1 / span 2" : "3 / span 2",
    gridRow: "1 / span 12",
  };

  // nearCol is adjacent to the expanded block; farCol is on the other side
  const nearCol = expandLeft ? 3 : 2;
  const farCol = expandLeft ? 4 : 1;

  const remaining = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => i !== expandedId);

  // Cards from the same half as the expanded card (displaced directly) → near column (3)
  // Cards from the opposite half (pushed furthest) → far column (4)
  // Within each group maintain natural reading order (by row, then col)
  const byReadingOrder = (a, b) =>
    Math.floor(a / 4) - Math.floor(b / 4) || (a % 4) - (b % 4);

  const near = remaining
    .filter((i) => i % 4 <= 1 === expandLeft)
    .sort(byReadingOrder);

  const far = remaining
    .filter((i) => i % 4 <= 1 !== expandLeft)
    .sort(byReadingOrder);

  near.forEach((idx, pos) => {
    result[idx] = {
      gridColumn: `${nearCol} / span 1`,
      gridRow: `${pos * 4 + 1} / span 4`,
    };
  });

  far.forEach((idx, pos) => {
    result[idx] = {
      gridColumn: `${farCol} / span 1`,
      gridRow: `${pos * 3 + 1} / span 3`,
    };
  });

  return result;
}

function ResourceCard({
  title,
  description,
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
      className={[
        "h-full flex flex-col rounded-2xl overflow-hidden border cursor-pointer select-none bg-white",
        isExpanded
          ? "shadow-2xl border-amber-300 z-10"
          : "shadow-sm border-slate-100",
      ].join(" ")}
    >
      {/* Image — takes 55% of available card height */}
      <div className="relative overflow-hidden bg-slate-100 basis-[55%] shrink-0">
        <motion.img
          src={image}
          alt={title}
          style={isExpanded || hasExpanded ? {} : imgStyle}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col gap-1">
        <span className="font-black bg-amber-400 text-slate-900 text-sm shrink-0 uppercase px-2 py-0.5 rounded-full z-10 w-fit">
          {title}
        </span>
        <p
          className={`text-xs text-slate-500 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
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
            <p className="text-xs text-slate-400">**</p>
            <p className="text-xs text-slate-400">**</p>
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
      <AnimatePresence>
        {expandedId !== null && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setExpandedId(null)}
          />
        )}
      </AnimatePresence>
      <div className="bg-slate-50 min-h-screen">
        {/* Page hero */}
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              **
              <br />
              **
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              **
            </p>
          </div>
        </div>

        {/* Bento grid */}
        <div className="px-8 md:px-16 py-16 max-w-5xl mx-auto relative z-50">
          <LayoutGroup>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(12, 1fr)",
                height: "660px",
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
