import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/directory", label: "Directory" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
];

function Navbar() {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef(null);
  const linkRefs = useRef([]);

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

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white">
      <div className="text-4xl font-black tracking-tighter text-slate-800">
        STARTUP<span className="text-cyan-600">SC</span>
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
              isActive
                ? "text-cyan-700 pb-1"
                : " hover:text-cyan-700 transition-colors pb-1"
            }
          >
            {link.label}
          </NavLink>
        ))}

        <span
          className="absolute bottom-0 h-0.5 bg-cyan-600 transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        />
      </div>
    </nav>
  );
}

export default Navbar;
