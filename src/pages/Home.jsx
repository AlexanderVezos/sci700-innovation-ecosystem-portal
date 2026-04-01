import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import PageTransition from "@/components/PageTransition";
import { useMotion } from "@/context/MotionContext";

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
    const onScroll = () => {
      wrapperRef.current.style.transform = `translateY(${scrollEl.scrollTop * 0.4}px)`;
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
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
                <Link
                  key={p.title}
                  to={p.to}
                  className="relative rounded-2xl overflow-hidden h-80 flex flex-col justify-end group"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className={`absolute inset-0 w-full h-full object-cover ${reduceMotion ? "" : "group-hover:scale-105 transition-transform duration-500"}`}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="relative p-6 text-white">
                    <h3 className="text-2xl font-black tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-sm text-white/70 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default Home;
