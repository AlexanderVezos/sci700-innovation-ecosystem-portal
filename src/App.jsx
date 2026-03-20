import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Routes, Route, useLocation } from "react-router-dom"
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"
import Navbar from "@/components/Navbar"

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
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

  return (
    <div>
      <Navbar />
      <div className="relative overflow-hidden h-[calc(100vh-57px)]">
        <AnimatePresence mode="sync">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/directory" element={<PageWrapper><Directory /></PageWrapper>} />
            <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
            <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App