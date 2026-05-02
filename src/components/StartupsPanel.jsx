import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";
import { useToast } from "@/context/ToastContext";
import {
  FilterCheck,
  FilterSection,
  FilterSidebarCard,
  DualRangeSlider,
  MobileFilterButton,
} from "@/components/FilterShared";
import Modal from "@/components/Modal";

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  ["createdAt-desc", "Listed: newest first"],
  ["createdAt-asc", "Listed: oldest first"],
  ["name-asc", "Name: A–Z"],
  ["name-desc", "Name: Z–A"],
  ["year-desc", "Founded: newest"],
  ["year-asc", "Founded: oldest"],
  ["employees-desc", "Employees: most"],
  ["employees-asc", "Employees: fewest"],
];

const STAGES = ["Idea", "MVP", "Growth"];
const TAGS = [
  "HealthTech",
  "EdTech",
  "CleanTech",
  "FinTech",
  "AgriTech",
  "Other",
];

const TAG_COLOURS = {
  HealthTech: "bg-blue-100 text-blue-700",
  EdTech: "bg-violet-100 text-violet-700",
  CleanTech: "bg-emerald-100 text-emerald-700",
  FinTech: "bg-amber-100 text-amber-700",
  AgriTech: "bg-lime-100 text-lime-700",
  Other: "bg-slate-100 text-slate-500",
};

const TAG_DOT = {
  HealthTech: "bg-blue-400",
  EdTech: "bg-violet-400",
  CleanTech: "bg-emerald-400",
  FinTech: "bg-amber-400",
  AgriTech: "bg-lime-400",
  Other: "bg-slate-400",
};

const AVATAR_COLOURS = [
  "bg-amber-100 text-amber-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-rose-100 text-rose-600",
  "bg-lime-100 text-lime-600",
];

const TEAM_MIN = 1;
const TEAM_MAX = 500;
const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear();

const EMPTY_FILTERS = {
  tags: new Set(),
  stages: new Set(),
  teamSize: [TEAM_MIN, TEAM_MAX],
  founded: [YEAR_MIN, YEAR_MAX],
};
const CURRENT_YEAR  = new Date().getFullYear();
const POLL_INTERVAL = 3000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColour(name) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[hash % AVATAR_COLOURS.length];
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatPhone(value) {
  const raw = value.replace(/[^\d+]/g, "").replace(/(?!^\+)\+/g, "");
  if (raw.startsWith("+61")) {
    const nat = raw.slice(3);
    let out = "+61";
    if (nat.length > 0) out += " " + nat.slice(0, 3);
    if (nat.length > 3) out += " " + nat.slice(3, 6);
    if (nat.length > 6) out += " " + nat.slice(6, 9);
    return out;
  }
  if (raw.startsWith("04")) {
    let out = raw.slice(0, 4);
    if (raw.length > 4) out += " " + raw.slice(4, 7);
    if (raw.length > 7) out += " " + raw.slice(7, 10);
    return out;
  }
  if (raw.startsWith("0") && raw.length >= 2) {
    let out = "(" + raw.slice(0, 2) + ")";
    if (raw.length > 2) out += " " + raw.slice(2, 6);
    if (raw.length > 6) out += " " + raw.slice(6, 10);
    return out;
  }
  return raw;
}

const INPUT =
  "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300";
const LABEL = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
const OPT = (
  <span className="normal-case font-normal text-slate-400">(optional)</span>
);

function Field({ label, optional, className, children }) {
  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      <label className={LABEL}>
        {label} {optional && OPT}
      </label>
      {children}
    </div>
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, setFilters, toggle, clearAll, entries }) {
  const tagCount = (tag) => entries.filter((e) => e.tag === tag).length;
  const stageCount = (stage) => entries.filter((e) => e.stage === stage).length;

  const teamActive =
    filters.teamSize[0] !== TEAM_MIN || filters.teamSize[1] !== TEAM_MAX;
  const yearActive =
    filters.founded[0] !== YEAR_MIN || filters.founded[1] !== YEAR_MAX;
  const totalActive =
    filters.tags.size +
    filters.stages.size +
    (teamActive ? 1 : 0) +
    (yearActive ? 1 : 0);

  return (
    <FilterSidebarCard totalActive={totalActive} onClearAll={clearAll}>
      <FilterSection title="Category" activeCount={filters.tags.size}>
        {TAGS.map((tag) => (
          <FilterCheck
            key={tag}
            checked={filters.tags.has(tag)}
            onChange={() => toggle("tags", tag)}
            label={tag}
            dot={TAG_DOT[tag]}
            count={tagCount(tag)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Stage" activeCount={filters.stages.size}>
        {STAGES.map((stage) => (
          <FilterCheck
            key={stage}
            checked={filters.stages.has(stage)}
            onChange={() => toggle("stages", stage)}
            label={stage}
            count={stageCount(stage)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Team Size" activeCount={teamActive ? 1 : 0}>
        <div className="pb-1">
          <DualRangeSlider
            lo={filters.teamSize[0]}
            hi={filters.teamSize[1]}
            totalMin={TEAM_MIN}
            totalMax={TEAM_MAX}
            step={1}
            onLoChange={(v) =>
              setFilters((f) => ({ ...f, teamSize: [v, f.teamSize[1]] }))
            }
            onHiChange={(v) =>
              setFilters((f) => ({ ...f, teamSize: [f.teamSize[0], v] }))
            }
          />
        </div>
      </FilterSection>

      <FilterSection title="Founded" activeCount={yearActive ? 1 : 0}>
        <div className="pb-1">
          <DualRangeSlider
            lo={filters.founded[0]}
            hi={filters.founded[1]}
            totalMin={YEAR_MIN}
            totalMax={YEAR_MAX}
            step={1}
            onLoChange={(v) =>
              setFilters((f) => ({ ...f, founded: [v, f.founded[1]] }))
            }
            onHiChange={(v) =>
              setFilters((f) => ({ ...f, founded: [f.founded[0], v] }))
            }
          />
        </div>
      </FilterSection>
    </FilterSidebarCard>
  );
}

// ─── Add startup form ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  tag: "",
  description: "",
  year: "",
  employees: "",
  stage: "",
  email: "",
  website: "",
  phone: "",
};

function AddStartupForm({ open, onClose, onAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/startups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        employees: Number(form.employees),
      }),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      onClose();
      onAdded();
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error("Failed to submit startup", body.error ?? `Server error ${res.status}`);
    }
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add your startup">
      <form onSubmit={handleSubmit}>
        <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input required minLength={2} maxLength={100} value={form.name} onChange={set("name")} placeholder="Your startup name" className={INPUT} />
          </Field>
          <Field label="Category">
            <select required value={form.tag} onChange={set("tag")} className={INPUT}>
              <option value="">Select…</option>
              {TAGS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea required minLength={20} maxLength={500} value={form.description} onChange={set("description")}
              placeholder="Describe your startup. (20–500 characters)" rows={2} className={`${INPUT} resize-none`} />
            <span className="text-xs text-slate-400 text-right">{form.description.length}/500</span>
          </Field>
          <Field label="Founded Year">
            <input required type="number" value={form.year} onChange={set("year")} placeholder={String(CURRENT_YEAR)} min={1990} max={CURRENT_YEAR} className={INPUT} />
          </Field>
          <Field label="Team Size">
            <input required type="number" value={form.employees} onChange={set("employees")} placeholder="1" min={1} max={100000} className={INPUT} />
          </Field>
          <Field label="Stage">
            <select required value={form.stage} onChange={set("stage")} className={INPUT}>
              <option value="">Select…</option>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Email" optional>
            <input type="email" value={form.email} onChange={set("email")} placeholder="hello@example.com" className={INPUT} />
          </Field>
          <Field label="Website" optional>
            <input type="url" value={form.website} onChange={set("website")} placeholder="https://example.com" pattern="https?://.+" title="Must start with http:// or https://" className={INPUT} />
          </Field>
          <Field label="Phone" optional>
            <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))} placeholder="0412 345 678" className={INPUT} />
          </Field>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-100 mt-6 px-6 py-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
            {submitting ? "Submitting…" : "Submit Startup"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function DirectoryCard({ entry, isNew }) {
  const [contactOpen, setContactOpen] = useState(false);
  const { reduceMotion } = useMotion();
  const av = avatarColour(entry.name);
  const tagColour = TAG_COLOURS[entry.tag] ?? TAG_COLOURS.Other;

  const contacts = [
    entry.email && {
      label: "Email",
      href: `mailto:${entry.email}`,
      value: entry.email,
      newTab: false,
    },
    entry.website && {
      label: "Website",
      href: entry.website,
      value: entry.website,
      newTab: true,
    },
    entry.phone && {
      label: "Phone",
      href: `tel:${entry.phone}`,
      value: entry.phone,
      newTab: false,
    },
  ].filter(Boolean);

  return (
    <motion.div
      layout
      initial={!reduceMotion ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={!reduceMotion ? { opacity: 0, y: -4 } : undefined}
      transition={{
        layout: { duration: 0.2, ease: "easeOut" },
        default: { duration: 0.15, ease: "easeOut" },
      }}
      className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start"
    >
      {isNew && !reduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "0 0 0 2px #fbbf24, 0 0 24px 4px #fbbf2440" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.5, delay: 0.4, ease: "easeOut" }}
        />
      )}
      <div
        className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center font-bold text-lg select-none ${av}`}
      >
        {initials(entry.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-base">
            {entry.name}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColour}`}
          >
            {entry.tag}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-snug">
          {entry.description}
        </p>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <span className="text-xs text-slate-400">Est. {entry.year}</span>
          <span className="text-xs text-slate-400">
            {entry.employees} people
          </span>
          <span className="text-xs text-slate-400">{entry.stage}</span>
          {contacts.length > 0 && (
            <button
              onClick={() => setContactOpen((o) => !o)}
              className="ml-auto text-xs font-medium px-3 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              {contactOpen ? "Close" : "Say Hello"}
            </button>
          )}
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
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-3/4 bg-slate-100 rounded" />
        <div className="flex gap-4 mt-1">
          <div className="h-3 w-10 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

function StartupsPanel({ showForm = true }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("createdAt-desc");
  const [newIds, setNewIds] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const seenIds = useRef(null);
  const newIdTimer = useRef(null);
  const { toast } = useToast();

  const fetchEntries = useCallback(() => {
    fetch("/api/startups")
      .then((res) => res.json())
      .then((data) => {
        if (seenIds.current !== null) {
          const brandNew = data
            .filter((s) => !seenIds.current.has(s._id))
            .map((s) => s._id);
          if (brandNew.length > 0) {
            clearTimeout(newIdTimer.current);
            setNewIds(new Set(brandNew));
            newIdTimer.current = setTimeout(() => setNewIds(new Set()), 3000);
          }
        }
        seenIds.current = new Set(data.map((s) => s._id));
        setEntries(data);
        setLoading(false);
      })
      .catch(() => toast.error("Could not load directory", "Check your connection", "poll-startups"));
  }, [toast]);

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      clearTimeout(newIdTimer.current);
    };
  }, [fetchEntries]);

  const toggle = useCallback((group, value) => {
    setFilters((prev) => {
      const next = new Set(prev[group]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [group]: next };
    });
  }, []);

  const clearAll = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const teamActive =
    filters.teamSize[0] !== TEAM_MIN || filters.teamSize[1] !== TEAM_MAX;
  const yearActive =
    filters.founded[0] !== YEAR_MIN || filters.founded[1] !== YEAR_MAX;
  const totalActive =
    filters.tags.size +
    filters.stages.size +
    (teamActive ? 1 : 0) +
    (yearActive ? 1 : 0);

  const visible = entries
    .filter((e) => {
      if (filters.tags.size > 0 && !filters.tags.has(e.tag)) return false;
      if (filters.stages.size > 0 && !filters.stages.has(e.stage)) return false;
      if (
        teamActive &&
        (e.employees < filters.teamSize[0] || e.employees > filters.teamSize[1])
      )
        return false;
      if (
        yearActive &&
        (e.year < filters.founded[0] || e.year > filters.founded[1])
      )
        return false;
      const q = search.toLowerCase();
      if (
        q &&
        !e.name.toLowerCase().includes(q) &&
        !e.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const [field, dir] = sort.split("-");
      const mul = dir === "asc" ? 1 : -1;
      if (field === "name") return mul * a.name.localeCompare(b.name);
      if (field === "year") return mul * (a.year - b.year);
      if (field === "employees") return mul * (a.employees - b.employees);
      if (field === "createdAt")
        return mul * (new Date(a.createdAt) - new Date(b.createdAt));
      return 0;
    });

  const filterPanelProps = { filters, setFilters, toggle, clearAll, entries };

  return (
    <>
      <div className="h-2" />
      {/* Sticky bar — z-51 covers navbar shadow when docked */}
      <div className="sticky top-14 lg:top-[72px] z-51 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-3 flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex items-center gap-2 md:shrink-0">
            {showForm && (
              <button
                onClick={() => setFormOpen(true)}
                className="flex-1 md:flex-none text-sm font-semibold px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                + Add Startup
              </button>
            )}
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
              placeholder="Search startups…"
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
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap tabular-nums">
              {visible.length} {visible.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>
      </div>

      {showForm && (
        <AddStartupForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onAdded={fetchEntries}
        />
      )}

      <div className="px-8 md:px-16 py-8 max-w-5xl mx-auto">
        <div className="flex gap-6 items-start">
          <div className="hidden md:block w-52 shrink-0 sticky top-32 lg:top-[136px]">
            <FilterPanel {...filterPanelProps} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <Modal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} variant="sheet">
              <div className="px-4 py-2">
                <FilterPanel {...filterPanelProps} />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-slate-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  {visible.length === 1 ? "Show 1 result" : `Show ${visible.length} results`}
                </button>
              </div>
            </Modal>
            {loading ? (
              Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
            ) : visible.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No startups match your filters.</p>
            ) : (
              <AnimatePresence>
                {visible.map((entry) => (
                  <DirectoryCard key={entry._id} entry={entry} isNew={newIds.has(entry._id)} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default StartupsPanel;
