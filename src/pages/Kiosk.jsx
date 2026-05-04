import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TAGS, STAGES, isValidPhone, isValidEmail, isValidWebsite } from "@/lib/startupConstants";
import { PhoneField, EmailField, WebsiteField } from "@/components/PhoneField";

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY = { name:"", tag:"", description:"", year:"", employees:"", stage:"", email:"", website:"", phone:"" };

// ─── Field wrapper ────────────────────────────────────────────────────────────

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

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, onReset }) {
  const [countdown, setCountdown] = useState(5);

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
        <span className="font-semibold text-slate-700">{name}</span> has been submitted.
      </p>
      <p className="text-slate-400 text-sm mt-6">{countdown}s</p>
    </motion.div>
  );
}

// ─── Kiosk form ───────────────────────────────────────────────────────────────

export default function Kiosk() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValidPhone(form.phone)) {
      setError("Phone number is incomplete — enter a full Australian number or leave it blank.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Email address looks wrong — check it and try again.");
      return;
    }
    if (!isValidWebsite(form.website)) {
      setError("Website must be a full URL — try leaving the field to auto-add https://");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year), employees: Number(form.employees) }),
      });
      if (res.ok) {
        setSubmitted(form.name);
        setForm(EMPTY);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong — please try again.");
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
      {/* Header */}
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
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">Add your startup</h1>
              <p className="text-slate-500 mt-1">Get listed on the Sunshine Coast innovation map.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Name">
                  <input required minLength={2} maxLength={100} value={form.name} onChange={set("name")}
                    placeholder="Your startup name" className={INPUT} />
                </Field>
                <Field label="Category">
                  <select required value={form.tag} onChange={set("tag")} className={INPUT}>
                    <option value="">Select…</option>
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea required minLength={20} maxLength={500} value={form.description} onChange={set("description")}
                  placeholder="Describe your startup. (20–500 characters)" rows={3} className={`${INPUT} resize-none`} />
                <span className="text-xs text-slate-400 text-right">{form.description.length}/500</span>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Founded Year">
                  <input required type="number" value={form.year} onChange={set("year")}
                    placeholder={String(CURRENT_YEAR)} min={1990} max={CURRENT_YEAR} className={INPUT} />
                </Field>
                <Field label="Team Size">
                  <input required type="number" value={form.employees} onChange={set("employees")}
                    placeholder="1" min={1} max={100000} className={INPUT} />
                </Field>
                <Field label="Stage">
                  <select required value={form.stage} onChange={set("stage")} className={INPUT}>
                    <option value="">Select…</option>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

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
                {submitting ? "Submitting…" : "Submit Startup"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
