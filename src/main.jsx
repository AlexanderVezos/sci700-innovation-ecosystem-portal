import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { MotionProvider } from "@/context/MotionContext";
import { ToastProvider } from "@/context/ToastContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <MotionProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MotionProvider>
    </BrowserRouter>
  </StrictMode>,
);
