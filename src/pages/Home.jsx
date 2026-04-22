import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

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
  const [text, setText] = useState(() => (reduceMotion ? final : ""));
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(() => reduceMotion);

  useEffect(() => {
    if (done) return;
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
  }, [text, idx, deleting, done]);

  return (
    <span className="relative whitespace-nowrap">
      {text || " "}
      {!done && (
        <span
          className="animate-pulse absolute w-[2px] inset-y-0 bg-current"
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
    return controls.stop;
  }, [count, value, index, shouldAnimate]);

  return (
    <motion.div
      animate={shouldAnimate ? { borderRadius: BLOB_RADII[index] } : {}}
      transition={{
        duration: 7 + index * 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
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
          src="/beach.mp4"
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
          src="/beach.mp4"
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

      {/* Stat blobs */}
      <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-20">
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
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none">
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -120px 0px" }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.07,
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
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative z-10 p-6 text-white">
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        <p className="text-sm text-white/70 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function Home() {
  const { reduceMotion } = useMotion();
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/api/startups").then((r) => r.json()),
      fetch("http://localhost:3001/api/events").then((r) => r.json()),
      fetch("http://localhost:3001/api/opportunities").then((r) => r.json()),
    ])
      .then(([startups, events, opportunities]) => {
        setStats([
          { value: startups.length, label: "Startups" },
          { value: events.length, label: "Events" },
          { value: opportunities.length, label: "Opportunities" },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <PageTransition>
      <div className="bg-stone-50">
        <Hero stats={stats} />

        {/* Mission pull quote */}
        <section className="px-8 py-20 max-w-5xl mx-auto">
          <p className="text-3xl md:text-4xl font-black text-stone-800 leading-snug tracking-tight max-w-3xl"></p>
          <p className="text-stone-400 mt-4 text-sm"></p>
        </section>

        {/* Pillars */}
        <section className="px-8 pb-20">
          <div className="max-w-5xl mx-auto">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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
      </div>
    </PageTransition>
  );
}

export default Home;
