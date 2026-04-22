import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="px-8 py-8 border-t border-slate-100 shadow-[0_-1px_3px_0_rgb(0,0,0,0.1),0_-1px_2px_-1px_rgb(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
      <span className="font-black text-slate-700 text-base tracking-tighter">
        STARTUP<span className="text-cyan-600">SC</span>
      </span>
      <span>© 2026 StartupSC</span>
      <div className="flex gap-4">
        <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms &amp; Conditions</Link>
      </div>
    </footer>
  );
}

export default Footer;
