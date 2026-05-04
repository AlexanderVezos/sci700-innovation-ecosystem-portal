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

function PendingCard({ item, type, token, onDecision }) {
  const [busy, setBusy] = useState(null);

  async function decide(status) {
    setBusy(status);
    try {
      await apiFetch(`/api/admin/${type}/${item._id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onDecision(item._id);
    } catch {
      setBusy(null);
    }
  }

  const name = item.name || item.title;
  const sub = [item.tag, item.type, item.organizer, item.organisation].find(Boolean);
  const date = item.date || (item.deadline ? `Deadline: ${item.deadline}` : null);
  const submitted = item.createdAt
    ? new Date(item.createdAt).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-snug truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {sub && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                {sub}
              </span>
            )}
            {date && <span className="text-xs text-slate-400">{date}</span>}
          </div>
        </div>
        {submitted && <span className="text-[10px] text-slate-500 shrink-0 pt-0.5">{submitted}</span>}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.description}</p>

      {(item.email || item.website || item.location) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {item.location && <span className="text-[11px] text-slate-500">📍 {item.location}</span>}
          {item.email && <span className="text-[11px] text-slate-500">✉ {item.email}</span>}
          {item.website && (
            <a href={item.website} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:text-cyan-300 truncate max-w-[200px]">
              🔗 {item.website}
            </a>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
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

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ token, onLogout }) {
  const [data, setData] = useState({ startups: [], events: [], opportunities: [] });
  const [autoApprove, setAutoApproveState] = useState(false);
  const [toggling, setToggling] = useState(false);
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
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Auto-approve banner */}
      {autoApprove && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 text-xs text-emerald-400 text-center font-semibold">
          Auto-approve is ON — all new submissions go live immediately without review
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-10">
        {totalPending === 0 ? (
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
