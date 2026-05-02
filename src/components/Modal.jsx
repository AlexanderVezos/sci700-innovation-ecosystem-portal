import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

export default function Modal({ open, onClose, title, children, variant = "dialog" }) {
  const { reduceMotion } = useMotion();
  const isSheet = variant === "sheet";
  const dur = reduceMotion ? 0 : 0.35;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[200] flex ${isSheet ? "items-end" : "items-center justify-center p-4 md:p-8"}`}>
          <motion.div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onClick={onClose}
          />

          <motion.div
            className={`relative z-10 bg-white shadow-2xl flex flex-col overflow-hidden ${
              isSheet
                ? "w-full rounded-t-3xl max-h-[85vh]"
                : "w-full max-w-2xl rounded-2xl max-h-[90vh]"
            }`}
            initial={
              isSheet
                ? { y: "100%" }
                : { opacity: 0, scale: reduceMotion ? 1 : 0.95, y: reduceMotion ? 0 : 28 }
            }
            animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={
              isSheet
                ? { y: "100%" }
                : { opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 12 }
            }
            transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
          >
            {isSheet ? (
              <div
                className="flex justify-center pt-3 pb-2 shrink-0 cursor-pointer"
                onClick={onClose}
                aria-label="Close"
              >
                <div className="w-9 h-1 bg-slate-200 rounded-full" />
              </div>
            ) : (
              <div className="h-1 bg-amber-400 shrink-0" />
            )}

            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
