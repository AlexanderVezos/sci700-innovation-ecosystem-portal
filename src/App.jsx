/* eslint-disable no-unused-vars */
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";

import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import Events from "@/pages/Events";
import Resources from "@/pages/Resources";

const routeOrder = ["/", "/directory", "/events", "/resources"];

const containerVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
    filter: "blur(8px)",
  }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -60 : 60,
    filter: "blur(8px)",
  }),
};

function PageWrapper({ children, direction }) {
  return (
    <motion.div
      custom={direction}
      variants={containerVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 left-0 w-full h-full bg-white"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();
  const [slideState, setSlideState] = useState({
    direction: 1,
    prevPath: location.pathname,
  });

  if (slideState.prevPath !== location.pathname) {
    const prevIndex = routeOrder.indexOf(slideState.prevPath);
    const nextIndex = routeOrder.indexOf(location.pathname);
    setSlideState({
      direction: nextIndex > prevIndex ? 1 : -1,
      prevPath: location.pathname,
    });
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="relative overflow-hidden flex-1">
        <AnimatePresence mode="wait" custom={slideState.direction}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageWrapper direction={slideState.direction}>
                  <Home />
                </PageWrapper>
              }
            />
            <Route
              path="/directory"
              element={
                <PageWrapper direction={slideState.direction}>
                  <Directory />
                </PageWrapper>
              }
            />
            <Route
              path="/events"
              element={
                <PageWrapper direction={slideState.direction}>
                  <Events />
                </PageWrapper>
              }
            />
            <Route
              path="/resources"
              element={
                <PageWrapper direction={slideState.direction}>
                  <Resources />
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
