import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="relative overflow-hidden bg-base-950 text-base-content min-h-screen">
      {/* Background Ambient Decorative Lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-secondary/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-8 shadow-lg shadow-primary/10 animate-pulse-glow">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          Match • Code • Build • Repeat
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none max-w-5xl">
          Where Developers{" "}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Find Their Match
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-base-content/70 max-w-2xl leading-relaxed">
          Swipe through developer profiles, pair code on next-gen ideas, and discover your co-founder or project match on <strong className="text-white">DevTinder</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <Link
            to="/login"
            className="btn btn-primary bg-gradient-to-r from-primary via-secondary to-accent border-none text-white px-8 rounded-2xl h-14 font-black text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <span>Start Swiping Free</span>
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <a
            href="#features"
            className="btn btn-outline border-white/10 hover:border-white/20 hover:bg-white/5 text-white px-8 rounded-2xl h-14 font-bold text-base transition-all flex items-center justify-center"
          >
            How it Works
          </a>
        </div>

        {/* Live Interactive Deck Card Preview Mockup */}
        <div className="mt-16 relative w-full max-w-md mx-auto animate-float-slow">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-3xl blur-2xl pointer-events-none"></div>
          
          <div className="glass-card text-left rounded-3xl shadow-2xl overflow-hidden border border-white/15 relative">
            <figure className="relative h-64 w-full overflow-hidden bg-base-900">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                alt="Sarah Jenkins Developer"
                className="h-full w-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-transparent"></div>
              
              <div className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-md text-[10px] font-black uppercase text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Seeking Pair Programmer
              </div>

              <div className="absolute bottom-3 left-6 right-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white drop-shadow-md">Sarah Jenkins</h3>
                  <span className="badge bg-base-900/80 text-white border-white/10 text-xs font-bold px-2.5 py-1">26 yrs</span>
                </div>
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-0.5">Full Stack Wizard</p>
              </div>
            </figure>

            <div className="p-6 pt-3 space-y-3">
              <p className="text-xs text-base-content/80 leading-relaxed">
                Building an AI-driven developer workflow tool. Looking for React 19 frontend engineers & Node.js backend hackers to join forces!
              </p>
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-base-content/40">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge badge-sm bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-bold">React 19</span>
                  <span className="badge badge-sm bg-sky-500/10 text-sky-400 border-sky-500/20 font-bold">TypeScript</span>
                  <span className="badge badge-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">Node.js</span>
                  <span className="badge badge-sm bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold">GraphQL</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                <button className="flex-1 btn btn-sm bg-base-800 border-white/10 text-error font-bold rounded-xl h-10">Pass ✕</button>
                <button className="flex-1 btn btn-sm btn-primary bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl h-10 shadow-lg shadow-primary/20">Connect ♥</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
          <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl font-black text-white">10K+</span>
            <p className="text-xs text-base-content/50 font-semibold mt-1">Active Developers</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl font-black text-primary">45K+</span>
            <p className="text-xs text-base-content/50 font-semibold mt-1">Successful Matches</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl font-black text-secondary">99.8%</span>
            <p className="text-xs text-base-content/50 font-semibold mt-1">Code Compatibility</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
            <span className="text-3xl font-black text-amber-400">24/7</span>
            <p className="text-xs text-base-content/50 font-semibold mt-1">Pair Session Chat</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="border-t border-white/5 bg-base-900/40 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">
              Why DevTinder?
            </h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
              Designed Exclusively for Software Engineers
            </h3>
            <p className="text-sm sm:text-base text-base-content/65 max-w-xl mx-auto mt-4">
              Stop searching random forums. Find verified developer matches based on tech stack affinity, coding goals, and active availability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/10 hover:border-primary/40 transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-white">Interactive Swipe Deck</h4>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Filter by React, Node, Python, AWS, or TypeScript. Swipe left to pass or swipe right to connect with builders instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/10 hover:border-secondary/40 transition-all duration-300 group">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-white">Realtime Socket Chat</h4>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Send messages instantly over WebSockets. Share code snippets, organize pair-programming sessions, and kickstart projects without delay.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 border border-white/10 hover:border-amber-400/40 transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-white">Verified Dev Badges</h4>
              <p className="text-sm text-base-content/70 leading-relaxed">
                DevTinder Premium status grants gold verification badges, unlimited connection requests, and top-tier placement in developer feeds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="max-w-5xl mx-auto px-4 py-24 text-center flex flex-col items-center">
        <div className="glass-card w-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/30 p-10 sm:p-16 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Find Your Next Coding Partner?
          </h3>
          <p className="text-sm sm:text-base text-base-content/75 max-w-xl mx-auto leading-relaxed">
            Join thousands of developers matching, pair programming, and shipping projects together on DevTinder.
          </p>
          <div>
            <Link
              to="/login"
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white px-10 rounded-2xl h-14 font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <span>Join DevTinder Today</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;