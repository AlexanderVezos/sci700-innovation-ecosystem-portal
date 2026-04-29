import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";

const OPP_SORT_OPTIONS = [
  ["createdAt-desc", "Listed: newest first"],
  ["createdAt-asc", "Listed: oldest first"],
  ["title-asc", "Title: A–Z"],
  ["title-desc", "Title: Z–A"],
  ["deadline-asc", "Deadline: soonest"],
  ["deadline-desc", "Deadline: latest"],
];

const OPP_TYPES = ["Pilot", "Co-development", "Challenge", "Research", "Other"];
const SECTORS = [
  "HealthTech",
  "EdTech",
  "CleanTech",
  "FinTech",
  "AgriTech",
  "Other",
];

const TYPE_COLOURS = {
  Pilot: "bg-amber-100 text-amber-700",
  "Co-development": "bg-blue-100 text-blue-700",
  Challenge: "bg-rose-100 text-rose-700",
  Research: "bg-violet-100 text-violet-700",
  Other: "bg-slate-100 text-slate-500",
};

const INPUT =
  "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300";
const LABEL = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
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
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
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

function AddOpportunityForm({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { reduceMotion } = useMotion();
  const CURRENT_YEAR = new Date().getFullYear();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setOpen(false);
      onAdded();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
      >
        {open ? "Cancel" : "+ Post Opportunity"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            key="opp-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ overflow: "hidden" }}
            onSubmit={handleSubmit}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-4 flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={LABEL}>Title</label>
                <input
                  required
                  minLength={4}
                  maxLength={120}
                  value={form.title}
                  onChange={set("title")}
                  placeholder="What are you looking for?"
                  className={INPUT}
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={LABEL}>Description</label>
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
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>Type</label>
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
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>
                  Sector{" "}
                  <span className="normal-case font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
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
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>Organisation</label>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.organisation}
                  onChange={set("organisation")}
                  placeholder="Your organisation"
                  className={INPUT}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>
                  Deadline{" "}
                  <span className="normal-case font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={set("deadline")}
                  min={`${CURRENT_YEAR}-01-01`}
                  className={INPUT}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>
                  Email{" "}
                  <span className="normal-case font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="contact@org.com"
                  className={INPUT}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>
                  Website{" "}
                  <span className="normal-case font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={set("website")}
                  placeholder="https://org.com"
                  pattern="https?://.+"
                  title="Must start with http:// or https://"
                  className={INPUT}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Opportunity"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const POLL_INTERVAL = 3000;

function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sort, setSort] = useState("createdAt-desc");
  const [newIds, setNewIds] = useState(new Set());
  const seenIds = useRef(null);
  const newIdTimer = useRef(null);
  const { reduceMotion } = useMotion();

  const fetchOpps = useCallback(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (seenIds.current !== null) {
          const brandNew = data.filter((o) => !seenIds.current.has(o._id)).map((o) => o._id);
          if (brandNew.length > 0) {
            clearTimeout(newIdTimer.current);
            setNewIds(new Set(brandNew));
            newIdTimer.current = setTimeout(() => setNewIds(new Set()), 3000);
          }
        }
        seenIds.current = new Set(data.map((o) => o._id));
        setOpps(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOpps();
    const interval = setInterval(fetchOpps, POLL_INTERVAL);
    return () => { clearInterval(interval); clearTimeout(newIdTimer.current); };
  }, [fetchOpps]);

  const visible = opps
    .filter((o) => {
      const matchType = filterType === "All" || o.type === filterType;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.organisation.toLowerCase().includes(q);
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      const [field, dir] = sort.split("-");
      const mul = dir === "asc" ? 1 : -1;
      if (field === "title") return mul * a.title.localeCompare(b.title);
      if (field === "createdAt") return mul * (new Date(a.createdAt) - new Date(b.createdAt));
      if (field === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return mul * (new Date(a.deadline) - new Date(b.deadline));
      }
      return 0;
    });

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              Open for
              <br />
              collaboration.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Post a pilot, challenge, or co-development call. Find
              organisations ready to work with you.
            </p>
          </div>
        </div>

        <div className="px-8 md:px-16 py-12 max-w-2xl mx-auto flex flex-col gap-4">
          <AddOpportunityForm onAdded={fetchOpps} />

          <div className="flex flex-col gap-2">
            <input
              type="search"
              placeholder="Search opportunities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="flex flex-wrap md:flex-nowrap gap-1.5">
              {["All", ...OPP_TYPES].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={[
                    "md:flex-auto font-medium px-3 py-1.5 md:px-2 md:py-1 rounded-full transition-colors text-sm md:text-[clamp(0.6rem,1.2vw,0.875rem)] whitespace-nowrap",
                    filterType === t
                      ? "bg-slate-800 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {OPP_SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

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
                    transition={{ layout: { duration: 0.2, ease: "easeOut" }, default: { duration: 0.15, ease: "easeOut" } }}
                    className="relative"
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
                    <OpportunityCard opp={opp} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default Opportunities;
