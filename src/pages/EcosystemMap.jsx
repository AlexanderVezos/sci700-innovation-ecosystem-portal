import { useState, useEffect, useRef, useCallback } from "react";
import {
  forceSimulation, forceCenter, forceCollide,
  forceManyBody, forceX, forceY,
} from "d3-force";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";

const TAGS = ["HealthTech", "EdTech", "CleanTech", "FinTech", "AgriTech", "Other"];

const TAG_STYLE = {
  HealthTech: { bg: "rgba(59,130,246,0.15)",  stroke: "#3b82f6", text: "#93c5fd",  glow: "#3b82f6" },
  EdTech:     { bg: "rgba(139,92,246,0.15)",  stroke: "#8b5cf6", text: "#c4b5fd",  glow: "#8b5cf6" },
  CleanTech:  { bg: "rgba(16,185,129,0.15)",  stroke: "#10b981", text: "#6ee7b7",  glow: "#10b981" },
  FinTech:    { bg: "rgba(245,158,11,0.15)",  stroke: "#f59e0b", text: "#fcd34d",  glow: "#f59e0b" },
  AgriTech:   { bg: "rgba(132,204,22,0.15)",  stroke: "#84cc16", text: "#bef264",  glow: "#84cc16" },
  Other:      { bg: "rgba(100,116,139,0.15)", stroke: "#64748b", text: "#94a3b8",  glow: "#64748b" },
};

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function bubbleR(employees) {
  return Math.max(30, Math.min(65, Math.sqrt(Math.max(employees || 1, 1)) * 9));
}

function DetailPanel({ node, onClose }) {
  const s = TAG_STYLE[node.tag] ?? TAG_STYLE.Other;
  const contacts = [
    node.email   && { label: "Email",   href: `mailto:${node.email}`,  value: node.email },
    node.website && { label: "Website", href: node.website,             value: node.website },
    node.phone   && { label: "Phone",   href: `tel:${node.phone}`,      value: node.phone },
  ].filter(Boolean);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-5 top-5 bottom-5 w-68 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-20"
      style={{ background: "rgba(15,23,42,0.95)", border: `1px solid ${s.stroke}40`, width: "260px" }}
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
          style={{ background: s.bg, color: s.text, border: `1.5px solid ${s.stroke}` }}
        >
          {initials(node.name)}
        </div>

        <div>
          <h2 className="font-black text-white text-base leading-tight">{node.name}</h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: s.bg, color: s.text }}
          >
            {node.tag}
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{node.description}</p>

        <div className="flex flex-col gap-1 text-xs" style={{ color: "#64748b" }}>
          <span>Est. {node.year}</span>
          <span>{node.employees} people</span>
          <span>{node.stage}</span>
        </div>

        {contacts.length > 0 && (
          <div className="pt-3 border-t flex flex-col gap-1.5" style={{ borderColor: "#1e293b" }}>
            {contacts.map(({ label, href, value }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-14 font-semibold uppercase tracking-wide shrink-0" style={{ color: "#475569" }}>{label}</span>
                <a href={href} target={label === "Website" ? "_blank" : undefined} rel="noreferrer"
                  className="truncate hover:underline" style={{ color: "#f59e0b" }}>
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

function EcosystemMap() {
  const [startups, setStartups] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filterTag, setFilterTag] = useState("All");
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const { reduceMotion } = useMotion();

  useEffect(() => {
    fetch("http://localhost:3001/api/startups")
      .then((r) => r.json())
      .then(setStartups)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    setDims({ w: el.offsetWidth, h: el.offsetHeight });
    return () => obs.disconnect();
  }, []);

  // Build/rebuild simulation when startups or dims change
  useEffect(() => {
    if (!startups.length || !dims.w) return;

    simRef.current?.stop();

    const initial = startups.map((s, i) => ({
      ...s,
      id: i,
      r: bubbleR(s.employees),
      x: dims.w / 2 + (Math.random() - 0.5) * dims.w * 0.6,
      y: dims.h / 2 + (Math.random() - 0.5) * dims.h * 0.6,
    }));

    const sim = forceSimulation(initial)
      .force("center", forceCenter(dims.w / 2, dims.h / 2).strength(0.04))
      .force("charge", forceManyBody().strength(-40))
      .force("collide", forceCollide((d) => d.r + 8).strength(0.85).iterations(3))
      .alphaDecay(reduceMotion ? 0.05 : 0)
      .alphaTarget(reduceMotion ? 0 : 0.12)
      .velocityDecay(0.4)
      .on("tick", () => {
        // Clamp to bounds
        for (const n of sim.nodes()) {
          n.x = Math.max(n.r + 4, Math.min(dims.w - n.r - 4, n.x));
          n.y = Math.max(n.r + 4, Math.min(dims.h - n.r - 4, n.y));
        }
        setNodes(sim.nodes().map((n) => ({ ...n })));
      });

    simRef.current = sim;
    return () => sim.stop();
  }, [startups, dims.w, dims.h, reduceMotion]);

  // Update clustering force when filter changes
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    if (filterTag === "All") {
      sim.force("x", null).force("y", null);
    } else {
      sim
        .force("x", forceX((d) => (d.tag === filterTag ? dims.w / 2 : d.id % 2 === 0 ? dims.w * 0.12 : dims.w * 0.88)).strength(0.1))
        .force("y", forceY(dims.h / 2).strength(0.06));
    }
    sim.alpha(0.5).restart();
  }, [filterTag, dims]);

  const handleBubbleClick = useCallback((node) => {
    setSelected((prev) => (prev?.id === node.id ? null : node));
  }, []);

  return (
    <PageTransition>
      <div className="flex flex-col" style={{ background: "#080f1e", minHeight: "100vh" }}>
        {/* Header */}
        <div className="px-8 md:px-16 pt-28 pb-5 flex flex-col gap-4 shrink-0">
          <h1 className="text-4xl font-black tracking-tighter text-white">Ecosystem Map</h1>
          <div className="flex gap-2 flex-wrap">
            {["All", ...TAGS].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTag(t)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                style={
                  filterTag === t
                    ? { background: "#f59e0b", color: "#1c1917" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Map canvas */}
        <div ref={containerRef} className="flex-1 relative" style={{ minHeight: "500px" }}>
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
            style={{ overflow: "visible" }}
          >
            <defs>
              {TAGS.map((tag) => {
                const s = TAG_STYLE[tag];
                return (
                  <filter key={tag} id={`glow-${tag}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor={s.glow} floodOpacity="0.5" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
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
              const isSelected = selected?.id === node.id;
              const isHovered = hovered === node.id;
              const scale = isSelected ? 1.12 : isHovered ? 1.07 : 1;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y}) scale(${scale})`}
                  onClick={() => handleBubbleClick(node)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer",
                    opacity: dimmed ? 0.2 : 1,
                    transition: "opacity 0.35s, transform 0.2s",
                    transformOrigin: `${node.x}px ${node.y}px`,
                  }}
                  filter={!dimmed ? `url(#glow-${node.tag ?? "Other"})` : undefined}
                >
                  <circle
                    r={node.r}
                    fill={s.bg}
                    stroke={isSelected ? "#f59e0b" : s.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
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
                      style={{ pointerEvents: "none", userSelect: "none", opacity: 0.7 }}
                    >
                      {node.name.length > 13 ? node.name.slice(0, 12) + "…" : node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <DetailPanel
                key={selected.id}
                node={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </AnimatePresence>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                No approved startups to display yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default EcosystemMap;
