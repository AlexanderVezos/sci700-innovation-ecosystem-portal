import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";
import { useToast } from "@/context/ToastContext";
import {
  FilterCheck, FilterSection, FilterSidebarCard,
  DateRangeFilter, MobileFilterButton,
} from "@/components/FilterShared";
import Modal from "@/components/Modal";

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  ["createdAt-desc", "Listed: newest first"],
  ["createdAt-asc",  "Listed: oldest first"],
  ["title-asc",      "Title: A–Z"],
  ["title-desc",     "Title: Z–A"],
  ["date-asc",       "Event date: soonest"],
  ["date-desc",      "Event date: latest"],
];

const EVENT_TYPES = ["Networking", "Workshop", "Pitch Night", "Conference", "Webinar", "Other"];

const TYPE_COLOURS = {
  Networking:    "bg-blue-100 text-blue-700",
  Workshop:      "bg-violet-100 text-violet-700",
  "Pitch Night": "bg-amber-100 text-amber-700",
  Conference:    "bg-emerald-100 text-emerald-700",
  Webinar:       "bg-cyan-100 text-cyan-700",
  Other:         "bg-slate-100 text-slate-500",
};

const TYPE_DOT = {
  Networking:    "bg-blue-400",
  Workshop:      "bg-violet-400",
  "Pitch Night": "bg-amber-400",
  Conference:    "bg-emerald-400",
  Webinar:       "bg-cyan-400",
  Other:         "bg-slate-400",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const INPUT = "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300";
const LABEL = "text-xs font-semibold text-slate-500 uppercase tracking-wide";
const OPT = <span className="normal-case font-normal text-slate-400">(optional)</span>;
const EMPTY_FORM = { title: "", description: "", date: "", location: "", type: "", organizer: "", rsvpUrl: "" };

function Field({ label, optional, className, children }) {
  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      <label className={LABEL}>{label} {optional && OPT}</label>
      {children}
    </div>
  );
}
const CURRENT_YEAR = new Date().getFullYear();
const EMPTY_FILTERS = { types: new Set(), dateFrom: "", dateTo: "" };
const POLL_INTERVAL = 3000;

const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 20 : -20, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir >= 0 ? -20 : 20, opacity: 0 }),
};
const slideTransition = { duration: 0.16, ease: [0.25, 0, 0.35, 1] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseEventDate(iso) {
  const [y, m, d] = (iso ?? "").split("T")[0].split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function buildCalendarCells(year, month) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

// ─── DateBlock ────────────────────────────────────────────────────────────────

function DateBlock({ iso }) {
  const d = new Date(iso);
  return (
    <div className="w-14 h-14 rounded-xl bg-slate-800 text-white shrink-0 flex flex-col items-center justify-center select-none">
      <span className="text-xl font-black leading-none">{d.toLocaleDateString("en-AU", { day: "numeric" })}</span>
      <span className="text-xs font-semibold tracking-wide">{d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase()}</span>
    </div>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({ event }) {
  const typeColour = TYPE_COLOURS[event.type] ?? TYPE_COLOURS.Other;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start w-full">
      <DateBlock iso={event.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-base">{event.title}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColour}`}>{event.type}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-snug line-clamp-2 whitespace-pre-line">{event.description}</p>
        <div className="flex gap-4 mt-2 flex-wrap">
          <span className="text-xs text-slate-400">{event.location}</span>
          <span className="text-xs text-slate-400">by {event.organizer}</span>
          {event.rsvpUrl && (
            <a href={event.rsvpUrl} target="_blank" rel="noreferrer"
              className="ml-auto text-xs font-medium px-3 py-1 rounded-lg bg-amber-400 text-stone-900 hover:bg-amber-300 transition-colors">
              RSVP
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SkeletonEventCard ────────────────────────────────────────────────────────

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

// ─── CalendarView ─────────────────────────────────────────────────────────────

function CalendarView({ events, reduceMotion }) {
  const today      = new Date();
  const todayYear  = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay   = today.getDate();

  const [year, setYear]           = useState(todayYear);
  const [month, setMonth]         = useState(todayMonth);
  const [direction, setDirection] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);

  const calKey          = year * 12 + month;
  const isCurrentMonth  = year === todayYear && month === todayMonth;

  const go = useCallback((delta) => {
    setDirection(delta);
    setSelectedDay(null);
    setMonth((m) => {
      const next = m + delta;
      if (next < 0)  { setYear((y) => y - 1); return 11; }
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

  const cells         = buildCalendarCells(year, month);
  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
        <button onClick={() => go(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-lg font-bold select-none">
          ‹
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="font-black text-slate-800 text-base tracking-tight">{MONTH_NAMES[month]} {year}</span>
          {monthEventCount > 0 && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {monthEventCount} event{monthEventCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {!isCurrentMonth && (
          <button onClick={goToday}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
            Today
          </button>
        )}
        <button onClick={() => go(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors text-lg font-bold select-none">
          ›
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100 px-3 pt-3">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 pb-2">{d}</div>
          ))}
        </div>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={calKey}
            custom={direction}
            variants={reduceMotion ? {} : slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={slideTransition}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.08}
            onDragEnd={(_, info) => { if (info.offset.x < -40) go(1); else if (info.offset.x > 40) go(-1); }}
            className="grid grid-cols-7 gap-1 p-3 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
          >
            {cells.map((day, i) => {
              const dayEvents  = day ? eventsOnDay(day) : [];
              const isToday    = day && year === todayYear && month === todayMonth && day === todayDay;
              const isSelected = day === selectedDay;
              return (
                <motion.button key={i} whileTap={day ? { scale: 0.92 } : {}}
                  onClick={(e) => { e.stopPropagation(); if (day) setSelectedDay(day === selectedDay ? null : day); }}
                  disabled={!day}
                  className={[
                    "relative flex flex-col items-center rounded-xl py-1.5 text-sm font-semibold transition-colors min-h-12 select-none",
                    !day ? "invisible pointer-events-none" : "",
                    isSelected ? "bg-slate-800 text-white shadow-md"
                      : isToday ? "bg-amber-50 text-amber-600 ring-1 ring-amber-300"
                      : dayEvents.length > 0 ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      : "text-slate-400 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <span key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : (TYPE_DOT[e.type] ?? TYPE_DOT.Other)}`} />
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

      <p className="text-xs text-slate-400 text-center -mt-2">Swipe left or right to navigate months</p>

      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div key={`${year}-${month}-${selectedDay}`}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm font-semibold text-slate-500">
              {selectedEvents.length === 0
                ? `No events on ${selectedDay} ${MONTH_NAMES[month]}`
                : `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${selectedDay} ${MONTH_NAMES[month]}`}
            </p>
            {selectedEvents.map((event, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: reduceMotion ? 0 : 0.2 }}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ViewToggle ───────────────────────────────────────────────────────────────

function ViewToggle({ view, setView }) {
  return (
    <div className="relative flex rounded-xl bg-slate-100 p-1 shrink-0 gap-0.5">
      {[{ id: "list", label: "List" }, { id: "calendar", label: "Calendar" }].map(({ id, label }) => (
        <button key={id} onClick={() => setView(id)}
          className="relative px-3.5 py-1.5 text-sm font-semibold rounded-lg z-10 transition-colors"
          style={{ color: view === id ? "#1e293b" : "#94a3b8" }}>
          {view === id && (
            <motion.div layoutId="view-pill" className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          )}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── AddEventForm ─────────────────────────────────────────────────────────────

function AddEventForm({ open, onClose, onAdded }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toast }        = useToast();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/events", {
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
      toast.error("Failed to submit event", body.error ?? `Server error ${res.status}`);
    }
    setSubmitting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add your event">
      <form onSubmit={handleSubmit}>
        <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" className="sm:col-span-2">
            <input required minLength={4} maxLength={120} value={form.title} onChange={set("title")} placeholder="Your event name" className={INPUT} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea required minLength={20} maxLength={500} value={form.description} onChange={set("description")}
              placeholder="Describe your event. (20–500 characters)" rows={2} className={`${INPUT} resize-none`} />
            <span className="text-xs text-slate-400 text-right">{form.description.length}/500</span>
          </Field>
          <Field label="Date">
            <input required type="date" value={form.date} onChange={set("date")} min={`${CURRENT_YEAR}-01-01`} className={INPUT} />
          </Field>
          <Field label="Type">
            <select required value={form.type} onChange={set("type")} className={INPUT}>
              <option value="">Select…</option>
              {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input required minLength={3} maxLength={120} value={form.location} onChange={set("location")} placeholder="Sunshine Coast, QLD" className={INPUT} />
          </Field>
          <Field label="Organiser">
            <input required minLength={2} maxLength={100} value={form.organizer} onChange={set("organizer")} placeholder="Your organisation" className={INPUT} />
          </Field>
          <Field label="RSVP Link" optional className="sm:col-span-2">
            <input type="url" value={form.rsvpUrl} onChange={set("rsvpUrl")} placeholder="https://example.com/rsvp"
              pattern="https?://.+" title="Must start with http:// or https://" className={INPUT} />
          </Field>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-100 mt-6 px-6 py-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
            {submitting ? "Submitting…" : "Submit Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── FilterPanel ─────────────────────────────────────────────────────────

function FilterPanel({ filters, setFilters, toggle, clearAll, events }) {
  const typeCount  = (type) => events.filter((e) => e.type === type).length;
  const dateActive = filters.dateFrom !== "" || filters.dateTo !== "";
  const totalActive = filters.types.size + (dateActive ? 1 : 0);
  return (
    <FilterSidebarCard totalActive={totalActive} onClearAll={clearAll}>
      <FilterSection title="Type" activeCount={filters.types.size}>
        {EVENT_TYPES.map((type) => (
          <FilterCheck key={type} checked={filters.types.has(type)} onChange={() => toggle("types", type)}
            label={type} dot={TYPE_DOT[type]} count={typeCount(type)} />
        ))}
      </FilterSection>
      <FilterSection title="Date" activeCount={dateActive ? 1 : 0}>
        <DateRangeFilter from={filters.dateFrom} to={filters.dateTo}
          onFromChange={(v) => setFilters((f) => ({ ...f, dateFrom: v }))}
          onToChange={(v) => setFilters((f) => ({ ...f, dateTo: v }))} />
      </FilterSection>
    </FilterSidebarCard>
  );
}

// ─── EventsPanel ──────────────────────────────────────────────────────────────

export default function EventsPanel() {
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filters, setFilters]             = useState(EMPTY_FILTERS);
  const [sort, setSort]                   = useState("createdAt-desc");
  const [view, setView]                   = useState("list");
  const [newIds, setNewIds]               = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [formOpen, setFormOpen]           = useState(false);
  const seenIds    = useRef(null);
  const newIdTimer = useRef(null);
  const { reduceMotion } = useMotion();
  const { toast }        = useToast();

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
      })
      .catch(() => toast.error("Could not load events", "Check your connection", "poll-events"));
  }, [toast]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, POLL_INTERVAL);
    return () => { clearInterval(interval); clearTimeout(newIdTimer.current); };
  }, [fetchEvents]);

  const toggle = useCallback((group, value) => {
    setFilters((prev) => {
      const next = new Set(prev[group]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [group]: next };
    });
  }, []);

  const clearAll = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const dateActive  = filters.dateFrom !== "" || filters.dateTo !== "";
  const totalActive = filters.types.size + (dateActive ? 1 : 0);

  const visible = events
    .filter((e) => {
      if (filters.types.size > 0 && !filters.types.has(e.type)) return false;
      if (filters.dateFrom && (e.date ?? "").split("T")[0] < filters.dateFrom) return false;
      if (filters.dateTo   && (e.date ?? "").split("T")[0] > filters.dateTo)   return false;
      const q = search.toLowerCase();
      if (q && !e.title.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q) && !e.organizer.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => {
      const [field, dir] = sort.split("-");
      const mul = dir === "asc" ? 1 : -1;
      if (field === "title")     return mul * a.title.localeCompare(b.title);
      if (field === "date")      return mul * (new Date(a.date) - new Date(b.date));
      if (field === "createdAt") return mul * (new Date(a.createdAt) - new Date(b.createdAt));
      return 0;
    });

  const filterPanelProps = { filters, setFilters, toggle, clearAll, events };

  return (
    <>
      <div className="h-2" />
      {/* Sticky bar — z-51 covers navbar shadow when docked */}
      <div className="sticky top-14 lg:top-[72px] z-51 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-3 flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex items-center gap-2 md:shrink-0">
            <button onClick={() => setFormOpen(true)}
              className="flex-1 md:flex-none text-sm font-semibold px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">
              + Add Event
            </button>
            <div className="flex-1 md:hidden">
              <MobileFilterButton onClick={() => setMobileFiltersOpen((o) => !o)} totalActive={totalActive} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ViewToggle view={view} setView={setView} />
            <input type="search" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300" />
            {view === "list" && (
              <>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="shrink-0 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                  {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap tabular-nums">
                  {visible.length} {visible.length === 1 ? "result" : "results"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 md:px-16 py-8 max-w-5xl mx-auto flex flex-col gap-4">
        <AddEventForm open={formOpen} onClose={() => setFormOpen(false)} onAdded={fetchEvents} />

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <div className="hidden md:block w-52 shrink-0 sticky top-32 lg:top-[136px]">
            <FilterPanel {...filterPanelProps} />
          </div>

          {/* Mobile filter sheet */}
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

          {/* Main column */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {loading ? (
              Array.from({ length: 3 }, (_, i) => <SkeletonEventCard key={i} />)
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={view}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
                  {view === "calendar" ? (
                    <CalendarView events={visible} reduceMotion={reduceMotion} />
                  ) : visible.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No events found.</p>
                  ) : (
                    <AnimatePresence>
                      {visible.map((event) => {
                        const isNew = newIds.has(event._id);
                        return (
                          <motion.div key={event._id} layout
                            initial={!reduceMotion ? { opacity: 0, y: 8 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            exit={!reduceMotion ? { opacity: 0, y: -4 } : undefined}
                            transition={{ layout: { duration: 0.2, ease: "easeOut" }, default: { duration: 0.15, ease: "easeOut" } }}
                            className="relative">
                            {isNew && !reduceMotion && (
                              <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                                style={{ boxShadow: "0 0 0 2px #fbbf24, 0 0 24px 4px #fbbf2440" }}
                                initial={{ opacity: 1 }} animate={{ opacity: 0 }}
                                transition={{ duration: 2.5, delay: 0.4, ease: "easeOut" }} />
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
      </div>
    </>
  );
}
