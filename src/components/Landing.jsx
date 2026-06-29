import { Link } from "react-router-dom";
const Landing = () => {
  return (
    <div className="relative overflow-hidden bg-base-100 text-base-content min-h-screen">
      {/* Background ambient decorative glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          Now Live: The Developer Pairing Network
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none max-w-4xl">
          Where Developers{" "}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Find Their Match
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-base-content/70 max-w-2xl leading-relaxed">
          Swipe through matching profiles, connect with talented builders, and pair program on your next big project. DevFinder bridges the gap between ideas and execution.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <Link
            to="/login"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white px-8 rounded-2xl h-14 font-black text-base shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </Link>
          <a
            href="#features"
            className="btn btn-outline border-base-300 hover:border-base-100 hover:bg-base-200 text-base-content/80 hover:text-white px-8 rounded-2xl h-14 font-bold text-base transition-all flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>
        {/* Live Mockup UI Card */}
        <div className="mt-16 relative w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl blur-2xl -z-10"></div>
          <div className="card bg-base-200 border border-base-300 text-left rounded-3xl shadow-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-300">
            <figure className="relative h-60 w-full overflow-hidden bg-base-300">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                alt="Developer Profile Mockup"
                className="h-full w-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-transparent to-transparent opacity-90"></div>
              <div className="absolute top-4 left-4 bg-base-900/60 backdrop-blur-md text-[10px] font-black uppercase text-secondary px-2.5 py-1 rounded-full border border-secondary/20 tracking-wider">
                Looking for Collaborators
              </div>
            </figure>
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white leading-tight">
                  Sarah Jenkins
                </h2>
                <span className="badge badge-neutral text-xs font-bold py-2.5 px-3">
                  26 y/o
                </span>
              </div>
              <div className="text-[10px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5 -mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Full Stack Engineer
              </div>
              <p className="text-xs text-base-content/75 mt-3 leading-relaxed">
                Building a decentralized developer marketplace. Looking for frontend React wizards and Node backend experts to partner up!
              </p>
              <div className="mt-4 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-base-content/40">
                  Tech Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "Node.js", "GraphQL", "Tailwind"].map(
                    (skill, idx) => (
                      <span
                        key={idx}
                        className="badge badge-xs border-none bg-primary/10 text-primary font-bold py-2"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div id="features" className="border-t border-base-300/40 bg-base-200/30 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">
              Core Network Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              Everything You Need to Match
            </h3>
            <p className="text-sm text-base-content/65 max-w-xl mx-auto mt-3">
              We provide the framework to discover, verify, and message developer partners without overhead.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-200 border border-base-300 p-6 rounded-3xl space-y-4 hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">Discovery Feed</h4>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Filter by technical stack and experience. Swipe or check interest in other developers' projects and send connection requests instantly.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="card bg-base-200 border border-base-300 p-6 rounded-3xl space-y-4 hover:border-secondary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">Real-Time Chat</h4>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Connect and start building instantly. Dynamic chat rooms keep conversations synced so you can coordinate team building immediately.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="card bg-base-200 border border-base-300 p-6 rounded-3xl space-y-4 hover:border-accent/20 transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">Verified Accounts</h4>
              <p className="text-sm text-base-content/70 leading-relaxed">
                Premium verification lists you higher in the feed directories, gives access to unlimited connection requests, and proves account legitimacy.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* CTA section banner */}
      <div className="max-w-5xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="card w-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/15 border border-primary/20 p-8 sm:p-12 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Find Your Coding Partner Today
          </h3>
          <p className="text-sm text-base-content/75 max-w-xl mx-auto leading-relaxed">
            Join DevFinder and start connecting with developers who share your project passions, complement your skillset, and build awesome things.
          </p>
          <div>
            <Link
              to="/login"
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white px-8 rounded-2xl h-12 font-bold hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all inline-flex items-center gap-1"
            >
              <span>Join Now</span>
              <svg
                className="w-4 h-4 text-white fill-current"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Landing;