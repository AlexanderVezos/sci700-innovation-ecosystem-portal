import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import Events from "@/pages/Events";
import Resources from "@/pages/Resources";
import Opportunities from "@/pages/Opportunities";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import EcosystemMap from "@/pages/EcosystemMap";
import Stories from "@/pages/Stories";
import StoryDetail from "@/pages/StoryDetail";
import Admin from "@/pages/Admin";
import Kiosk from "@/pages/Kiosk";
import Toaster from "@/components/Toast";

function DisclaimerBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem("disclaimerDismissed") !== "1");

  if (!visible) return null;

  return (
    <div className="relative bg-zinc-900 border-b border-zinc-700 px-6 py-4 flex items-center justify-center" style={{ zIndex: 9999999 }}>
      <div className="text-center">
        <span className="text-amber-400 font-bold tracking-widest uppercase text-sm">University Assessment Only</span>
        <p className="text-zinc-200 text-base mt-1">
          This is a prototype built for SCI700 at UniSC. It is <span className="text-amber-400 font-semibold">not</span> an official government or industry platform.
        </p>
      </div>
      <button
        onClick={() => { localStorage.setItem("disclaimerDismissed", "1"); setVisible(false); }}
        aria-label="Dismiss disclaimer"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-400 transition-colors text-xl leading-none"
      >
        ✕
      </button>
    </div>
  );
}

function App() {
  const location = useLocation();
  const scrollRef = useRef(null);
  const isAdmin = location.pathname === "/admin";
  const isKiosk = location.pathname === "/kiosk";
  const isStoryDetail = /^\/stories\/.+/.test(location.pathname);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [location.pathname]);

  if (isAdmin)
    return (
      <>
        <DisclaimerBanner />
        <Toaster />
        <Admin />
      </>
    );
  if (isKiosk)
    return (
      <>
        <DisclaimerBanner />
        <Toaster />
        <Kiosk />
      </>
    );

  return (
    <div className="h-screen flex flex-col">
      <DisclaimerBanner />
      <Navbar />
      <Toaster />
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 ${isStoryDetail ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        <div className={isStoryDetail ? "h-full" : "min-h-full flex flex-col"}>
          <div className={isStoryDetail ? "h-full" : "flex-1"}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/events" element={<Events />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/map" element={<EcosystemMap />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/:id" element={<StoryDetail />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </AnimatePresence>
          </div>
          {!isStoryDetail && <Footer />}
        </div>
      </div>
    </div>
  );
}

export default App;
