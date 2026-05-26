import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

function IconX() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconError() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconSuccess() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconWarn() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const ICONS = { error: IconError, success: IconSuccess, warn: IconWarn };

const BORDER = {
  error: "border-red-500/60",
  success: "border-green-500/60",
  warn: "border-amber-400/60",
};

const ICON_COLOR = {
  error: "text-red-400",
  success: "text-green-400",
  warn: "text-amber-400",
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-2 z-9999 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={`pointer-events-auto flex items-start gap-2.5 bg-zinc-900 border ${BORDER[t.variant]} rounded-2xl shadow-2xl px-4 py-3 max-w-sm w-max`}
            >
              <span className={`mt-0.5 shrink-0 ${ICON_COLOR[t.variant]}`}>
                <Icon />
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-white leading-snug">
                  {t.message}
                </span>
                {t.detail && (
                  <span className="text-[11px] font-mono text-zinc-400 mt-0.5 break-all">
                    {t.detail}
                  </span>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="mt-0.5 shrink-0 text-zinc-500 hover:text-zinc-200 transition-colors"
                aria-label="Dismiss"
              >
                <IconX />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
