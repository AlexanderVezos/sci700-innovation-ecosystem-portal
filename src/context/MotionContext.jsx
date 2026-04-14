/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const MotionContext = createContext(null);

export function MotionProvider({ children }) {
  const [reduceMotion, setReduceMotion] = useState(() => {
    const stored = localStorage.getItem("reduceMotion");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Keep the <html> class in sync so global CSS can kill all transitions
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  const toggleReduceMotion = () =>
    setReduceMotion((prev) => {
      localStorage.setItem("reduceMotion", String(!prev));
      return !prev;
    });

  return (
    <MotionContext.Provider value={{ reduceMotion, toggleReduceMotion }}>
      {children}
    </MotionContext.Provider>
  );
}

export const useMotion = () => useContext(MotionContext);
