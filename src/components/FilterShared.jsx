import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

// ─── Inline SVGs ──────────────────────────────────────────────────────────────

function IconChevron({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 0.2s",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ─── FilterCheck ──────────────────────────────────────────────────────────────

export function FilterCheck({ checked, onChange, label, dot, count }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-2.5 w-full py-1.5 group text-left"
    >
      <div
        className={[
          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
          checked
            ? "border-slate-700 bg-slate-700 text-white"
            : "border-slate-300 group-hover:border-slate-500",
        ].join(" ")}
      >
        {checked && <IconCheck />}
      </div>
      {dot && <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />}
      <span
        className={`text-sm flex-1 transition-colors ${checked ? "text-slate-900 font-medium" : "text-slate-500 group-hover:text-slate-700"}`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-slate-400 tabular-nums">{count}</span>
      )}
    </button>
  );
}

// ─── FilterSection ────────────────────────────────────────────────────────────

export function FilterSection({ title, activeCount, children }) {
  const [open, setOpen] = useState(true);
  const { reduceMotion } = useMotion();
  return (
    <div className="border-t border-slate-100 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-1.5 group"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
          {title}
        </span>
        <div className="flex items-center gap-1.5 text-slate-400">
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-slate-700 text-white rounded-full px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
          <IconChevron open={open} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── FilterSidebarCard ────────────────────────────────────────────────────────

export function FilterSidebarCard({ totalActive, onClearAll, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-slate-800">Filters</span>
        {totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── DateRangeFilter ──────────────────────────────────────────────────────────

export function DateRangeFilter({ from, to, onFromChange, onToChange }) {
  return (
    <div className="flex flex-col gap-1.5 pb-1">
      <input
        type="date"
        value={from}
        max={to || undefined}
        onChange={(e) => onFromChange(e.target.value)}
        placeholder="From"
        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onToChange(e.target.value)}
        placeholder="To"
        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
      {(from || to) && (
        <button
          onClick={() => {
            onFromChange("");
            onToChange("");
          }}
          className="text-[10px] text-slate-400 hover:text-slate-600 text-right transition-colors"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}

// ─── DualRangeSlider ──────────────────────────────────────────────────────────

export function DualRangeSlider({
  lo,
  hi,
  totalMin,
  totalMax,
  step = 1,
  onLoChange,
  onHiChange,
}) {
  const trackRef = useRef(null);
  const dragging = useRef(null);
  // Refs mirror the props so the pointermove/pointerup handlers always read current
  // values without needing to be re-registered on every render.
  const loRef = useRef(lo);
  const hiRef = useRef(hi);
  const onLoRef = useRef(onLoChange);
  const onHiRef = useRef(onHiChange);
  useEffect(() => {
    loRef.current = lo;
  }, [lo]);
  useEffect(() => {
    hiRef.current = hi;
  }, [hi]);
  useEffect(() => {
    onLoRef.current = onLoChange;
  }, [onLoChange]);
  useEffect(() => {
    onHiRef.current = onHiChange;
  }, [onHiChange]);

  const valFromX = useCallback(
    (clientX) => {
      const rect = trackRef.current.getBoundingClientRect();
      const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
      return Math.round((totalMin + pct * (totalMax - totalMin)) / step) * step;
    },
    [totalMin, totalMax, step],
  );

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const v = valFromX(e.clientX);
      if (dragging.current === "lo")
        onLoRef.current(clamp(v, totalMin, hiRef.current - step));
      else onHiRef.current(clamp(v, loRef.current + step, totalMax));
    };
    const onUp = () => {
      dragging.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [valFromX, step, totalMin, totalMax]);

  const onTrackDown = (e) => {
    const v = valFromX(e.clientX);
    const dLo = Math.abs(v - loRef.current);
    const dHi = Math.abs(v - hiRef.current);
    dragging.current = dLo < dHi ? "lo" : "hi";
    if (dragging.current === "lo")
      onLoRef.current(clamp(v, totalMin, hiRef.current - step));
    else onHiRef.current(clamp(v, loRef.current + step, totalMax));
    e.preventDefault();
  };

  const onThumbDown = (which) => (e) => {
    dragging.current = which;
    e.preventDefault();
    e.stopPropagation();
  };

  const pctLo = ((lo - totalMin) / (totalMax - totalMin)) * 100;
  const pctHi = ((hi - totalMin) / (totalMax - totalMin)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-2">
        <div
          ref={trackRef}
          onPointerDown={onTrackDown}
          className="relative h-6 flex items-center cursor-pointer select-none"
        >
          <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
          <div
            className="absolute h-1.5 bg-slate-700 rounded-full pointer-events-none"
            style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
          />
          {/* Lo thumb — larger hit area, no jump on tap */}
          <div
            className="absolute w-7 h-7 -translate-x-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            style={{ left: `${pctLo}%` }}
            onPointerDown={onThumbDown("lo")}
          >
            <div className="w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-sm pointer-events-none" />
          </div>
          {/* Hi thumb */}
          <div
            className="absolute w-7 h-7 -translate-x-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            style={{ left: `${pctHi}%` }}
            onPointerDown={onThumbDown("hi")}
          >
            <div className="w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-sm pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={lo}
          min={totalMin}
          max={hi - step}
          step={step}
          onChange={(e) =>
            onLoChange(clamp(Number(e.target.value), totalMin, hi - step))
          }
          className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-slate-400 [appearance:textfield]"
        />
        <span className="text-xs text-slate-400 shrink-0">–</span>
        <input
          type="number"
          value={hi}
          min={lo + step}
          max={totalMax}
          step={step}
          onChange={(e) =>
            onHiChange(clamp(Number(e.target.value), lo + step, totalMax))
          }
          className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-slate-400 [appearance:textfield]"
        />
      </div>
    </div>
  );
}

// ─── MobileFilterButton ───────────────────────────────────────────────────────

export function MobileFilterButton({ onClick, totalActive }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors w-full"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
      Filters
      {totalActive > 0 && (
        <span className="text-[10px] font-bold bg-slate-700 text-white rounded-full px-1.5 py-0.5 leading-none">
          {totalActive}
        </span>
      )}
    </button>
  );
}
