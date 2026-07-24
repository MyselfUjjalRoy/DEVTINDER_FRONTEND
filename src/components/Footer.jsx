import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-base-950/80 border-t border-white/5 mt-24 py-12 px-4 sm:px-6 lg:px-8 text-base-content/70">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand info */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md shadow-primary/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              Dev<span className="text-primary">Tinder</span>
            </span>
          </Link>
          <p className="text-xs text-base-content/50 max-w-sm text-center md:text-left">
            The developer matchmaking platform. Swipe through profiles, find pair programming partners, and build legendary software together.
          </p>
        </div>

        {/* Built With Tech Stack Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mr-2">Built with:</span>
          <span className="badge badge-sm bg-base-800/80 border-white/10 text-cyan-400 font-medium">React 19</span>
          <span className="badge badge-sm bg-base-800/80 border-white/10 text-purple-400 font-medium">Redux Toolkit</span>
          <span className="badge badge-sm bg-base-800/80 border-white/10 text-emerald-400 font-medium">Node & Express</span>
          <span className="badge badge-sm bg-base-800/80 border-white/10 text-rose-400 font-medium">Socket.IO</span>
          <span className="badge badge-sm bg-base-800/80 border-white/10 text-amber-400 font-medium">MongoDB</span>
        </div>

        {/* Copyright & Author */}
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-xs font-semibold text-white">
            Created By <span className="text-primary font-bold">Ujjal Roy</span>
          </p>
          <p className="text-[11px] text-base-content/40">
            Copyright &copy; {new Date().getFullYear()} DevTinder. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;