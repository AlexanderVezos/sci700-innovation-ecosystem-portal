import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import Events from "@/pages/Events";
import Resources from "@/pages/Resources";

function App() {
  const [parent] = useAutoAnimate();

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div ref={parent} className="relative overflow-hidden flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
