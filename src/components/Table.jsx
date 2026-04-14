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

const EMPTY_FORM = {
  name: "",
  tag: "",
  description: "",
  year: "",
  employees: "",
  stage: "",
};

function AddStartupForm({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { reduceMotion } = useMotion();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("http://localhost:3001/api/startups", {
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
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden" }}
          onSubmit={handleSubmit}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-4 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="Your startup's name"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Category
              </label>
              <select
                required
                value={form.tag}
                onChange={set("tag")}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">Select…</option>
                {TAGS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Description
              </label>
              <textarea
                required
                value={form.description}
                onChange={set("description")}
                placeholder="What does your startup do?"
                rows={2}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Founded Year
              </label>
              <input
                required
                type="number"
                value={form.year}
                onChange={set("year")}
                placeholder="2026"
                min={2000}
                max={2099}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Team Size
              </label>
              <input
                required
                type="number"
                value={form.employees}
                onChange={set("employees")}
                placeholder="99"
                min={1}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Stage
              </label>
              <select
                required
                value={form.stage}
                onChange={set("stage")}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">Select…</option>
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="self-end bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Startup"}
          </button>
        </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function DirectoryCard({ entry }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start">
      <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-base">
            {entry.name}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {entry.tag}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-snug">
          {entry.description}
        </p>
        <div className="flex gap-4 mt-2 text-xs text-slate-400 flex-wrap">
          <span>&#128197; {entry.year}</span>
          <span>&#128101; {entry.employees}</span>
          <span>&#127807; {entry.stage}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button className="bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
          View Profile
        </button>
        <button className="bg-slate-100 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
          Say Hello
        </button>
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
      <div className="flex flex-col gap-2 shrink-0">
        <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        <div className="h-8 w-24 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

function Table({ showForm = true }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = () => {
    fetch("http://localhost:3001/api/startups")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, []);

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
    <div className="flex flex-col items-start gap-3 w-full max-w-2xl">
      {showForm && <AddStartupForm onAdded={fetchEntries} />}
      {entries.map((entry, i) => (
        <DirectoryCard key={i} entry={entry} />
      ))}
    </div>
  );
}

export default Table;
