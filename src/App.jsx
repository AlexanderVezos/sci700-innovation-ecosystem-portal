import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
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
import Toaster from "@/components/Toast";

function App() {
  const location = useLocation();

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [location.pathname]);

  return (
    <div className="h-screen">
      <Navbar />
      <Toaster />
      <div ref={scrollRef} className="overflow-y-auto h-full">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/events" element={<Events />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/map" element={<EcosystemMap />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
