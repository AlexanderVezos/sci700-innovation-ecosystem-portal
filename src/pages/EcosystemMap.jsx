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
import { TAGS } from "@/lib/startupConstants";

const TAG_STYLE = {
  AgriTech: {
    bg: "rgba(74,222,128,0.15)",
    stroke: "#4ade80",
    text: "#bbf7d0",
    glow: "#4ade80",
  },
  CleanTech: {
    bg: "rgba(52,211,153,0.15)",
    stroke: "#34d399",
    text: "#a7f3d0",
    glow: "#34d399",
  },
  "Creative Industries": {
    bg: "rgba(45,212,191,0.15)",
    stroke: "#2dd4bf",
    text: "#99f6e4",
    glow: "#2dd4bf",
  },
  EdTech: {
    bg: "rgba(34,211,238,0.15)",
    stroke: "#22d3ee",
    text: "#a5f3fc",
    glow: "#22d3ee",
  },
  FinTech: {
    bg: "rgba(56,189,248,0.15)",
    stroke: "#38bdf8",
    text: "#bae6fd",
    glow: "#38bdf8",
  },
  HealthTech: {
    bg: "rgba(96,165,250,0.15)",
    stroke: "#60a5fa",
    text: "#bfdbfe",
    glow: "#60a5fa",
  },
  Manufacturing: {
    bg: "rgba(129,140,248,0.15)",
    stroke: "#818cf8",
    text: "#c7d2fe",
    glow: "#818cf8",
  },
  "Professional Services": {
    bg: "rgba(167,139,250,0.15)",
    stroke: "#a78bfa",
    text: "#ddd6fe",
    glow: "#a78bfa",
  },
  "Tourism & Hospitality": {
    bg: "rgba(232,121,249,0.15)",
    stroke: "#e879f9",
    text: "#f5d0fe",
    glow: "#e879f9",
  },
  Other: {
    bg: "rgba(148,163,184,0.15)",
    stroke: "#94a3b8",
    text: "#cbd5e1",
    glow: "#94a3b8",
  },
};

const DEFAULT_STYLE = TAG_STYLE.Other;

function getNodeTags(node) {
  if (Array.isArray(node.tags) && node.tags.length > 0) return node.tags;
  if (node.tag) return [node.tag];
  return [];
}

function primaryStyle(node) {
  const tags = getNodeTags(node);
  return TAG_STYLE[tags[0]] ?? DEFAULT_STYLE;
}

function gradientId(tags) {
  return `grad-${tags.join("-").replace(/[^a-zA-Z]/g, "")}`;
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function bubbleR(employees, viewportMin, nodeCount = 1) {
  const scale = Math.max(0.7, 1 - Math.max(0, nodeCount - 20) / 520);
  const minR = viewportMin * 0.028 * scale;
  const maxR = viewportMin * 0.065 * scale;
  const t =
    (Math.min(65, Math.sqrt(Math.max(employees || 12, 1)) * 9) - 30) / 35;
  return minR + Math.max(0, t) * (maxR - minR);
}

function nodeMatchesFilter(node, filterTag) {
  if (filterTag === "All") return true;
  return getNodeTags(node).includes(filterTag);
}

function applyForces(sim, w, h, tag) {
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) * 0.58;
  sim.force("center", forceCenter(cx, cy).strength(0.004));
  sim.force(
    "radial",
    forceRadial(
      (d) => (nodeMatchesFilter(d, tag) ? 0 : outerR),
      cx,
      cy,
    ).strength((d) => (nodeMatchesFilter(d, tag) ? 0.12 : 0.15)),
  );
}

const POLL_INTERVAL = 1000;

function DetailPanel({ node, onClose }) {
  const s = primaryStyle(node);
  const tags = getNodeTags(node);
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
          {node.type && (
            <span className="text-xs text-slate-500 mt-0.5 block">
              {node.type}
            </span>
          )}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((tag) => {
              const ts = TAG_STYLE[tag] ?? DEFAULT_STYLE;
              return (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: ts.bg, color: ts.text }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          {node.description}
        </p>

        <div
          className="flex flex-col gap-1 text-xs"
          style={{ color: "#64748b" }}
        >
          {node.year && <span>Est. {node.year}</span>}
          {node.employees && <span>{node.employees} people</span>}
          {node.stage && <span>{node.stage}</span>}
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
    selected && (filterTag === "All" || nodeMatchesFilter(selected, filterTag))
      ? selected
      : null;

  const fetchStartups = useCallback(() => {
    fetch("/api/startups")
      .then((r) => r.json())
      .then((data) => {
        const sim = simRef.current;
        if (sim && sim.nodes().length > 0) {
          // Flag the startups-change effect to skip a full rebuild — we're
          // handling incremental insertion here instead.
          skipRebuild.current = true;
          const existingIds = new Set(sim.nodes().map((n) => n._id));
          const brandNew = data.filter((s) => !existingIds.has(s._id));
          if (brandNew.length > 0) {
            const { w, h } = dimsRef.current;
            const vMin = Math.min(w, h);
            const existingNodes = sim.nodes();
            const total = existingNodes.length + brandNew.length;
            const newSimNodes = brandNew.map((s, i) => ({
              ...s,
              id: existingNodes.length + i,
              r: bubbleR(s.employees, vMin, total),
              x: w / 2 + (Math.random() - 0.5) * 100,
              y: h / 2 + (Math.random() - 0.5) * 100,
            }));
            sim.nodes([...existingNodes, ...newSimNodes]);
            sim.force(
              "collide",
              forceCollide((d) => d.r + 4)
                .strength(0.9)
                .iterations(8),
            );
            applyForces(sim, w, h, filterTagRef.current);
            // 0.6 rather than 1.0 — only the new nodes need to settle,
            // a full alpha restart would destabilize the existing layout.
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
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
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
    const vMin = Math.min(w, h);
    const total = startups.length;
    const initial = startups.map((s, i) => {
      const angle = (i / total) * Math.PI * 2;
      const r = vMin * (0.3 + Math.random() * 0.15);
      return {
        ...s,
        id: i,
        r: bubbleR(s.employees, vMin, total),
        x: w / 2 + Math.cos(angle) * r,
        y: h / 2 + Math.sin(angle) * r,
      };
    });

    let tick = 0;
    const sim = forceSimulation(initial)
      .force("charge", forceManyBody().strength(-25))
      .force(
        "collide",
        forceCollide((d) => d.r + 4)
          .strength(0.9)
          .iterations(8),
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
        if (++tick % 3 === 0) setNodes(sim.nodes().map((n) => ({ ...n }))); // throttle React updates; D3 ticks at ~60fps
      })
      .on("end", () => setNodes(sim.nodes().map((n) => ({ ...n }))));

    applyForces(sim, w, h, filterTagRef.current);

    // Pre-simulate before first paint so nodes don't visibly spawn from the center.
    // Scales with node count but capped so init time stays bounded.
    const preTicks = Math.min(80 + total * 1.2, 300);
    sim.tick(preTicks);
    for (const n of sim.nodes()) {
      n.x = Math.max(n.r + 4, Math.min(w - n.r - 4, n.x));
      n.y = Math.max(n.r + 4, Math.min(h - n.r - 4, n.y));
    }
    setNodes(sim.nodes().map((n) => ({ ...n })));
    simRef.current = sim;
    return () => sim.stop();
  }, [startups]);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !dims.w) return;
    const vMin = Math.min(dims.w, dims.h);
    const total = sim.nodes().length;
    for (const n of sim.nodes()) n.r = bubbleR(n.employees, vMin, total);
    sim.force(
      "collide",
      forceCollide((d) => d.r + 4)
        .strength(0.9)
        .iterations(8),
    );
    applyForces(sim, dims.w, dims.h, filterTagRef.current);
    sim.alpha(0.3).restart();
  }, [dims]);

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

  // Collect unique multi-tag combos for gradient defs
  const gradientCombos = [];
  const seenGrads = new Set();
  for (const node of nodes) {
    const tags = getNodeTags(node);
    if (tags.length >= 2) {
      const id = gradientId(tags);
      if (!seenGrads.has(id)) {
        seenGrads.add(id);
        gradientCombos.push(tags);
      }
    }
  }

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
                const s = TAG_STYLE[tag] ?? DEFAULT_STYLE;
                return (
                  <filter
                    key={tag}
                    id={`glow-${tag.replace(/[^a-zA-Z]/g, "")}`}
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
              {gradientCombos.map((tags) => {
                const s0 = TAG_STYLE[tags[0]] ?? DEFAULT_STYLE;
                const s1 = TAG_STYLE[tags[1]] ?? DEFAULT_STYLE;
                return (
                  <linearGradient
                    key={gradientId(tags)}
                    id={gradientId(tags)}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={s0.stroke}
                      stopOpacity="0.35"
                    />
                    <stop
                      offset="46%"
                      stopColor={s0.stroke}
                      stopOpacity="0.28"
                    />
                    <stop
                      offset="54%"
                      stopColor={s1.stroke}
                      stopOpacity="0.28"
                    />
                    <stop
                      offset="100%"
                      stopColor={s1.stroke}
                      stopOpacity="0.35"
                    />
                  </linearGradient>
                );
              })}
            </defs>

            {nodes.map((node) => {
              const tags = getNodeTags(node);
              const s = primaryStyle(node);
              const isMulti = tags.length >= 2;
              const fill = isMulti ? `url(#${gradientId(tags)})` : s.bg;
              const dimmed = !nodeMatchesFilter(node, filterTag);
              const isSelected = visibleSelected?.id === node.id;
              const isHovered = hovered === node.id;
              const isNew = newNodeIds.has(node._id);
              const glowTag = (tags[0] ?? "Other").replace(/[^a-zA-Z]/g, "");

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
                    opacity: dimmed ? 0.15 : 1,
                    transition: "opacity 0.35s",
                  }}
                  filter={
                    isHovered || isSelected
                      ? `url(#glow-${glowTag})`
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
                        ? { type: "spring", stiffness: 300, damping: 18 }
                        : { duration: 0.15 }
                    }
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    <circle
                      r={node.r}
                      fill={fill}
                      stroke={isSelected ? "#f59e0b" : s.stroke}
                      strokeWidth={isSelected ? 4 : 1.5}
                    />
                    {isMulti && (
                      <circle
                        r={node.r}
                        fill="none"
                        stroke={TAG_STYLE[tags[1]]?.stroke ?? s.stroke}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.75"
                      />
                    )}
                    {isNew && (
                      <motion.circle
                        r={node.r}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{
                          duration: 3.5,
                          delay: 0.2,
                          ease: "easeOut",
                        }}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
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
                No listings found.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default EcosystemMap;
