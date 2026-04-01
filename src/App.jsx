import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import Events from "@/pages/Events";
import Resources from "@/pages/Resources";

const routes = ["/", "/directory", "/events", "/resources"];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      const i = routes.indexOf(location.pathname);
      if (e.key === "ArrowRight") navigate(routes[(i + 1) % routes.length]);
      if (e.key === "ArrowLeft") navigate(routes[(i - 1 + routes.length) % routes.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location.pathname, navigate]);

  return (
    <div className="h-screen">
      <Navbar />
      <div className="overflow-y-auto h-full">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/events" element={<Events />} />
                <Route path="/resources" element={<Resources />} />
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
