import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";

const EVENT_SORT_OPTIONS = [
  ["createdAt-desc", "Listed: newest first"],
  ["createdAt-asc", "Listed: oldest first"],
  ["title-asc", "Title: A–Z"],
  ["title-desc", "Title: Z–A"],
  ["date-asc", "Event date: soonest"],
  ["date-desc", "Event date: latest"],
];

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

const TYPE_DOT = {
  Networking: "bg-blue-400",
  Workshop: "bg-violet-400",
  "Pitch Night": "bg-amber-400",
  Conference: "bg-emerald-400",
  Webinar: "bg-cyan-400",
  Other: "bg-slate-400",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

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

const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 20 : -20, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? -20 : 20, opacity: 0 }),
};
const slideTransition = { duration: 0.16, ease: [0.25, 0, 0.35, 1] };

function parseEventDate(iso) {
  const s = (iso ?? "").split("T")[0];
  const [y, m, d] = s.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function buildCalendarCells(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const offset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

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
          <span className="font-semibold text-slate-800 text-base">{event.title}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColour}`}>
            {event.type}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2 whitespace-pre-line">
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

function CalendarView({ events, reduceMotion }) {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);
  const [direction, setDirection] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);

  const calKey = year * 12 + month;
  const isCurrentMonth = year === todayYear && month === todayMonth;

  const go = useCallback((delta) => {
    setDirection(delta);
    setSelectedDay(null);
    setMonth((m) => {
      const next = m + delta;
      if (next < 0) { setYear((y) => y - 1); return 11; }
      if (next > 11) { setYear((y) => y + 1); return 0; }
      return next;
    });
  }, []);

  const goToday = useCallback(() => {
    setDirection(calKey < todayYear * 12 + todayMonth ? 1 : -1);
    setSelectedDay(null);
    setYear(todayYear);
    setMonth(todayMonth);
  }, [calKey, todayYear, todayMonth]);


  const eventsOnDay = (day) =>
    events.filter((e) => {
      const p = parseEventDate(e.date);
      return p.year === year && p.month === month && p.day === day;
    });

  const monthEventCount = events.filter((e) => {
    const p = parseEventDate(e.date);
    return p.year === year && p.month === month;
  }).length;

  const cells = buildCalendarCells(year, month);
  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Month nav bar */}
      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
        <button
          onClick={() => go(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-lg font-bold select-none"
        >
          ‹
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="font-black text-slate-800 text-base tracking-tight">
            {MONTH_NAMES[month]} {year}
          </span>
          {monthEventCount > 0 && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {monthEventCount} event{monthEventCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {!isCurrentMonth && (
          <button
            onClick={goToday}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Today
          </button>
        )}

        <button
          onClick={() => go(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-lg font-bold select-none"
        >
          ›
        </button>
      </div>

      {/* Calendar grid with slide animation + swipe */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100 px-3 pt-3">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 pb-2">
              {d}
            </div>
          ))}
        </div>

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={calKey}
            custom={direction}
            variants={reduceMotion ? {} : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) go(1);
              else if (info.offset.x > 40) go(-1);
            }}
            className="grid grid-cols-7 gap-1 p-3 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
          >
            {cells.map((day, i) => {
              const dayEvents = day ? eventsOnDay(day) : [];
              const isToday = day && year === todayYear && month === todayMonth && day === todayDay;
              const isSelected = day === selectedDay;

              return (
                <motion.button
                  key={i}
                  whileTap={day ? { scale: 0.92 } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (day) setSelectedDay(day === selectedDay ? null : day);
                  }}
                  disabled={!day}
                  className={[
                    "relative flex flex-col items-center rounded-xl py-1.5 text-sm font-semibold transition-colors min-h-12 select-none",
                    !day ? "invisible pointer-events-none" : "",
                    isSelected
                      ? "bg-slate-800 text-white shadow-md"
                      : isToday
                      ? "bg-amber-50 text-amber-600 ring-1 ring-amber-300"
                      : dayEvents.length > 0
                      ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      : "text-slate-400 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <span
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-white/70" : (TYPE_DOT[e.type] ?? TYPE_DOT.Other)
                          }`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className={`text-[9px] font-bold leading-none ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-400 text-center -mt-2">
        Swipe left or right to navigate months
      </p>

      {/* Selected day events */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={`${year}-${month}-${selectedDay}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm font-semibold text-slate-500">
              {selectedEvents.length === 0
                ? `No events on ${selectedDay} ${MONTH_NAMES[month]}`
                : `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${selectedDay} ${MONTH_NAMES[month]}`}
            </p>
            {selectedEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: reduceMotion ? 0 : 0.2 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
            onSubmit={handleSubmit}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-4 flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={LABEL}>Title</label>
                <input required minLength={4} maxLength={120} value={form.title} onChange={set("title")} placeholder="Event title" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={LABEL}>Description</label>
                <textarea required minLength={20} maxLength={500} value={form.description} onChange={set("description")} placeholder="What's happening? (20–500 characters)" rows={2} className={`${INPUT} resize-none`} />
                <span className="text-xs text-slate-400 text-right">{form.description.length}/500</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Date</label>
                <input required type="date" value={form.date} onChange={set("date")} min={`${CURRENT_YEAR}-01-01`} className={INPUT} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Type</label>
                <select required value={form.type} onChange={set("type")} className={INPUT}>
                  <option value="">Select…</option>
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Location</label>
                <input required minLength={3} maxLength={120} value={form.location} onChange={set("location")} placeholder="Sunshine Coast, QLD" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>Organiser</label>
                <input required minLength={2} maxLength={100} value={form.organizer} onChange={set("organizer")} placeholder="Your organisation" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={LABEL}>RSVP Link <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                <input type="url" value={form.rsvpUrl} onChange={set("rsvpUrl")} placeholder="https://eventbrite.com/…" pattern="https?://.+" title="Must start with http:// or https://" className={INPUT} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={submitting} className="bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit Event"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewToggle({ view, setView }) {
  return (
    <div className="relative flex rounded-xl bg-slate-100 p-1 shrink-0 gap-0.5">
      {[
        { id: "list", label: "List" },
        { id: "calendar", label: "Calendar" },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className="relative px-3.5 py-1.5 text-sm font-semibold rounded-lg z-10 transition-colors"
          style={{ color: view === id ? "#1e293b" : "#94a3b8" }}
        >
          {view === id && (
            <motion.div
              layoutId="view-pill"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}

const POLL_INTERVAL = 3000;

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sort, setSort] = useState("createdAt-desc");
  const [view, setView] = useState("list");
  const [newIds, setNewIds] = useState(new Set());
  const seenIds = useRef(null);
  const newIdTimer = useRef(null);
  const { reduceMotion } = useMotion();

  const fetchEvents = useCallback(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (seenIds.current !== null) {
          const brandNew = data.filter((e) => !seenIds.current.has(e._id)).map((e) => e._id);
          if (brandNew.length > 0) {
            clearTimeout(newIdTimer.current);
            setNewIds(new Set(brandNew));
            newIdTimer.current = setTimeout(() => setNewIds(new Set()), 3000);
          }
        }
        seenIds.current = new Set(data.map((e) => e._id));
        setEvents(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, POLL_INTERVAL);
    return () => { clearInterval(interval); clearTimeout(newIdTimer.current); };
  }, [fetchEvents]);

  const visible = events
    .filter((e) => {
      const matchType = filterType === "All" || e.type === filterType;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q);
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      const [field, dir] = sort.split("-");
      const mul = dir === "asc" ? 1 : -1;
      if (field === "title") return mul * a.title.localeCompare(b.title);
      if (field === "date") return mul * (new Date(a.date) - new Date(b.date));
      if (field === "createdAt") return mul * (new Date(a.createdAt) - new Date(b.createdAt));
      return 0;
    });

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              What's<br />on.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Networking nights, workshops, pitch events, and conferences across
              the Sunshine Coast. Add yours to the list.
            </p>
          </div>
        </div>

        <div className="px-8 md:px-16 py-12 max-w-2xl mx-auto flex flex-col gap-4">
          <AddEventForm onAdded={fetchEvents} />

          {/* Search + view toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="search"
                placeholder="Search events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <ViewToggle view={view} setView={setView} />
            </div>

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
            {view === "list" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {EVENT_SORT_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Content area with crossfade between views */}
          {loading ? (
            Array.from({ length: 3 }, (_, i) => <SkeletonEventCard key={i} />)
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                {view === "calendar" ? (
                  <CalendarView events={visible} reduceMotion={reduceMotion} />
                ) : visible.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No events found.</p>
                ) : (
                  <AnimatePresence>
                    {visible.map((event) => {
                      const isNew = newIds.has(event._id);
                      return (
                        <motion.div
                          key={event._id}
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
                          <EventCard event={event} />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default Events;
