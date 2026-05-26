import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function blurb(body, max = 180) {
  if (!body) return "";
  const flat = body.replace(/\n+/g, " ");
  return flat.length > max ? flat.slice(0, max).trimEnd() + "…" : flat;
}

const CYCLING_PHRASES = [
  "Your Idea",
  "Your Next Partner",
  "Your Next Investor",
  "Your Next Hire",
  "Your Next Opportunity",
  "Your Next Move",
  "The Sunshine Coast",
];
const TYPE_SPEED = 75;
const DELETE_SPEED = 38;
const PAUSE_AFTER = 900;
const PAUSE_BEFORE = 150;

function commonPrefixLen(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function CyclingType({ reduceMotion }) {
  const final = CYCLING_PHRASES.at(-1);
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);

  // When motion is off, bypass typewriter state entirely rather than syncing it in an effect.
  const displayText = reduceMotion ? final : text;
  const showCursor = !reduceMotion && !done;

  useEffect(() => {
    if (done || reduceMotion) return;
    const current = CYCLING_PHRASES[idx];
    const isLast = idx === CYCLING_PHRASES.length - 1;

    if (!deleting) {
      if (text === current) {
        if (isLast) {
          const tid = setTimeout(() => setDone(true), 0);
          return () => clearTimeout(tid);
        }
        const tid = setTimeout(() => setDeleting(true), PAUSE_AFTER);
        return () => clearTimeout(tid);
      }
      const tid = setTimeout(
        () => setText(current.slice(0, text.length + 1)),
        TYPE_SPEED,
      );
      return () => clearTimeout(tid);
    }

    const next = CYCLING_PHRASES[idx + 1];
    // Only delete back to the shared prefix so characters common to both phrases
    // are never re-typed.
    const keepLen = commonPrefixLen(current, next);
    if (text.length <= keepLen) {
      const tid = setTimeout(() => {
        setIdx((i) => i + 1);
        setDeleting(false);
      }, PAUSE_BEFORE);
      return () => clearTimeout(tid);
    }
    const tid = setTimeout(
      () => setText((prev) => prev.slice(0, -1)),
      DELETE_SPEED,
    );
    return () => clearTimeout(tid);
  }, [text, idx, deleting, done, reduceMotion]);

  return (
    <span className="relative whitespace-nowrap">
      {displayText || " "}
      {showCursor && (
        <span
          className="animate-pulse absolute w-0.5 inset-y-0 bg-current"
          style={{ left: "calc(100% + 10px)" }}
        />
      )}
    </span>
  );
}

const DEFAULT_STATS = [
  { value: 0, label: "Startups" },
  { value: 0, label: "Events" },
  { value: 0, label: "Opportunities" },
];

// Blob border-radius keyframe sequences — one per stat so they're out of phase
const BLOB_RADII = [
  [
    "62% 38% 46% 54% / 60% 44% 56% 40%",
    "38% 62% 54% 46% / 44% 60% 40% 56%",
    "62% 38% 46% 54% / 60% 44% 56% 40%",
  ],
  [
    "44% 56% 60% 40% / 54% 38% 62% 46%",
    "56% 44% 40% 60% / 38% 54% 46% 62%",
    "44% 56% 60% 40% / 54% 38% 62% 46%",
  ],
  [
    "55% 45% 35% 65% / 40% 65% 35% 60%",
    "45% 55% 65% 35% / 65% 40% 60% 35%",
    "55% 45% 35% 65% / 40% 65% 35% 60%",
  ],
];

function StatBlob({ value, label, index, animate: shouldAnimate }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: shouldAnimate ? 2.2 : 0,
      ease: [0.16, 1, 0.3, 1],
      delay: shouldAnimate ? index * 0.15 : 0,
    });
    return controls.stop; // framer-motion animate() cleanup — stops the tween on unmount
  }, [count, value, index, shouldAnimate]);

  return (
    <motion.div
      animate={
        shouldAnimate
          ? { borderRadius: BLOB_RADII[index] }
          : { borderRadius: BLOB_RADII[index][0] }
      }
      transition={
        shouldAnimate
          ? { duration: 7 + index * 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5, ease: "easeOut" }
      }
      style={{ borderRadius: BLOB_RADII[index][0] }}
      className="bg-amber-400 px-8 py-6 flex flex-col items-center justify-center min-w-35 shadow-lg shadow-amber-900/20"
    >
      <span className="text-5xl font-black tracking-tighter text-stone-900 leading-none tabular-nums">
        <motion.span>{rounded}</motion.span>
      </span>
      <span className="text-[11px] font-bold tracking-widest uppercase text-stone-700 mt-2">
        {label}
      </span>
    </motion.div>
  );
}

const pillars = [
  {
    title: "Directory",
    description:
      "Find startups, investors, research institutions, and industry partners across the region.",
    to: "/directory",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    cols: "md:col-span-2",
  },
  {
    title: "Events",
    description:
      "Networking nights, workshops, pitch events, and conferences near you.",
    to: "/events",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    cols: "md:col-span-2",
  },
  {
    title: "Opportunities",
    description:
      "Pilots, co-development calls, and open innovation challenges from organisations across the region.",
    to: "/opportunities",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    cols: "md:col-span-2",
  },
  {
    title: "Ecosystem Map",
    description:
      "See who's building what and where, across the Sunshine Coast.",
    to: "/map",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    cols: "md:col-span-3",
  },
  {
    title: "Resources",
    description:
      "Practical tools and guides for funding, legal, hiring, and growing your venture.",
    to: "/resources",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    cols: "md:col-span-3",
  },
];

function Hero({ stats }) {
  const wrapperRef = useRef(null);
  const vidA = useRef(null);
  const vidB = useRef(null);
  const activeRef = useRef(0);
  const { reduceMotion } = useMotion();
  const [activeVid, setActiveVid] = useState(0);

  // Parallax
  useEffect(() => {
    if (reduceMotion) {
      if (wrapperRef.current) wrapperRef.current.style.transform = "";
      return;
    }
    const scrollEl = wrapperRef.current?.closest(".overflow-y-auto");
    if (!scrollEl) return;

    const target = scrollEl.scrollTop * 0.4;
    wrapperRef.current.style.transition = "transform 500ms ease";
    wrapperRef.current.style.transform = `translateY(${target}px)`;
    const tid = setTimeout(() => {
      if (wrapperRef.current) wrapperRef.current.style.transition = "";
    }, 500);

    const onScroll = () => {
      wrapperRef.current.style.transform = `translateY(${scrollEl.scrollTop * 0.4}px)`;
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(tid);
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [reduceMotion]);

  // Play/pause on motion toggle
  useEffect(() => {
    const active = activeRef.current === 0 ? vidA.current : vidB.current;
    if (!active) return;
    if (reduceMotion) {
      active.pause();
      active.currentTime = 0;
    } else {
      active.play().catch(() => {});
    }
  }, [reduceMotion]);

  const handleEnded = useCallback(() => {
    const next = 1 - activeRef.current;
    const nextVid = next === 0 ? vidA.current : vidB.current;
    if (nextVid) {
      nextVid.currentTime = 0;
      nextVid.play().catch(() => {});
    }
    activeRef.current = next;
    setActiveVid(next);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Parallax background */}
      <div
        ref={wrapperRef}
        className="absolute w-full overflow-hidden will-change-transform"
        style={{ top: "-10%", height: "120%" }}
      >
        <video
          ref={vidA}
          src="https://res.cloudinary.com/dyruruxaz/video/upload/v1779083640/beach_nogfoq.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: activeVid === 0 ? 1 : 0,
            transition: reduceMotion ? "none" : "opacity 800ms ease",
          }}
        />
        <video
          ref={vidB}
          src="https://res.cloudinary.com/dyruruxaz/video/upload/v1779083640/beach_nogfoq.mp4"
          muted
          playsInline
          onEnded={handleEnded}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: activeVid === 1 ? 1 : 0,
            transition: reduceMotion ? "none" : "opacity 800ms ease",
          }}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/0 to-black/50" />

      {/* Stat blobs — desktop only, hidden below lg to avoid overlap with hero text */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-20">
        {stats.map((s, i) => (
          <StatBlob
            key={s.label}
            value={s.value}
            label={s.label}
            index={i}
            animate={!reduceMotion}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between px-8 md:px-16 pt-24 pb-12 max-w-6xl mx-auto w-full">
        <span className="text-xs font-bold tracking-widest uppercase text-white/60" />

        <div className="flex flex-col gap-6">
          <h1 className="text-[7.5vw] sm:text-5xl lg:text-8xl font-black tracking-tighter text-white leading-none">
            <CyclingType reduceMotion={reduceMotion} />
            <br />
            Starts Here.
          </h1>
          <p className="text-lg text-white/70 max-w-lg leading-relaxed">
            StartupSC connects the people and organisations building the
            Sunshine Coast's innovation future. Find partners, discover
            opportunities, and get things done.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/directory"
              className="bg-white text-stone-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors"
            >
              Explore the Directory
            </Link>
            <Link
              to="/resources"
              className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            >
              Find Resources
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="flex items-center gap-2 text-white/40 text-xs font-semibold tracking-widest uppercase mt-4">
            <div className="w-px h-8 bg-white/30" />
            Scroll to explore
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  title,
  description,
  to,
  image,
  cols,
  index,
  reduceMotion,
}) {
  const { ref, onMouseMove, onMouseLeave, cardStyle, imgStyle } =
    useTilt(reduceMotion);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={reduceMotion ? { opacity: 1, y: 0 } : undefined}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -120px 0px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay: reduceMotion ? 0 : index * 0.07,
      }}
      style={cardStyle}
      className={`relative rounded-2xl overflow-hidden h-80 flex flex-col justify-end ${cols ?? ""}`}
    >
      <Link to={to} className="absolute inset-0 z-20" aria-label={title} />
      <motion.img
        src={image}
        alt={title}
        style={imgStyle}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="relative z-10 p-6 text-white">
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        <p className="text-sm text-white/70 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function StoryFeature({ story, index, reduceMotion }) {
  const reversed = index % 2 === 1;

  return (
    <motion.div
      className={`group relative flex flex-col md:flex-row items-center gap-10 md:gap-20 cursor-pointer ${reversed ? "md:flex-row-reverse" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, x: reversed ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/stories/${story._id}`}
        className="absolute inset-0 z-10"
        aria-label={story.title}
      />
      <div className="w-full md:w-[42%] shrink-0 rounded-[2.5rem] overflow-hidden aspect-3/4 bg-slate-800">
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-700 to-slate-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
            {fmtDate(story.publishedAt)}
          </span>
          <h2
            className="font-black tracking-tighter text-white leading-tight transition-colors duration-200 group-hover:text-amber-400"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
          >
            {story.title}
          </h2>
          <p className="text-slate-400 leading-relaxed text-base max-w-sm">
            {blurb(story.body)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StoriesSection({ reduceMotion }) {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return setStories([]);
        const featured = data.filter((s) => s.featured);
        const rest = data.filter((s) => !s.featured);
        setStories([...featured, ...rest].slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (stories.length === 0) return null;

  return (
    <section className="bg-slate-950 px-8 md:px-16 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex items-end justify-between mb-16"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">
              From the coast
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
              What's happening
              <br />
              on the coast.
            </h2>
          </div>
          <Link
            to="/stories"
            className="hidden md:inline-flex text-sm font-bold text-slate-400 hover:text-white transition-colors shrink-0 ml-8"
          >
            All stories →
          </Link>
        </motion.div>

        <div className="flex flex-col gap-24">
          {stories.map((s, i) => (
            <StoryFeature
              key={s._id}
              story={s}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        <div className="mt-16 md:hidden">
          <Link
            to="/stories"
            className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            All stories →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { reduceMotion } = useMotion();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    const fetchStats = () => {
      Promise.all([
        fetch("/api/startups").then((r) => r.json()),
        fetch("/api/events").then((r) => r.json()),
        fetch("/api/opportunities").then((r) => r.json()),
      ])
        .then(([startups, events, opportunities]) => {
          setStats([
            { value: startups.length, label: "Startups" },
            { value: events.length, label: "Events" },
            { value: opportunities.length, label: "Opportunities" },
          ]);
        })
        .catch(() => {});
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
      <div className="bg-stone-50">
        <Hero stats={stats} />

        {/* Pillars */}
        <section className="px-8 pt-20 pb-20">
          <div className="max-w-5xl mx-auto">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? { opacity: 1, y: 0 } : undefined}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
              className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-6"
            >
              Explore the platform
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {pillars.map((p, i) => (
                <PillarCard
                  key={p.title}
                  {...p}
                  index={i}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>
        </section>

        <StoriesSection reduceMotion={reduceMotion} />
      </div>
    </PageTransition>
  );
}

export default Home;
