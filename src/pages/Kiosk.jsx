import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TAGS, STAGES, isValidPhone, isValidEmail, isValidWebsite } from "@/lib/startupConstants";
import { PhoneField, EmailField, WebsiteField } from "@/components/PhoneField";

const CURRENT_YEAR = new Date().getFullYear();

const ENTITY_TYPES = [
  "Startup",
  "Investor",
  "Research Institution",
  "Industry Partner",
  "Government",
];

const STARTUP_TYPES = new Set(["Startup"]);
const HAS_METRICS_TYPES = new Set(["Startup", "Research Institution"]);

const EMPTY = {
  type: "", name: "", tags: [], description: "",
  year: "", employees: "", stage: "", email: "", website: "", phone: "",
};

function Field({ label, optional, children, className }) {
  return (
    <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
      <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
        {label}{optional && <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">— optional</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = "border-2 border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-800 bg-white focus:outline-none focus:border-slate-400 focus:ring-0 w-full transition-colors";

function SuccessScreen({ name, onReset }) {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const t = setInterval(() => setCountdown((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (countdown <= 0) onReset();
  }, [countdown, onReset]);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-screen px-8 text-center"
    >
      <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-3">You're on the map!</h2>
      <p className="text-xl text-slate-500 mb-2">
        <span className="font-semibold text-slate-700">{name}</span> has been submitted for review.
      </p>
      <p className="text-slate-400 text-sm mt-6">Resetting in {countdown}s</p>
    </motion.div>
  );
}

export default function Kiosk() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const isStartup = STARTUP_TYPES.has(form.type);
  const hasMetrics = HAS_METRICS_TYPES.has(form.type);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.tags.length === 0) {
      setError("Select at least one sector.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError("Phone number is incomplete — enter a full Australian number or leave it blank.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Email address looks wrong — check it and try again.");
      return;
    }
    if (!isValidWebsite(form.website)) {
      setError("Website must be a full URL starting with https://");
      return;
    }
    setSubmitting(true);
    setError("");

    const body = {
      type: form.type,
      name: form.name,
      tags: form.tags,
      description: form.description,
      email: form.email,
      website: form.website,
      phone: form.phone,
    };
    if (isStartup && form.stage) body.stage = form.stage;
    if (hasMetrics && form.year) body.year = Number(form.year);
    if (hasMetrics && form.employees) body.employees = Number(form.employees);

    try {
      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(form.name);
        setForm(EMPTY);
      } else {
        const resBody = await res.json().catch(() => ({}));
        setError(resBody.error ?? "Something went wrong — please try again.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() { setSubmitted(null); setError(""); }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between">
        <span className="text-2xl font-black tracking-tighter text-slate-900">
          STARTUP<span className="text-cyan-600">SC</span>
        </span>
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Sunshine Coast Innovation Ecosystem</span>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <SuccessScreen key="success" name={submitted} onReset={reset} />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto px-6 py-10"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">Add your listing</h1>
              <p className="text-slate-500 mt-1">Get listed on the Sunshine Coast innovation map.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Type">
                  <select required value={form.type} onChange={set("type")} className={INPUT}>
                    <option value="">Select…</option>
                    {ENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Name">
                  <input required minLength={2} maxLength={100} value={form.name} onChange={set("name")}
                    placeholder="Organisation or venture name" className={INPUT} />
                </Field>
              </div>

              <Field label="Sectors">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-1">
                  {TAGS.map((tag) => (
                    <label key={tag} className="flex items-center gap-3 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={form.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="w-5 h-5 rounded border-slate-300 text-amber-400 focus:ring-amber-300 shrink-0"
                      />
                      <span className="text-base text-slate-700">{tag}</span>
                    </label>
                  ))}
                </div>
                {form.tags.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1.5">Select at least one sector.</p>
                )}
              </Field>

              <Field label="Description">
                <textarea required minLength={20} maxLength={500} value={form.description} onChange={set("description")}
                  placeholder="Describe what you do. (20–500 characters)" rows={3} className={`${INPUT} resize-none`} />
                <span className="text-xs text-slate-400 text-right">{form.description.length}/500</span>
              </Field>

              {isStartup && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Founded Year">
                    <input type="number" value={form.year} onChange={set("year")}
                      placeholder={String(CURRENT_YEAR)} min={1990} max={CURRENT_YEAR} className={INPUT} />
                  </Field>
                  <Field label="Team Size">
                    <input type="number" value={form.employees} onChange={set("employees")}
                      placeholder="1" min={1} max={100000} className={INPUT} />
                  </Field>
                  <Field label="Stage">
                    <select value={form.stage} onChange={set("stage")} className={INPUT}>
                      <option value="">Select…</option>
                      {STAGES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {hasMetrics && !isStartup && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Established Year" optional>
                    <input type="number" value={form.year} onChange={set("year")}
                      placeholder={String(CURRENT_YEAR)} min={1990} max={CURRENT_YEAR} className={INPUT} />
                  </Field>
                  <Field label="Team Size" optional>
                    <input type="number" value={form.employees} onChange={set("employees")}
                      placeholder="1" min={1} max={100000} className={INPUT} />
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Email" optional>
                  <EmailField value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} className={INPUT} />
                </Field>
                <Field label="Website" optional>
                  <WebsiteField value={form.website} onChange={(v) => setForm((f) => ({ ...f, website: v }))} className={INPUT} />
                </Field>
                <Field label="Phone" optional>
                  <PhoneField value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} className={INPUT} />
                </Field>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium text-center bg-red-50 rounded-xl py-3 px-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 rounded-2xl bg-slate-800 text-white font-black text-lg tracking-tight hover:bg-slate-700 transition-colors disabled:opacity-50 mt-2"
              >
                {submitting ? "Submitting…" : "Submit Listing"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
