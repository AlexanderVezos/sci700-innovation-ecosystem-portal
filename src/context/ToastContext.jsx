/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((variant, message, detail, key) => {
    if (key) {
      setToasts((prev) => {
        if (prev.some((t) => t.key === key)) return prev;
        const id = crypto.randomUUID();
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
        return [...prev, { id, variant, message, detail, key }];
      });
    } else {
      const id = crypto.randomUUID();
      setToasts((prev) => [
        ...prev,
        { id, variant, message, detail, key: null },
      ]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
    }
  }, []);

  const toast = {
    error: (message, detail, key) => addToast("error", message, detail, key),
    success: (message, detail) => addToast("success", message, detail),
    warn: (message, detail) => addToast("warn", message, detail),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
