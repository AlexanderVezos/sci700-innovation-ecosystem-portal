import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

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

const AVATAR_COLOURS = [
  "bg-amber-100 text-amber-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-rose-100 text-rose-600",
  "bg-lime-100 text-lime-600",
];

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

const CURRENT_YEAR = new Date().getFullYear();

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

function Field({ label, optional, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={LABEL}>
        {label} {optional && OPT}
      </label>
      {children}
    </div>
  );
}

function AddStartupForm({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { reduceMotion } = useMotion();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
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
      setOpen(false);
      onAdded();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
      >
        {open ? "Cancel" : "+ Add Startup"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            key="startup-form"
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
              <Field label="Name">
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Your startup's name"
                  className={INPUT}
                />
              </Field>

              <Field label="Category">
                <select
                  required
                  value={form.tag}
                  onChange={set("tag")}
                  className={INPUT}
                >
                  <option value="">Select…</option>
                  {TAGS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Description" className="sm:col-span-2">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <textarea
                    required
                    minLength={20}
                    maxLength={500}
                    value={form.description}
                    onChange={set("description")}
                    placeholder="What does your startup do? (20–500 characters)"
                    rows={2}
                    className={`${INPUT} resize-none`}
                  />
                  <span className="text-xs text-slate-400 text-right">
                    {form.description.length}/500
                  </span>
                </div>
              </Field>

              <Field label="Founded Year">
                <input
                  required
                  type="number"
                  value={form.year}
                  onChange={set("year")}
                  placeholder={String(CURRENT_YEAR)}
                  min={1990}
                  max={CURRENT_YEAR}
                  className={INPUT}
                />
              </Field>

              <Field label="Team Size">
                <input
                  required
                  type="number"
                  value={form.employees}
                  onChange={set("employees")}
                  placeholder="1"
                  min={1}
                  max={100000}
                  className={INPUT}
                />
              </Field>

              <Field label="Stage">
                <select
                  required
                  value={form.stage}
                  onChange={set("stage")}
                  className={INPUT}
                >
                  <option value="">Select…</option>
                  {STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Email" optional>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="hello@startup.com"
                  className={INPUT}
                />
              </Field>

              <Field label="Website" optional>
                <input
                  type="url"
                  value={form.website}
                  onChange={set("website")}
                  placeholder="https://startup.com"
                  pattern="https?://.+"
                  title="Must start with http:// or https://"
                  className={INPUT}
                />
              </Field>

              <Field label="Phone" optional>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: formatPhone(e.target.value),
                    }))
                  }
                  placeholder="0412 345 678"
                  className={INPUT}
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-4">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Startup"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function DirectoryCard({ entry }) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start">
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
    </div>
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

function Table({ showForm = true }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const fetchEntries = () => {
    fetch("/api/startups")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const visible = entries.filter((e) => {
    const matchTag = filterTag === "All" || e.tag === filterTag;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  if (loading) {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl">
      {showForm && <AddStartupForm onAdded={fetchEntries} />}

      {/* Search + filter */}
      <div className="flex flex-col gap-2">
        <input
          type="search"
          placeholder="Search startups…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="flex flex-wrap gap-1.5">
          {["All", ...TAGS].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className={[
                "font-medium px-3 py-1 rounded-full transition-colors text-sm whitespace-nowrap",
                filterTag === t
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">
          No startups found.
        </p>
      )}
      {visible.map((entry, i) => (
        <DirectoryCard key={i} entry={entry} />
      ))}
    </div>
  );
}

export default Table;
