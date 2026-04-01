import { useState, useEffect } from "react";

function DirectoryCard({ entry }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start">
      <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-base">
            {entry.name}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {entry.tag}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-snug">
          {entry.description}
        </p>
        <div className="flex gap-4 mt-2 text-xs text-slate-400 flex-wrap">
          <span>&#128197; {entry.year}</span>
          <span>&#128101; {entry.employees}</span>
          <span>&#127807; {entry.stage}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button className="bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
          View Profile
        </button>
        <button className="bg-slate-100 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
          Say Hello
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-3/4 bg-slate-100 rounded" />
        <div className="flex gap-4 mt-1">
          <div className="h-3 w-10 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        <div className="h-8 w-24 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

function Table() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/entries")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl">
      {entries.map((entry, i) => <DirectoryCard key={i} entry={entry} />)}
    </div>
  );
}

export default Table;
