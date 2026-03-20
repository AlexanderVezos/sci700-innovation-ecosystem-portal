/* eslint-disable no-unused-vars */
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/Navbar"

const routeOrder = ["/", "/directory", "/events", "/resources"]

const variants = {
  enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (direction) => ({ x: direction > 0 ? "-100%" : "100%" }),
}

function PageWrapper({ children, direction }) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute top-0 left-0 w-full h-full"
    >
      {children}
    </motion.div>
  )
}

function Home() {
  return <div className="h-screen bg-cyan-100 flex items-center justify-center text-4xl font-black">Home</div>
}
function Directory() {
  return <div className="h-screen bg-emerald-100 flex items-center justify-center text-4xl font-black">Directory</div>
}
function Events() {
  return <div className="h-screen bg-violet-100 flex items-center justify-center text-4xl font-black">Events</div>
}
function Resources() {
  return <div className="h-screen bg-orange-100 flex items-center justify-center text-4xl font-black">Resources</div>
}

function App() {
  const location = useLocation()
  const [slideState, setSlideState] = useState({ direction: 1, prevPath: location.pathname })

  if (slideState.prevPath !== location.pathname) {
    const prevIndex = routeOrder.indexOf(slideState.prevPath)
    const nextIndex = routeOrder.indexOf(location.pathname)
    setSlideState({
      direction: nextIndex > prevIndex ? 1 : -1,
      prevPath: location.pathname,
    })
  }

  return (
    <div>
      <Navbar />
      <div className="relative overflow-hidden h-[calc(100vh-57px)]">
        <AnimatePresence mode="sync" custom={slideState.direction}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper direction={slideState.direction}><Home /></PageWrapper>} />
            <Route path="/directory" element={<PageWrapper direction={slideState.direction}><Directory /></PageWrapper>} />
            <Route path="/events" element={<PageWrapper direction={slideState.direction}><Events /></PageWrapper>} />
            <Route path="/resources" element={<PageWrapper direction={slideState.direction}><Resources /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App