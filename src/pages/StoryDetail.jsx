import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setStory(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <motion.div {...fade} className="h-full bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </motion.div>
    );
  }

  if (notFound || !story) {
    return (
      <motion.div {...fade} className="h-full bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-8">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Story not found.</h1>
        <Link to="/stories" className="text-sm font-semibold text-amber-500 hover:underline">
          ← Back to Stories
        </Link>
      </motion.div>
    );
  }

  const paragraphs = story.body.split(/\n\n+/).filter(Boolean);

  return (
    <motion.div {...fade} className="h-full flex flex-col-reverse bg-slate-50">
      <div className="max-w-2xl mx-auto w-full px-8 md:px-0 py-10 shrink-0">
        <Link
          to="/stories"
          className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-colors"
        >
          ← Stories
        </Link>

        <div className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
            {formatDate(story.publishedAt)}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight mt-2">
            {story.title}
          </h1>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base md:text-lg text-slate-700 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>

      {story.imageUrl && (
        <div className="relative flex-1 min-h-[120px] overflow-hidden bg-slate-900">
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      )}
    </motion.div>
  );
}
