import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";

const EVENT_TYPES = [
  "Networking",
  "Workshop",
  "Pitch Night",
  "Conference",
  "Webinar",
  "Other",
];

const TYPE_COLOURS = {
  Networking: "bg-blue-100 text-blue-700",
  Workshop: "bg-violet-100 text-violet-700",
  "Pitch Night": "bg-amber-100 text-amber-700",
  Conference: "bg-emerald-100 text-emerald-700",
  Webinar: "bg-cyan-100 text-cyan-700",
  Other: "bg-slate-100 text-slate-500",
};

const INPUT =
  "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300";
const LABEL = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  location: "",
  type: "",
  organizer: "",
  rsvpUrl: "",
};
const CURRENT_YEAR = new Date().getFullYear();

function DateBlock({ iso }) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-AU", { day: "numeric" });
  const month = d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase();
  return (
    <div className="w-14 h-14 rounded-xl bg-slate-800 text-white shrink-0 flex flex-col items-center justify-center select-none">
      <span className="text-xl font-black leading-none">{day}</span>
      <span className="text-xs font-semibold tracking-wide">{month}</span>
    </div>
  );
}

function EventCard({ event }) {
  const typeColour = TYPE_COLOURS[event.type] ?? TYPE_COLOURS.Other;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start w-full">
      <DateBlock iso={event.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-base">
            {event.title}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColour}`}
          >
            {event.type}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2">
          {event.description}
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          <span className="text-xs text-slate-400">{event.location}</span>
          <span className="text-xs text-slate-400">by {event.organizer}</span>
          {event.rsvpUrl && (
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs font-medium px-3 py-1 rounded-lg bg-amber-400 text-stone-900 hover:bg-amber-300 transition-colors"
            >
              RSVP
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonEventCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start animate-pulse w-full">
      <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 rounded" />
        <div className="flex gap-4">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

function AddEventForm({ onAdded }) {
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
    const res = await fetch("/api/events", {
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
        {open ? "Cancel" : "+ Add Event"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            key="event-form"
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
                  placeholder="Event title"
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
                  placeholder="What's happening? (20–500 characters)"
                  rows={2}
                  className={`${INPUT} resize-none`}
                />
                <span className="text-xs text-slate-400 text-right">
                  {form.description.length}/500
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  min={`${CURRENT_YEAR}-01-01`}
                  className={INPUT}
                />
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
                  {EVENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>Location</label>
                <input
                  required
                  minLength={3}
                  maxLength={120}
                  value={form.location}
                  onChange={set("location")}
                  placeholder="Sunshine Coast, QLD"
                  className={INPUT}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL}>Organiser</label>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.organizer}
                  onChange={set("organizer")}
                  placeholder="Your organisation"
                  className={INPUT}
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={LABEL}>
                  RSVP Link{" "}
                  <span className="normal-case font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  type="url"
                  value={form.rsvpUrl}
                  onChange={set("rsvpUrl")}
                  placeholder="https://eventbrite.com/…"
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
                {submitting ? "Submitting…" : "Submit Event"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const fetchEvents = () => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const visible = events.filter((e) => {
    const matchType = filterType === "All" || e.type === filterType;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              What's
              <br />
              on.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Networking nights, workshops, pitch events, and conferences across
              the Sunshine Coast. Add yours to the list.
            </p>
          </div>
        </div>

        <div className="px-8 md:px-16 py-12 max-w-2xl mx-auto flex flex-col gap-4">
          <AddEventForm onAdded={fetchEvents} />

          {/* Search + filter */}
          <div className="flex flex-col gap-2">
            <input
              type="search"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="flex flex-wrap md:flex-nowrap gap-1.5">
              {["All", ...EVENT_TYPES].map((t) => (
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
          </div>

          {loading ? (
            Array.from({ length: 3 }, (_, i) => <SkeletonEventCard key={i} />)
          ) : visible.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No events found.
            </p>
          ) : (
            visible.map((event, i) => <EventCard key={i} event={event} />)
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default Events;
