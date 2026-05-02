import { useState, useEffect, useRef, useCallback } from "react";
import {
  forceSimulation,
  forceCenter,
  forceCollide,
  forceManyBody,
  forceRadial,
} from "d3-force";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const TAGS = [
  "HealthTech",
  "EdTech",
  "CleanTech",
  "FinTech",
  "AgriTech",
  "Other",
];

const TAG_STYLE = {
  HealthTech: {
    bg: "rgba(59,130,246,0.15)",
    stroke: "#3b82f6",
    text: "#93c5fd",
    glow: "#3b82f6",
  },
  EdTech: {
    bg: "rgba(139,92,246,0.15)",
    stroke: "#8b5cf6",
    text: "#c4b5fd",
    glow: "#8b5cf6",
  },
  CleanTech: {
    bg: "rgba(16,185,129,0.15)",
    stroke: "#10b981",
    text: "#6ee7b7",
    glow: "#10b981",
  },
  FinTech: {
    bg: "rgba(245,158,11,0.15)",
    stroke: "#f59e0b",
    text: "#fcd34d",
    glow: "#f59e0b",
  },
  AgriTech: {
    bg: "rgba(132,204,22,0.15)",
    stroke: "#84cc16",
    text: "#bef264",
    glow: "#84cc16",
  },
  Other: {
    bg: "rgba(100,116,139,0.15)",
    stroke: "#64748b",
    text: "#94a3b8",
    glow: "#64748b",
  },
};

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function bubbleR(employees, viewportMin) {
  // Normalise employee count to 0–1, then map to a viewport-relative radius range
  const t =
    (Math.min(65, Math.sqrt(Math.max(employees || 1, 1)) * 9) - 30) / 35;
  const minR = viewportMin * 0.028;
  const maxR = viewportMin * 0.065;
  return minR + Math.max(0, t) * (maxR - minR);
}

function DetailPanel({ node, onClose }) {
  const s = TAG_STYLE[node.tag] ?? TAG_STYLE.Other;
  const contacts = [
    node.email && {
      label: "Email",
      href: `mailto:${node.email}`,
      value: node.email,
    },
    node.website && {
      label: "Website",
      href: node.website,
      value: node.website,
    },
    node.phone && {
      label: "Phone",
      href: `tel:${node.phone}`,
      value: node.phone,
    },
  ].filter(Boolean);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-5 top-5 bottom-5 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-20"
      style={{
        background: "rgba(15,23,42,0.95)",
        border: `1px solid ${s.stroke}40`,
        width: "260px",
      }}
    >
      <div className="p-5 flex flex-col gap-3 flex-1 overflow-y-auto">
        <button
          onClick={onClose}
          className="self-end text-slate-500 hover:text-slate-300 transition-colors text-xs"
        >
          ✕ Close
        </button>

        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl select-none shrink-0"
          style={{
            background: s.bg,
            color: s.text,
            border: `1.5px solid ${s.stroke}`,
          }}
        >
          {initials(node.name)}
        </div>

        <div>
          <h2 className="font-black text-white text-base leading-tight">
            {node.name}
          </h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: s.bg, color: s.text }}
          >
            {node.tag}
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          {node.description}
        </p>

        <div
          className="flex flex-col gap-1 text-xs"
          style={{ color: "#64748b" }}
        >
          <span>Est. {node.year}</span>
          <span>{node.employees} people</span>
          <span>{node.stage}</span>
        </div>

        {contacts.length > 0 && (
          <div
            className="pt-3 border-t flex flex-col gap-1.5"
            style={{ borderColor: "#1e293b" }}
          >
            {contacts.map(({ label, href, value }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span
                  className="w-14 font-semibold uppercase tracking-wide shrink-0"
                  style={{ color: "#475569" }}
                >
                  {label}
                </span>
                <a
                  href={href}
                  target={label === "Website" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="truncate hover:underline"
                  style={{ color: "#f59e0b" }}
                >
                  {value}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Applies center + radial forces for the current dims and active filter.
// Called by both the resize and filter effects so they stay in sync.
function applyForces(sim, w, h, tag) {
  const cx = w / 2;
  const cy = h / 2;
  // Non-matching nodes are pushed to an outer ring clearly past the centre cluster.
  const outerR = Math.min(w, h) * 0.58;
  sim.force("center", forceCenter(cx, cy).strength(0.004));
  sim.force(
    "radial",
    forceRadial(
      (d) => (tag === "All" || d.tag === tag ? 0 : outerR),
      cx,
      cy,
    ).strength((d) => (tag === "All" || d.tag === tag ? 0.12 : 0.15)),
  );
}

const POLL_INTERVAL = 3000;

function EcosystemMap() {
  const [startups, setStartups] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filterTag, setFilterTag] = useState("All");
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [newNodeIds, setNewNodeIds] = useState(new Set());
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const dimsRef = useRef({ w: 800, h: 600 });
  const filterTagRef = useRef("All");
  const skipRebuild = useRef(false);
  const newNodeTimer = useRef(null);

  useEffect(() => {
    dimsRef.current = dims;
  }, [dims]);
  useEffect(() => {
    filterTagRef.current = filterTag;
  }, [filterTag]);

  const visibleSelected =
    selected && (filterTag === "All" || selected.tag === filterTag)
      ? selected
      : null;

  const fetchStartups = useCallback(() => {
    fetch("/api/startups")
      .then((r) => r.json())
      .then((data) => {
        const sim = simRef.current;
        if (sim && sim.nodes().length > 0) {
          // Sim is already running — always skip the rebuild effect
          skipRebuild.current = true;
          const existingIds = new Set(sim.nodes().map((n) => n._id));
          const brandNew = data.filter((s) => !existingIds.has(s._id));
          if (brandNew.length > 0) {
            const { w, h } = dimsRef.current;
            const vMin = Math.min(w, h);
            const existingNodes = sim.nodes();
            const newSimNodes = brandNew.map((s, i) => ({
              ...s,
              id: existingNodes.length + i,
              r: bubbleR(s.employees, vMin),
              x: w / 2 + (Math.random() - 0.5) * 100,
              y: h / 2 + (Math.random() - 0.5) * 100,
            }));
            sim.nodes([...existingNodes, ...newSimNodes]);
            sim.force(
              "collide",
              forceCollide((d) => d.r + 6)
                .strength(0.9)
                .iterations(6),
            );
            applyForces(sim, w, h, filterTagRef.current);
            sim.alpha(0.6).restart();
            clearTimeout(newNodeTimer.current);
            setNewNodeIds(new Set(brandNew.map((s) => s._id)));
            newNodeTimer.current = setTimeout(
              () => setNewNodeIds(new Set()),
              3500,
            );
          }
        }
        setStartups(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStartups();
    const interval = setInterval(fetchStartups, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      clearTimeout(newNodeTimer.current);
    };
  }, [fetchStartups]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      setDims({ w, h });
    });
    obs.observe(el);
    setDims({ w: el.offsetWidth, h: el.offsetHeight });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!startups.length) return;
    if (skipRebuild.current) {
      skipRebuild.current = false;
      return;
    }
    simRef.current?.stop();

    const { w, h } = dimsRef.current;
    const viewportMin = Math.min(w, h);
    // Spread initial positions evenly around a wider ring to prevent spawn collisions
    const initial = startups.map((s, i) => {
      const angle = (i / startups.length) * Math.PI * 2;
      const r = viewportMin * (0.3 + Math.random() * 0.15);
      return {
        ...s,
        id: i,
        r: bubbleR(s.employees, viewportMin),
        x: w / 2 + Math.cos(angle) * r,
        y: h / 2 + Math.sin(angle) * r,
      };
    });

    let tick = 0;
    const sim = forceSimulation(initial)
      .force("charge", forceManyBody().strength(-20))
      .force(
        "collide",
        forceCollide((d) => d.r + 6)
          .strength(0.9)
          .iterations(6),
      )
      .alphaDecay(0.016)
      .alphaTarget(0)
      .velocityDecay(0.38)
      .on("tick", () => {
        const { w: cw, h: ch } = dimsRef.current;
        for (const n of sim.nodes()) {
          n.x = Math.max(n.r + 4, Math.min(cw - n.r - 4, n.x));
          n.y = Math.max(n.r + 4, Math.min(ch - n.r - 4, n.y));
        }
        // Update React state every 3rd tick — sim still runs at full speed internally
        if (++tick % 3 === 0) {
          setNodes(sim.nodes().map((n) => ({ ...n })));
        }
      })
      .on("end", () => setNodes(sim.nodes().map((n) => ({ ...n }))));

    applyForces(sim, w, h, filterTagRef.current);

    // Pre-settle silently so the first rendered frame is already spread out
    sim.tick(120);
    for (const n of sim.nodes()) {
      n.x = Math.max(n.r + 4, Math.min(w - n.r - 4, n.x));
      n.y = Math.max(n.r + 4, Math.min(h - n.r - 4, n.y));
    }
    setNodes(sim.nodes().map((n) => ({ ...n })));

    simRef.current = sim;
    return () => sim.stop();
  }, [startups]);

  // On resize: update node radii, re-apply collision + center forces
  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !dims.w) return;
    const vMin = Math.min(dims.w, dims.h);
    for (const n of sim.nodes()) {
      n.r = bubbleR(n.employees, vMin);
    }
    sim.force(
      "collide",
      forceCollide((d) => d.r + 6)
        .strength(0.9)
        .iterations(6),
    );
    applyForces(sim, dims.w, dims.h, filterTagRef.current);
    sim.alpha(0.3).restart();
  }, [dims]);

  // On filter change: re-apply forces with the new tag
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    const { w, h } = dimsRef.current;
    applyForces(sim, w, h, filterTag);
    sim.alpha(0.4).restart();
  }, [filterTag]);

  const handleBubbleClick = useCallback((node) => {
    setSelected((prev) => (prev?.id === node.id ? null : node));
  }, []);

  return (
    <PageTransition>
      <div
        className="flex flex-col"
        style={{ background: "#080f1e", minHeight: "100vh" }}
      >
        <div className="px-8 md:px-16 pt-28 pb-5 flex flex-col gap-4 shrink-0">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Ecosystem Map
          </h1>
          <div className="flex gap-2 flex-wrap">
            {["All", ...TAGS].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTag(t)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                style={
                  filterTag === t
                    ? { background: "#f59e0b", color: "#1c1917" }
                    : {
                        background: "rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 relative motion-exempt"
          style={{ minHeight: "500px" }}
        >
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
            style={{ overflow: "visible" }}
            onClick={() => setSelected(null)}
          >
            <defs>
              {TAGS.map((tag) => {
                const s = TAG_STYLE[tag];
                return (
                  <filter
                    key={tag}
                    id={`glow-${tag}`}
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood
                      floodColor={s.glow}
                      floodOpacity="0.5"
                      result="color"
                    />
                    <feComposite
                      in="color"
                      in2="blur"
                      operator="in"
                      result="glow"
                    />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                );
              })}
            </defs>

            {nodes.map((node) => {
              const s = TAG_STYLE[node.tag] ?? TAG_STYLE.Other;
              const dimmed = filterTag !== "All" && node.tag !== filterTag;
              const isSelected = visibleSelected?.id === node.id;
              const isHovered = hovered === node.id;
              const isNew = newNodeIds.has(node._id);

              return (
                <g
                  key={node._id ?? node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBubbleClick(node);
                  }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer",
                    opacity: dimmed ? 0.2 : 1,
                    transition: "opacity 0.35s",
                  }}
                  filter={
                    isHovered || isSelected
                      ? `url(#glow-${node.tag ?? "Other"})`
                      : undefined
                  }
                >
                  <motion.g
                    initial={isNew ? { scale: 0, opacity: 0 } : false}
                    animate={{
                      scale: isHovered && !isSelected ? 1.06 : 1,
                      opacity: 1,
                    }}
                    transition={
                      isNew
                        ? { type: "spring", stiffness: 280, damping: 20 }
                        : { duration: 0.15 }
                    }
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    {isNew && (
                      <motion.circle
                        r={node.r + 6}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth={2.5}
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 0 }}
                        transition={{
                          duration: 2.5,
                          delay: 0.5,
                          ease: "easeOut",
                        }}
                      />
                    )}
                    <circle
                      r={node.r}
                      fill={s.bg}
                      stroke={isSelected ? "#f59e0b" : s.stroke}
                      strokeWidth={isSelected ? 4 : 1.5}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      y={node.r > 42 ? -node.r * 0.18 : 0}
                      fill={s.text}
                      fontSize={node.r * 0.44}
                      fontWeight="800"
                      fontFamily="inherit"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {initials(node.name)}
                    </text>
                    {node.r > 42 && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={node.r * 0.32}
                        fill={s.text}
                        fontSize={node.r * 0.2}
                        fontWeight="600"
                        fontFamily="inherit"
                        style={{
                          pointerEvents: "none",
                          userSelect: "none",
                          opacity: 0.7,
                        }}
                      >
                        {node.name.length > 13
                          ? node.name.slice(0, 12) + "…"
                          : node.name}
                      </text>
                    )}
                  </motion.g>
                </g>
              );
            })}
          </svg>

          <AnimatePresence>
            {visibleSelected && (
              <DetailPanel
                key={visibleSelected.id}
                node={visibleSelected}
                onClose={() => setSelected(null)}
              />
            )}
          </AnimatePresence>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                No startups found.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default EcosystemMap;
