import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/directory", label: "Directory" },
  { to: "/events", label: "Events" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/stories", label: "Stories" },
  { to: "/map", label: "Map" },
  { to: "/resources", label: "Resources" },
];

function Navbar() {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const { reduceMotion, toggleReduceMotion } = useMotion();

  const isHome = location.pathname === "/";
  const hasStickyBar = ["/directory", "/events", "/opportunities"].includes(location.pathname);

  useEffect(() => {
    const activeIndex = links.findIndex((l) => l.to === location.pathname);
    const activeEl = linkRefs.current[activeIndex];
    const navEl = navRef.current;
    if (activeEl && navEl) {
      const navLeft = navEl.getBoundingClientRect().left;
      const linkLeft = activeEl.getBoundingClientRect().left;
      setIndicatorStyle({
        left: linkLeft - navLeft,
        width: activeEl.offsetWidth,
      });
    } else {
      setIndicatorStyle({ width: 0 });
    }
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const scrollEl = document.querySelector(".overflow-y-auto");
    if (!scrollEl) return;
    const onScroll = () => setScrolled(scrollEl.scrollTop > 10);
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-52 flex items-center justify-between px-6 lg:px-8 py-4 transition-all duration-300 ${
        transparent ? "bg-transparent" : hasStickyBar ? "bg-white" : "bg-white shadow-sm"
      }`}
    >
      {/* Logo — always links home */}
      <Link
        to="/"
        className={`text-3xl lg:text-4xl font-black tracking-tighter transition-colors duration-300 ${transparent ? "text-white" : "text-slate-800"}`}
      >
        STARTUP
        <span
          className={`transition-colors duration-300 ${transparent ? "text-amber-400" : "text-cyan-600"}`}
        >
          SC
        </span>
      </Link>

      {/* Desktop nav links */}
      <div
        ref={navRef}
        className="relative hidden lg:flex items-center gap-8 font-semibold"
      >
        {links.map((link, i) => (
          <NavLink
            key={link.to}
            to={link.to}
            ref={(el) => (linkRefs.current[i] = el)}
            className={({ isActive }) =>
              `pb-1 transition-colors duration-300 ${
                isActive
                  ? transparent
                    ? "text-white"
                    : "text-cyan-700"
                  : transparent
                    ? "text-white/70 hover:text-white"
                    : "text-slate-600 hover:text-cyan-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        <span
          className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-in-out ${transparent ? "bg-white" : "bg-cyan-600"}`}
          style={indicatorStyle}
        />
      </div>

      {/* Desktop motion button */}
      <button
        onClick={toggleReduceMotion}
        title={reduceMotion ? "Enable motion" : "Reduce motion"}
        className={`hidden lg:block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
          transparent
            ? reduceMotion
              ? "border-white/40 text-white bg-white/10"
              : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
            : reduceMotion
              ? "border-cyan-200 text-cyan-700 bg-cyan-50"
              : "border-stone-200 text-slate-500 hover:text-cyan-700 hover:border-cyan-200"
        }`}
      >
        {reduceMotion ? "Motion Off" : "Motion On"}
      </button>

      {/* Mobile right: motion toggle + hamburger */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={toggleReduceMotion}
          className={`text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
            transparent
              ? reduceMotion
                ? "border-white/40 text-white bg-white/10"
                : "border-white/20 text-white/60"
              : reduceMotion
                ? "border-cyan-200 text-cyan-700 bg-cyan-50"
                : "border-stone-200 text-slate-500"
          }`}
        >
          {reduceMotion ? "Motion Off" : "Motion On"}
        </button>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex flex-col justify-center items-center w-8 h-8 gap-1.5"
        >
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-200 origin-center ${
              transparent ? "bg-white" : "bg-slate-800"
            } ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-200 ${
              transparent ? "bg-white" : "bg-slate-800"
            } ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-200 origin-center ${
              transparent ? "bg-white" : "bg-slate-800"
            } ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu — animated slide-down with staggered links */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: -12, scaleY: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top" }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t-2 border-amber-400 lg:hidden overflow-hidden"
          >
            <div className="flex flex-col py-2">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: reduceMotion ? 0 : i * 0.045,
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `block px-6 py-3 font-semibold transition-colors ${
                        isActive
                          ? "text-cyan-700 bg-cyan-50 border-l-2 border-cyan-500"
                          : "text-slate-700 hover:text-cyan-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
