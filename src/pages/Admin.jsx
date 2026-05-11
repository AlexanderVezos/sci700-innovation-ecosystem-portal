import { useEffect, useRef, useState, useCallback } from "react";

const TOKEN_KEY = "admin_token";
const POLL_MS = 1000;

// ─── API helpers ─────────────────────────────────────────────────────────────

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function apiFetch(path, token, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { ...authHeaders(token), ...opts.headers } });
  if (res.status === 401) throw new Error("401");
  return res;
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Wrong credentials."); return; }
      const { token } = await res.json();
      sessionStorage.setItem(TOKEN_KEY, token);
      onLogin(token);
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-3xl font-black tracking-tighter text-white">
            STARTUP<span className="text-amber-400">SC</span>
          </span>
          <p className="text-slate-500 text-sm mt-1 tracking-widest uppercase font-semibold">Admin</p>
        </div>

        <form onSubmit={submit} className="bg-slate-900 rounded-2xl p-6 flex flex-col gap-4 border border-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="mt-1 w-full py-2.5 rounded-xl bg-amber-400 text-slate-900 font-bold text-sm tracking-wide hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Checking…" : "Access Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Pending item card ────────────────────────────────────────────────────────

const EVENT_TYPES_ADMIN = ["Networking", "Workshop", "Pitch Night", "Conference", "Webinar", "Roadshow", "Expo", "Other"];

function PendingCard({ item, type, token, onDecision }) {
  const [busy, setBusy]           = useState(null);
  const [eventType, setEventType] = useState(item.type || "");
  const [organizer, setOrganizer] = useState(item.organizer || "");

  async function decide(status) {
    setBusy(status);
    const body = { status };
    if (type === "events") {
      if (eventType) body.type = eventType;
      if (organizer.trim()) body.organizer = organizer.trim();
    }
    try {
      await apiFetch(`/api/admin/${type}/${item._id}`, token, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      onDecision(item._id);
    } catch {
      setBusy(null);
    }
  }

  const name = item.name || item.title;
  const fmtDate = (d) => d && new Date(d).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const date = item.date ? fmtDate(item.date) : item.deadline ? `Deadline: ${item.deadline}` : null;
  const submitted = item.createdAt
    ? new Date(item.createdAt).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-snug">{name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {item.source && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded-md">
                {item.source}
              </span>
            )}
            {date && <span className="text-xs text-slate-400">{date}</span>}
          </div>
        </div>
        {submitted && <span className="text-[10px] text-slate-500 shrink-0 pt-0.5">{submitted}</span>}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.description}</p>

      {(item.location || item.rsvpUrl || item.email || item.website) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {item.location && <span className="text-[11px] text-slate-500">📍 {item.location}</span>}
          {item.email && <span className="text-[11px] text-slate-500">✉ {item.email}</span>}
          {(item.rsvpUrl || item.website) && (
            <a href={item.rsvpUrl || item.website} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:text-cyan-300 truncate max-w-[200px]">
              🔗 {item.rsvpUrl ? "View event" : item.website}
            </a>
          )}
        </div>
      )}

      {type === "events" && (
        <div className="flex gap-2 pt-1 border-t border-slate-700">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50"
            >
              <option value="">— pick one —</option>
              {EVENT_TYPES_ADMIN.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Organizer</label>
            <input
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g. MEFSC"
              className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => decide("approved")}
          disabled={!!busy}
          className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-40"
        >
          {busy === "approved" ? "…" : "✓ Approve"}
        </button>
        <button
          onClick={() => decide("rejected")}
          disabled={!!busy}
          className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-bold hover:bg-red-500/30 transition-colors disabled:opacity-40"
        >
          {busy === "rejected" ? "…" : "✕ Reject"}
        </button>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, type, items, token, onDecision }) {
  if (items.length === 0) return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{title} · 0 pending</h2>
      <p className="text-slate-600 text-sm italic">All clear.</p>
    </div>
  );

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
        {title} · <span className="text-amber-400">{items.length} pending</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((item) => (
          <PendingCard key={item._id} item={item} type={type} token={token} onDecision={onDecision} />
        ))}
      </div>
    </div>
  );
}

// ─── Image upload ─────────────────────────────────────────────────────────────

async function uploadImage(file, token) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const res = await apiFetch("/api/upload", token, {
          method: "POST",
          body: JSON.stringify({ data: e.target.result }),
        });
        if (!res.ok) { reject(new Error("Upload failed")); return; }
        const { url } = await res.json();
        resolve(url);
      } catch (err) { reject(err); }
    };
    reader.readAsDataURL(file);
  });
}

// ─── Story form ───────────────────────────────────────────────────────────────

const EMPTY_STORY = { title: "", body: "", imageUrl: "", featured: false, status: "draft" };

function StoryForm({ token, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY_STORY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial?._id;

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, token);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setError("Image upload failed — check Cloudinary credentials.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { setError("Title and body are required."); return; }
    setSaving(true);
    setError("");
    try {
      const path = isEdit ? `/api/stories/${initial._id}` : "/api/stories";
      const res = await apiFetch(path, token, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) { setError("Save failed."); return; }
      onSave(await res.json());
    } catch {
      setError("Could not reach server.");
    } finally {
      setSaving(false);
    }
  }

  const INPUT = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400";

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white">{isEdit ? "Edit story" : "New story"}</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Title</label>
        <input value={form.title} onChange={set("title")} required className={INPUT} placeholder="Headline" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Body</label>
        <textarea value={form.body} onChange={set("body")} required rows={8}
          className={`${INPUT} resize-y`} placeholder="Separate paragraphs with a blank line." />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Image</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1 flex flex-col gap-2">
            <input value={form.imageUrl} onChange={set("imageUrl")}
              className={INPUT} placeholder="https://… or upload below" />
            <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
              uploading ? "border-slate-700 text-slate-500" : "border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-400"
            }`}>
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} disabled={uploading} />
            </label>
          </div>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="w-24 h-16 object-cover rounded-lg border border-slate-700 shrink-0" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.featured} onChange={set("featured")}
            className="w-4 h-4 rounded border-slate-600 text-amber-400 focus:ring-amber-400/50" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured</span>
        </label>

        <div className="flex gap-2">
          {["draft", "published"].map((s) => (
            <button key={s} type="button"
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border transition-colors ${
                form.status === s
                  ? s === "published"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-700 border-slate-600 text-slate-200"
                  : "border-slate-700 text-slate-500 hover:text-slate-300"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving || uploading}
          className="flex-1 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-300 transition-colors disabled:opacity-40">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create story"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-bold hover:text-slate-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Stories tab ──────────────────────────────────────────────────────────────

function StoriesTab({ token }) {
  const [stories, setStories] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, EMPTY_STORY-like = new, story obj = edit
  const [busy, setBusy] = useState({});

  useEffect(() => {
    apiFetch("/api/stories/admin/all", token)
      .then((r) => r.json())
      .then(setStories)
      .catch(() => {});
  }, [token]);

  function onSave(saved) {
    setStories((prev) => {
      const idx = prev.findIndex((s) => s._id === saved._id);
      return idx >= 0 ? prev.map((s) => s._id === saved._id ? saved : s) : [saved, ...prev];
    });
    setEditing(null);
  }

  async function toggleStatus(story) {
    setBusy((b) => ({ ...b, [story._id]: true }));
    const newStatus = story.status === "published" ? "draft" : "published";
    try {
      const res = await apiFetch(`/api/stories/${story._id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStories((prev) => prev.map((s) => s._id === updated._id ? updated : s));
      }
    } finally {
      setBusy((b) => ({ ...b, [story._id]: false }));
    }
  }

  async function deleteStory(story) {
    if (!confirm(`Delete "${story.title}"?`)) return;
    setBusy((b) => ({ ...b, [story._id]: true }));
    try {
      const res = await apiFetch(`/api/stories/${story._id}`, token, { method: "DELETE" });
      if (res.ok) setStories((prev) => prev.filter((s) => s._id !== story._id));
    } finally {
      setBusy((b) => ({ ...b, [story._id]: false }));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {editing !== null ? (
        <StoryForm token={token} initial={editing._id ? editing : undefined}
          onSave={onSave} onCancel={() => setEditing(null)} />
      ) : (
        <button onClick={() => setEditing({})}
          className="self-start px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-300 transition-colors">
          + New story
        </button>
      )}

      {stories.length === 0 ? (
        <p className="text-slate-600 text-sm italic">No stories yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {stories.map((s) => (
            <div key={s._id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-4">
              {s.imageUrl && (
                <img src={s.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{s.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    s.status === "published"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-slate-400 bg-slate-700"
                  }`}>{s.status}</span>
                  {s.featured && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">Featured</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(s)} disabled={busy[s._id]}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 ${
                    s.status === "published"
                      ? "border-slate-600 text-slate-400 hover:text-slate-200"
                      : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                  }`}>
                  {s.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => setEditing(s)} disabled={busy[s._id]}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-600 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40">
                  Edit
                </button>
                <button onClick={() => deleteStory(s)} disabled={busy[s._id]}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState("pending");
  const [data, setData] = useState({ startups: [], events: [], opportunities: [] });
  const [autoApprove, setAutoApproveState] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const pollRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [pendingRes, settingsRes] = await Promise.all([
        apiFetch("/api/admin/pending", token),
        apiFetch("/api/admin/settings", token),
      ]);
      if (pendingRes.ok) setData(await pendingRes.json());
      if (settingsRes.ok) setAutoApproveState((await settingsRes.json()).autoApprove);
    } catch (err) {
      if (err.message === "401") onLogout();
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  function removeItem(id) {
    setData((prev) => ({
      startups: prev.startups.filter((x) => x._id !== id),
      events: prev.events.filter((x) => x._id !== id),
      opportunities: prev.opportunities.filter((x) => x._id !== id),
    }));
  }

  async function scrapeEvents() {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await apiFetch("/api/admin/scrape-events", token, { method: "POST" });
      setScrapeResult(await res.json());
    } catch {
      setScrapeResult({ errors: ["Could not reach server."] });
    } finally {
      setScraping(false);
    }
  }

  async function toggleAutoApprove() {
    setToggling(true);
    try {
      const res = await apiFetch("/api/admin/settings", token, {
        method: "PATCH",
        body: JSON.stringify({ autoApprove: !autoApprove }),
      });
      if (res.ok) setAutoApproveState((await res.json()).autoApprove);
    } finally {
      setToggling(false);
    }
  }

  async function logout() {
    try { await apiFetch("/api/admin/logout", token, { method: "POST" }); } catch { /* ignore */ }
    onLogout();
  }

  const totalPending = data.startups.length + data.events.length + data.opportunities.length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-black tracking-tighter text-white">
            STARTUP<span className="text-amber-400">SC</span>
            <span className="text-slate-500 font-semibold text-sm ml-2">Admin</span>
          </span>
          {totalPending > 0 && (
            <span className="text-xs font-bold bg-amber-400 text-slate-900 rounded-full px-2 py-0.5 leading-none">
              {totalPending}
            </span>
          )}
          <div className="flex gap-1 ml-4">
            {[["pending", "Pending"], ["stories", "Stories"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                  tab === key ? "bg-amber-400 text-slate-900" : "text-slate-400 hover:text-slate-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-approve toggle */}
          <button
            onClick={toggleAutoApprove}
            disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide uppercase transition-colors ${
              autoApprove
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoApprove ? "bg-emerald-400" : "bg-slate-600"}`} />
            Auto-approve {autoApprove ? "On" : "Off"}
          </button>

          <button
            onClick={scrapeEvents}
            disabled={scraping}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-bold tracking-wide uppercase hover:border-amber-400 hover:text-amber-400 transition-colors disabled:opacity-40"
          >
            {scraping ? "Scraping…" : "Scrape Events"}
          </button>

          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Scrape result banner */}
      {scrapeResult && (
        <div className={`px-6 py-2 text-xs text-center font-semibold border-b ${
          scrapeResult.errors?.length
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        }`}>
          {scrapeResult.errors?.length
            ? scrapeResult.errors.join(" · ")
            : `Scrape complete — ${scrapeResult.added} new event${scrapeResult.added !== 1 ? "s" : ""} added, ${scrapeResult.skipped} already existed`}
          <button onClick={() => setScrapeResult(null)} className="ml-3 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Auto-approve banner */}
      {autoApprove && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 text-xs text-emerald-400 text-center font-semibold">
          Auto-approve is ON — all new submissions go live immediately without review
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-10">
        {tab === "stories" ? (
          <StoriesTab token={token} />
        ) : totalPending === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">✓</p>
            <p className="text-slate-400 font-semibold">No pending submissions</p>
            <p className="text-slate-600 text-sm mt-1">New entries will appear here automatically</p>
          </div>
        ) : (
          <>
            <Section title="Startups" type="startups" items={data.startups} token={token} onDecision={removeItem} />
            <Section title="Events" type="events" items={data.events} token={token} onDecision={removeItem} />
            <Section title="Opportunities" type="opportunities" items={data.opportunities} token={token} onDecision={removeItem} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));

  function handleLogin(t) { setToken(t); }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard token={token} onLogout={handleLogout} />;
}
