import { Link } from "react-router-dom";

const PRODUCT_LINKS = [
  { label: "Explore Deck", to: "/feed", icon: "M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" },
  { label: "Matches", to: "/connections", icon: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" },
  { label: "Requests", to: "/requests", icon: "M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" },
  { label: "Pro Pass", to: "/premium", icon: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z", gold: true },
];

const RESOURCE_LINKS = [
  { label: "How it Works", to: "/#how" },
  { label: "Features", to: "/#features" },
  { label: "Sign In", to: "/login" },
  { label: "Register", to: "/login" },
];

const STACK = [
  { name: "React 19", color: "text-cyan-400", border: "border-cyan-500/25", bg: "bg-cyan-500/10" },
  { name: "Redux Toolkit", color: "text-purple-400", border: "border-purple-500/25", bg: "bg-purple-500/10" },
  { name: "Node & Express", color: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/10" },
  { name: "Socket.IO", color: "text-rose-400", border: "border-rose-500/25", bg: "bg-rose-500/10" },
  { name: "MongoDB", color: "text-amber-400", border: "border-amber-500/25", bg: "bg-amber-500/10" },
];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 mt-24">
      {/* Animated gradient top border */}
      <div className="navbar-accent"></div>

      {/* Background decoration */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none animate-aurora"></div>
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none animate-aurora" style={{ animationDelay: "-8s" }}></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-30 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/25 group-hover:scale-105 group-hover:shadow-rose-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#0b0c14] rounded-[0.85rem] flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-500 fill-current drop-shadow-[0_0_8px_rgba(255,45,85,0.6)]" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                Dev<span className="bg-gradient-to-r from-rose-500 via-pink-400 to-purple-400 bg-clip-text text-transparent">Tinder</span>
              </span>
            </Link>
            <p className="text-xs text-base-content/50 max-w-sm leading-relaxed">
              The developer matchmaking platform. Swipe through profiles, find pair programming partners, and build legendary software together.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-black text-emerald-300 uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              All systems operational
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-4">Product</p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group flex items-center gap-2.5 text-sm text-base-content/60 hover:text-white transition-colors"
                  >
                    <span className={`flex items-center justify-center w-6 h-6 rounded-lg ${l.gold ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-slate-400"} group-hover:scale-110 group-hover:text-rose-400 transition-all`}>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d={l.icon} />
                      </svg>
                    </span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-4">Resources</p>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group flex items-center gap-2.5 text-sm text-base-content/60 hover:text-white transition-colors"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 text-slate-400 group-hover:scale-110 group-hover:text-purple-400 transition-all">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Built with */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-4">Built with</p>
            <div className="flex flex-wrap gap-2">
              {STACK.map((s) => (
                <span
                  key={s.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${s.border} ${s.bg} ${s.color} hover:scale-105 transition-transform cursor-default`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                  {s.name}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-base-content/40 mt-4 leading-relaxed">
              Crafted for developers who want to match, pair and ship — together.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-base-content/40">
            Copyright &copy; {new Date().getFullYear()} DevTinder. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-base-content/60 flex items-center gap-1.5">
            Made with
            <svg className="w-4 h-4 text-rose-500 fill-current animate-heartbeat" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            by
            <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent font-black">Ujjal Roy</span>
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
          >
            Back to top
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
