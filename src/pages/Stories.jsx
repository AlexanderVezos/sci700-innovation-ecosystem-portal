import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useTilt } from "@/hooks/useTilt";
import { useMotion } from "@/context/MotionContext";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function excerpt(body, max = 120) {
  if (!body) return "";
  const flat = body.replace(/\n+/g, " ");
  return flat.length > max ? flat.slice(0, max).trimEnd() + "…" : flat;
}

function StoryCard({ story, reduceMotion }) {
  const { ref, onMouseMove, onMouseLeave, cardStyle, imgStyle } = useTilt(reduceMotion);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={cardStyle}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
    >
      <Link to={`/stories/${story._id}`} className="group flex flex-col h-full">
        {story.imageUrl ? (
          <div className="aspect-video overflow-hidden bg-slate-100">
            <motion.img
              src={story.imageUrl}
              alt={story.title}
              style={imgStyle}
              className="w-full h-full object-cover scale-110"
            />
          </div>
        ) : (
          <div className="aspect-video bg-linear-to-br from-amber-50 to-slate-100" />
        )}
        <div className="p-6 flex flex-col gap-2 flex-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
            {formatDate(story.publishedAt)}
          </span>
          <h2 className="text-lg font-black tracking-tight text-slate-900 leading-snug">
            {story.title}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed flex-1">
            {excerpt(story.body)}
          </p>
          <span className="text-xs font-semibold text-slate-400 mt-2 group-hover:text-amber-500 transition-colors">
            Read more →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Stories() {
  const { reduceMotion } = useMotion();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              Stories from
              <br />
              the coast.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Success stories, milestones, and updates from the Sunshine Coast
              innovation ecosystem.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 md:px-16 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse"
                >
                  <div className="aspect-video bg-slate-200" />
                  <div className="p-6 flex flex-col gap-3">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-5 w-full bg-slate-200 rounded" />
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <p className="text-slate-400 text-center py-20">
              No stories found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((s) => (
                <StoryCard key={s._id} story={s} reduceMotion={reduceMotion} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
