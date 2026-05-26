import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";
import { useToast } from "@/context/ToastContext";
import {
  FilterCheck,
  FilterSection,
  FilterSidebarCard,
  DateRangeFilter,
  MobileFilterButton,
} from "@/components/FilterShared";
import Modal from "@/components/Modal";

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  ["createdAt-desc", "Listed: newest first"],
  ["createdAt-asc", "Listed: oldest first"],
  ["title-asc", "Title: A–Z"],
  ["title-desc", "Title: Z–A"],
  ["deadline-asc", "Deadline: soonest"],
  ["deadline-desc", "Deadline: latest"],
];

const OPP_TYPES = ["Pilot", "Co-development", "Challenge", "Research", "Other"];
const SECTORS = [
  "AgriTech",
  "CleanTech",
  "Creative Industries",
  "EdTech",
  "FinTech",
  "HealthTech",
  "Manufacturing",
  "Professional Services",
  "Tourism & Hospitality",
  "Other",
];

const TYPE_COLOURS = {
  Pilot: "bg-red-100 text-red-700",
  "Co-development": "bg-amber-100 text-amber-700",
  Challenge: "bg-sky-100 text-sky-700",
  Research: "bg-violet-100 text-violet-700",
  Other: "bg-slate-100 text-slate-500",
};

const TYPE_DOT = {
  Pilot: "bg-red-400",
  "Co-development": "bg-amber-400",
  Challenge: "bg-sky-400",
  Research: "bg-violet-400",
  Other: "bg-slate-400",
};

const SECTOR_DOT = {
  AgriTech: "bg-green-400",
  CleanTech: "bg-emerald-400",
  "Creative Industries": "bg-teal-400",
  EdTech: "bg-cyan-400",
  FinTech: "bg-sky-400",
  HealthTech: "bg-blue-400",
  Manufacturing: "bg-indigo-400",
  "Professional Services": "bg-violet-400",
  "Tourism & Hospitality": "bg-fuchsia-400",
  Other: "bg-slate-400",
};

const SECTOR_COLOURS = {
  AgriTech: "bg-green-100 text-green-700",
  CleanTech: "bg-emerald-100 text-emerald-700",
  "Creative Industries": "bg-teal-100 text-teal-700",
  EdTech: "bg-cyan-100 text-cyan-700",
  FinTech: "bg-sky-100 text-sky-700",
  HealthTech: "bg-blue-100 text-blue-700",
  Manufacturing: "bg-indigo-100 text-indigo-700",
  "Professional Services": "bg-violet-100 text-violet-700",
  "Tourism & Hospitality": "bg-fuchsia-100 text-fuchsia-700",
  Other: "bg-slate-100 text-slate-500",
};

const EMPTY_FILTERS = {
  types: new Set(),
  sectors: new Set(),
  deadlineFrom: "",
  deadlineTo: "",
};
const INPUT =
  "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300";
const LABEL = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
const OPT = (
  <span className="normal-case font-normal text-slate-400">(optional)</span>
);

function Field({ label, optional, className, children }) {
  return (
    <div
      className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}
    >
      <label className={LABEL}>
        {label} {optional && OPT}
      </label>
      {children}
    </div>
  );
}
const EMPTY_FORM = {
  title: "",
  description: "",
  type: "",
  organisation: "",
  sector: "",
  deadline: "",
  email: "",
  website: "",
};
const CURRENT_YEAR = new Date().getFullYear();
const POLL_INTERVAL = 5000;

// ─── OpportunityCard ──────────────────────────────────────────────────────────

function OpportunityCard({ opp }) {
  const [contactOpen, setContactOpen] = useState(false);
  const { reduceMotion } = useMotion();
  const typeColour = TYPE_COLOURS[opp.type] ?? TYPE_COLOURS.Other;

  const contacts = [
    opp.email && {
      label: "Email",
      href: `mailto:${opp.email}`,
      value: opp.email,
      newTab: false,
    },
    opp.website && {
      label: "Website",
      href: opp.website,
      value: opp.website,
      newTab: true,
    },
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 w-full">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-base">
              {opp.title}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColour}`}
            >
              {opp.type}
            </span>
            {opp.sector && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${SECTOR_COLOURS[opp.sector] ?? "bg-slate-100 text-slate-500"}`}
              >
                {opp.sector}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1 leading-snug">
            {opp.description}
          </p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs text-slate-400">{opp.organisation}</span>
            {opp.deadline && (
              <span className="text-xs text-slate-400">
                Deadline:{" "}
                {new Date(opp.deadline).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            {contacts.length > 0 && (
              <button
                onClick={() => setContactOpen((o) => !o)}
                className="ml-auto text-xs font-medium px-3 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                {contactOpen ? "Close" : "Get Involved"}
              </button>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
              {contacts.map(({ label, href, value, newTab }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="w-14 font-semibold text-slate-400 uppercase tracking-wide shrink-0">
                    {label}
                  </span>
                  <a
                    href={href}
                    target={newTab ? "_blank" : undefined}
                    rel="noreferrer"
                    className="text-amber-600 hover:underline truncate"
                  >
                    {value}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 w-full bg-slate-100 rounded mb-1" />
      <div className="h-3 w-3/4 bg-slate-100 rounded mb-3" />
      <div className="flex gap-4">
        <div className="h-3 w-28 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── AddOpportunityForm ───────────────────────────────────────────────────────

function AddOpportunityForm({ open, onClose, onAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      onClose();
      onAdded();
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(
        "Failed to submit opportunity",
        body.error ?? `Server error ${res.status}`,
      );
    }
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add your opportunity">
      <form onSubmit={handleSubmit}>
        <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" className="sm:col-span-2">
            <input
              required
              minLength={4}
              maxLength={120}
              value={form.title}
              onChange={set("title")}
              placeholder="Your opportunity name"
              className={INPUT}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              required
              minLength={20}
              maxLength={500}
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the opportunity in detail. (20–500 characters)"
              rows={3}
              className={`${INPUT} resize-none`}
            />
            <span className="text-xs text-slate-400 text-right">
              {form.description.length}/500
            </span>
          </Field>
          <Field label="Type">
            <select
              required
              value={form.type}
              onChange={set("type")}
              className={INPUT}
            >
              <option value="">Select…</option>
              {OPP_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Sector" optional>
            <select
              value={form.sector}
              onChange={set("sector")}
              className={INPUT}
            >
              <option value="">Any</option>
              {SECTORS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Organisation">
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.organisation}
              onChange={set("organisation")}
              placeholder="Your organisation"
              className={INPUT}
            />
          </Field>
          <Field label="Deadline" optional>
            <input
              type="date"
              value={form.deadline}
              onChange={set("deadline")}
              min={`${CURRENT_YEAR}-01-01`}
              className={INPUT}
            />
          </Field>
          <Field label="Email" optional>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="hello@example.com"
              className={INPUT}
            />
          </Field>
          <Field label="Website" optional>
            <input
              type="url"
              value={form.website}
              onChange={set("website")}
              placeholder="https://example.com"
              pattern="https?://.+"
              title="Must start with http:// or https://"
              className={INPUT}
            />
          </Field>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-100 mt-6 px-6 py-4 flex flex-col gap-3">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-400 focus:ring-amber-300 shrink-0"
            />
            <span className="text-xs text-slate-500">
              I have read and agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 underline hover:text-amber-600"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 underline hover:text-amber-600"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Opportunity"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── FilterPanel ───────────────────────────────────────────────────────────

function FilterPanel({ filters, setFilters, toggle, clearAll, opps }) {
  const typeCount = (type) => opps.filter((o) => o.type === type).length;
  const sectorCount = (sector) =>
    opps.filter((o) => o.sector === sector).length;
  const deadlineActive =
    filters.deadlineFrom !== "" || filters.deadlineTo !== "";
  const totalActive =
    filters.types.size + filters.sectors.size + (deadlineActive ? 1 : 0);
  return (
    <FilterSidebarCard totalActive={totalActive} onClearAll={clearAll}>
      <FilterSection title="Type" activeCount={filters.types.size}>
        {OPP_TYPES.map((type) => (
          <FilterCheck
            key={type}
            checked={filters.types.has(type)}
            onChange={() => toggle("types", type)}
            label={type}
            dot={TYPE_DOT[type]}
            count={typeCount(type)}
          />
        ))}
      </FilterSection>
      <FilterSection title="Sector" activeCount={filters.sectors.size}>
        {SECTORS.map((sector) => (
          <FilterCheck
            key={sector}
            checked={filters.sectors.has(sector)}
            onChange={() => toggle("sectors", sector)}
            label={sector}
            dot={SECTOR_DOT[sector]}
            count={sectorCount(sector)}
          />
        ))}
      </FilterSection>
      <FilterSection title="Deadline" activeCount={deadlineActive ? 1 : 0}>
        <DateRangeFilter
          from={filters.deadlineFrom}
          to={filters.deadlineTo}
          onFromChange={(v) => setFilters((f) => ({ ...f, deadlineFrom: v }))}
          onToChange={(v) => setFilters((f) => ({ ...f, deadlineTo: v }))}
        />
      </FilterSection>
    </FilterSidebarCard>
  );
}

// ─── OppsPanel ────────────────────────────────────────────────────────────────

export default function OppsPanel() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("createdAt-desc");
  const [newIds, setNewIds] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  // null on first fetch; skip the "new item" highlight so initial load doesn't flash everything.
  const seenIds = useRef(null);
  const newIdTimer = useRef(null);
  const { reduceMotion } = useMotion();
  const { toast } = useToast();

  const fetchOpps = useCallback(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (seenIds.current !== null) {
          const brandNew = data
            .filter((o) => !seenIds.current.has(o._id))
            .map((o) => o._id);
          if (brandNew.length > 0) {
            clearTimeout(newIdTimer.current);
            setNewIds(new Set(brandNew));
            newIdTimer.current = setTimeout(() => setNewIds(new Set()), 3000);
          }
        }
        seenIds.current = new Set(data.map((o) => o._id));
        setOpps(data);
        setLoading(false);
      })
      .catch(() =>
        toast.error(
          "Could not load opportunities",
          "Check your connection",
          "poll-opportunities",
        ),
      );
  }, [toast]);

  useEffect(() => {
    fetchOpps();
    const interval = setInterval(fetchOpps, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      clearTimeout(newIdTimer.current);
    };
  }, [fetchOpps]);

  const toggle = useCallback((group, value) => {
    setFilters((prev) => {
      const next = new Set(prev[group]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [group]: next };
    });
  }, []);

  const clearAll = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const deadlineActive =
    filters.deadlineFrom !== "" || filters.deadlineTo !== "";
  const totalActive =
    filters.types.size + filters.sectors.size + (deadlineActive ? 1 : 0);

  const visible = opps
    .filter((o) => {
      if (filters.types.size > 0 && !filters.types.has(o.type)) return false;
      if (
        filters.sectors.size > 0 &&
        o.sector &&
        !filters.sectors.has(o.sector)
      )
        return false;
      if (deadlineActive && o.deadline) {
        const dl = o.deadline.split("T")[0];
        if (filters.deadlineFrom && dl < filters.deadlineFrom) return false;
        if (filters.deadlineTo && dl > filters.deadlineTo) return false;
      }
      const q = search.toLowerCase();
      if (
        q &&
        !o.title.toLowerCase().includes(q) &&
        !o.description.toLowerCase().includes(q) &&
        !o.organisation.toLowerCase().includes(q)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const [field, dir] = sort.split("-");
      const mul = dir === "asc" ? 1 : -1;
      if (field === "title") return mul * a.title.localeCompare(b.title);
      if (field === "createdAt")
        return mul * (new Date(a.createdAt) - new Date(b.createdAt));
      if (field === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return mul * (new Date(a.deadline) - new Date(b.deadline));
      }
      return 0;
    });

  const filterPanelProps = { filters, setFilters, toggle, clearAll, opps };

  return (
    <>
      <div className="h-2" />
      {/* Sticky bar — z-51 covers navbar shadow when docked */}
      <div className="sticky top-14 lg:top-[72px] z-51 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-3 flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex items-center gap-2 md:shrink-0">
            <button
              onClick={() => setFormOpen(true)}
              className="flex-1 md:flex-none text-sm font-semibold px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              + Post Opportunity
            </button>
            <div className="flex-1 md:hidden">
              <MobileFilterButton
                onClick={() => setMobileFiltersOpen((o) => !o)}
                totalActive={totalActive}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="search"
              placeholder="Search opportunities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shrink-0 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap tabular-nums">
              {visible.length} {visible.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-16 py-8 max-w-5xl mx-auto flex flex-col gap-4">
        <AddOpportunityForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onAdded={fetchOpps}
        />

        <div className="flex gap-6 items-start">
          <div className="hidden md:block w-52 shrink-0 sticky top-32 lg:top-[136px]">
            <FilterPanel {...filterPanelProps} />
          </div>

          <Modal
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            variant="sheet"
          >
            <div className="px-4 py-2">
              <FilterPanel {...filterPanelProps} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-slate-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-slate-700 transition-colors"
              >
                {visible.length === 1
                  ? "Show 1 result"
                  : `Show ${visible.length} results`}
              </button>
            </div>
          </Modal>

          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
            ) : visible.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No opportunities found.
              </p>
            ) : (
              <AnimatePresence>
                {visible.map((opp) => {
                  const isNew = newIds.has(opp._id);
                  return (
                    <motion.div
                      key={opp._id}
                      layout
                      initial={!reduceMotion ? { opacity: 0, y: 8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={!reduceMotion ? { opacity: 0, y: -4 } : undefined}
                      transition={{
                        layout: { duration: 0.2, ease: "easeOut" },
                        default: { duration: 0.15, ease: "easeOut" },
                      }}
                      className="relative"
                    >
                      {isNew && !reduceMotion && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{
                            boxShadow:
                              "0 0 0 1.5px #94a3b8, 0 0 10px 2px #94a3b828",
                          }}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 0 }}
                          transition={{
                            duration: 1.8,
                            delay: 0.3,
                            ease: "easeOut",
                          }}
                        />
                      )}
                      <OpportunityCard opp={opp} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
