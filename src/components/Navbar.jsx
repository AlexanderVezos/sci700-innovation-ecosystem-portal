import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/context/MotionContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/directory", label: "Directory" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
];

function Navbar() {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const { reduceMotion, toggleReduceMotion } = useMotion();

  const isHome = location.pathname === "/";

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
    }
  }, [location.pathname]);

  useEffect(() => {
    const scrollEl = document.querySelector(".overflow-y-auto");
    if (!scrollEl) return;
    const onScroll = () => setScrolled(scrollEl.scrollTop > 10);
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const transparent = isHome && !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${
        transparent ? "bg-transparent" : "bg-white shadow-sm"
      }`}
    >
      <div className={`text-4xl font-black tracking-tighter transition-colors duration-300 ${transparent ? "text-white" : "text-slate-800"}`}>
        STARTUP<span className={`transition-colors duration-300 ${transparent ? "text-amber-400" : "text-cyan-600"}`}>SC</span>
      </div>

      <div
        ref={navRef}
        className="relative hidden md:flex items-center gap-8 font-semibold"
      >
        {links.map((link, i) => (
          <NavLink
            key={link.to}
            to={link.to}
            ref={(el) => (linkRefs.current[i] = el)}
            className={({ isActive }) =>
              `pb-1 transition-colors duration-300 ${
                isActive
                  ? transparent ? "text-white" : "text-cyan-700"
                  : transparent ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-cyan-700"
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

      <button
        onClick={toggleReduceMotion}
        title={reduceMotion ? "Enable motion" : "Reduce motion"}
        className={`hidden md:block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
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
    </nav>
  );
}

export default Navbar;
