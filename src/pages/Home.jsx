import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";
import { useTilt } from "@/hooks/useTilt";

const STATS = [
  { value: 99, label: "Startups" },
  { value: 99, label: "Events" },
  { value: 99, label: "Members" },
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
      className="bg-amber-400 px-8 py-6 flex flex-col items-center justify-center min-w-[140px] shadow-lg shadow-amber-900/20"
    >
      <span className="text-5xl font-black tracking-tighter text-stone-900 leading-none tabular-nums">
        <motion.span>{rounded}</motion.span>
        <span className="text-2xl">+</span>
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
    description: "**",
    to: "/directory",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
  },
  {
    title: "Events",
    description: "**",
    to: "/events",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    title: "Resources",
    description: "**",
    to: "/resources",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
];

const FADE_MS = 600;

function Hero() {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const { reduceMotion } = useMotion();
  const [fading, setFading] = useState(false);

  // Parallax
  useEffect(() => {
    if (reduceMotion) {
      if (wrapperRef.current) wrapperRef.current.style.transform = "";
      return;
    }
    const scrollEl = wrapperRef.current?.closest(".overflow-y-auto");
    if (!scrollEl) return;

    // Smoothly catch up to the current scroll position before starting live parallax
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

  // Play/pause on motion toggle — reduced = paused at first frame
  useEffect(() => {
    if (!videoRef.current) return;
    if (reduceMotion) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [reduceMotion]);

  const handleEnded = () => {
    if (reduceMotion) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      return;
    }
    setFading(true);
    setTimeout(() => {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setFading(false);
    }, FADE_MS);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Fade-to-black overlay for loop transition */}
      <div
        className="absolute inset-0 z-10 bg-black pointer-events-none"
        style={{
          opacity: fading ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      />

      {/* Parallax background */}
      <div
        ref={wrapperRef}
        className="absolute w-full overflow-hidden will-change-transform"
        style={{ top: "-10%", height: "120%" }}
      >
        <video
          ref={videoRef}
          src="/beach.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/0 to-black/50" />

      {/* Stat blobs */}
      <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-20">
        {STATS.map((s, i) => (
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
        <span className="text-xs font-bold tracking-widest uppercase text-white/60">
          **
        </span>

        <div className="flex flex-col gap-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none">
            **
            <br />
            **
          </h1>
          <p className="text-lg text-white/70 max-w-lg leading-relaxed">**</p>
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

function PillarCard({ title, description, to, image, reduceMotion }) {
  const { ref, onMouseMove, onMouseLeave, cardStyle, imgStyle } =
    useTilt(reduceMotion);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={cardStyle}
      className="relative rounded-2xl overflow-hidden h-80 flex flex-col justify-end"
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
  return (
    <PageTransition>
      <div className="bg-stone-50">
        <Hero />

        {/* Mission pull quote */}
        <section className="px-8 py-20 max-w-5xl mx-auto">
          <p className="text-3xl md:text-4xl font-black text-stone-800 leading-snug tracking-tight max-w-3xl">
            **
          </p>
          <p className="text-stone-400 mt-4 text-sm">StartupSC · Est. 2026</p>
        </section>

        {/* Pillars */}
        <section className="px-8 pb-20">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-6">
              **
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pillars.map((p) => (
                <PillarCard key={p.title} {...p} reduceMotion={reduceMotion} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default Home;
