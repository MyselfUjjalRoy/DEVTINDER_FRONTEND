import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ConstellationBackground from "./ConstellationBackground";
import Reveal from "./Reveal";
import { useCountUp, useTypewriter } from "../utils/hooks";

const HERO_TAGLINES = [
  "Co-founders matched",
  "Solo devs teamed up",
  "Stack soulmates found",
  "Side projects shipped",
];

const TECHS = [
  { name: "React", color: "text-cyan-400" },
  { name: "Node.js", color: "text-emerald-400" },
  { name: "Python", color: "text-yellow-400" },
  { name: "TypeScript", color: "text-sky-400" },
  { name: "Go", color: "text-cyan-300" },
  { name: "Rust", color: "text-orange-400" },
  { name: "AWS", color: "text-amber-400" },
  { name: "Docker", color: "text-blue-400" },
  { name: "GraphQL", color: "text-pink-400" },
  { name: "PostgreSQL", color: "text-sky-300" },
  { name: "Kubernetes", color: "text-blue-300" },
  { name: "MongoDB", color: "text-green-400" },
  { name: "Vue", color: "text-teal-400" },
  { name: "Angular", color: "text-red-400" },
];

const GLYPHS = [
  { symbol: "</>", left: "6%", delay: "0s", dur: "18s", opacity: "0.25" },
  { symbol: "{ }", left: "14%", delay: "-6s", dur: "22s", opacity: "0.2" },
  { symbol: "=>", left: "24%", delay: "-12s", dur: "20s", opacity: "0.18" },
  { symbol: "git", left: "36%", delay: "-4s", dur: "24s", opacity: "0.22" },
  { symbol: "#", left: "48%", delay: "-15s", dur: "19s", opacity: "0.28" },
  { symbol: "npm i", left: "60%", delay: "-8s", dur: "23s", opacity: "0.18" },
  { symbol: "[]", left: "72%", delay: "-2s", dur: "21s", opacity: "0.24" },
  { symbol: "</>", left: "84%", delay: "-10s", dur: "18s", opacity: "0.2" },
  { symbol: "//", left: "92%", delay: "-14s", dur: "22s", opacity: "0.22" },
];

const TICKER_WORDS = ["MATCH", "CODE", "BUILD", "PAIR", "SHIP", "GROW", "CONNECT"];

const PLANS = [
  {
    key: "Free",
    name: "Free Dev Pass",
    tagline: "Kickstart your developer matchmaking journey at zero cost.",
    price: "₹0",
    period: "Forever",
    cta: "Get Started Free",
    popular: false,
    gradient: "from-slate-500 to-slate-700",
    glow: "shadow-slate-500/20",
    features: [
      "Browse the developer feed",
      "10 connection requests / day",
      "Standard feed placement",
      "Basic profile visibility",
    ],
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: "Silver",
    name: "Silver Dev Pass",
    tagline: "For developers ready to take their networking further.",
    price: "₹300",
    period: "3 Months",
    cta: "Upgrade to Silver",
    popular: false,
    gradient: "from-slate-300 via-slate-200 to-slate-400",
    glow: "shadow-slate-300/20",
    features: [
      "Direct socket chat with matches",
      "100 connection requests / day",
      "Silver verified badge",
      "Boosted feed placement",
    ],
    icon: (
      <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    key: "Gold",
    name: "Gold Pro Pass",
    tagline: "Everything in Silver, maxed out for serious matchmaking.",
    price: "₹700",
    period: "6 Months",
    cta: "Upgrade to Gold",
    popular: true,
    gradient: "from-amber-400 via-yellow-300 to-orange-400",
    glow: "shadow-amber-500/30",
    features: [
      "Unlimited direct messages",
      "Unlimited connection requests",
      "Gold verified badge",
      "Top feed deck placement",
      "Priority profile views & insights",
    ],
    icon: (
      <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1l2.9 2.4 3.7-.7.7 3.7L21.7 9l-1.9 3.2 1.9 3.2-2.4 2.6-.7 3.7-3.7-.7L12 23l-2.9-2.4-3.7.7-.7-3.7L2.3 15.4 4.2 12 2.3 8.8l2.4-2.6.7-3.7 3.7.7L12 1z" />
      </svg>
    ),
  },
];

const STATS = [
  { end: 10, suffix: "K+", decimals: 0, label: "Active Developers", gradient: "from-rose-400 to-pink-400" },
  { end: 45, suffix: "K+", decimals: 0, label: "Successful Matches", gradient: "from-purple-400 to-indigo-400" },
  { end: 99.8, suffix: "%", decimals: 1, label: "Code Compatibility", gradient: "from-cyan-400 to-sky-400" },
  { end: 24, suffix: "/7", decimals: 0, label: "Pair Session Chat", gradient: "from-amber-400 to-orange-400" },
];

const STEPS = [
  {
    title: "Build your dev profile",
    desc: "Add your stack, skills, GitHub vibes and what you're building next.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Swipe & match",
    desc: "Filter by React, Node, Python, AWS. Swipe right to connect instantly.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    title: "Chat & ship together",
    desc: "Realtime socket chat, code snippets and pair sessions — start building today.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Interactive Swipe Deck",
    desc: "Filter by React, Node, Python, AWS or TypeScript and swipe through verified builders instantly.",
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    ),
  },
  {
    title: "Realtime Socket Chat",
    desc: "Instant WebSocket messaging. Share code snippets and organize pair-programming sessions.",
    gradient: "from-purple-500 to-indigo-500",
    glow: "shadow-purple-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    title: "Stack-Based Matching",
    desc: "The algorithm ranks you by tech-stack affinity, coding goals and active availability.",
    gradient: "from-cyan-500 to-sky-500",
    glow: "shadow-cyan-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zM17 7h.01M17 3h5c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zM7 13h.01M7 21h5c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2zM17 13h.01M17 21h5c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2z" />
      </svg>
    ),
  },
  {
    title: "Code Snippet Sharing",
    desc: "Drop formatted code blocks right into chat and skip the screenshots forever.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Verified Dev Badges",
    desc: "Silver and gold verification mark trusted members and unlock unlimited requests.",
    gradient: "from-amber-500 to-yellow-500",
    glow: "shadow-amber-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Premium Feed Boost",
    desc: "Top placement in feeds, priority views and a gold badge that gets you noticed.",
    gradient: "from-orange-500 to-amber-500",
    glow: "shadow-orange-500/30",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
];

const MOCK_SKILL_STYLES = {
  "React 19": { bg: "bg-cyan-500/15", text: "text-cyan-500", border: "border-cyan-500/30", dot: "bg-cyan-400" },
  TypeScript: { bg: "bg-sky-500/15", text: "text-sky-500", border: "border-sky-500/30", dot: "bg-sky-400" },
  "Node.js": { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  GraphQL: { bg: "bg-pink-500/15", text: "text-pink-500", border: "border-pink-500/30", dot: "bg-pink-400" },
  AWS: { bg: "bg-purple-500/15", text: "text-purple-500", border: "border-purple-500/30", dot: "bg-purple-400" },
};

const MOCK_SKILLS = Object.keys(MOCK_SKILL_STYLES);

const MOCK_LINKS = [
  {
    label: "GitHub",
    color: "#24292E",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    color: "#0ea5e9",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-2.828 2.828a4 4 0 01-5.657-5.657l1.414-1.414m9.657 1.414l-1.414 1.414a4 4 0 01-5.657 5.657" />
      </svg>
    ),
  },
  {
    label: "LeetCode",
    color: "#FFA116",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
      </svg>
    ),
  },
];

const CountStat = ({ end, suffix = "", decimals = 0, label, gradient }) => {
  const value = useCountUp(end);
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 text-center group hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
      <span className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value.toFixed(decimals)}
        {suffix}
      </span>
      <p className="text-xs text-base-content/50 font-semibold mt-1">{label}</p>
    </div>
  );
};

const Landing = () => {
  const typed = useTypewriter(HERO_TAGLINES);
  const deckRef = useRef(null);
  const glareRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const heroGlowRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (blob1Ref.current) blob1Ref.current.style.transform = `translateY(${y * 0.18}px)`;
        if (blob2Ref.current) blob2Ref.current.style.transform = `translateY(${y * -0.14}px)`;
        if (heroGlowRef.current) heroGlowRef.current.style.transform = `translateY(${y * 0.12}px)`;
        if (gridRef.current) {
          gridRef.current.style.transform = `translateY(${y * 0.22}px) perspective(520px) rotateX(58deg)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleDeckTilt = (e) => {
    const el = deckRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
    el.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    if (glareRef.current) glareRef.current.style.opacity = "1";
  };

  const handleDeckTiltLeave = () => {
    const el = deckRef.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div className="relative overflow-hidden bg-base-950 text-base-content min-h-screen">
      <ConstellationBackground />

      {/* Aurora blobs */}
      <div ref={blob1Ref} className="absolute top-10 left-10 w-96 h-96 will-change-transform">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[130px] pointer-events-none animate-aurora"></div>
      </div>
      <div ref={blob2Ref} className="absolute top-1/3 right-10 w-[30rem] h-[30rem] will-change-transform">
        <div className="absolute inset-0 bg-secondary/15 rounded-full blur-[140px] pointer-events-none animate-aurora" style={{ animationDelay: "-6s" }}></div>
      </div>
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[110px] pointer-events-none animate-aurora" style={{ animationDelay: "-11s" }}></div>

      {/* Futuristic grid floor */}
      <div ref={gridRef} className="grid-floor hidden lg:block"></div>

      {/* ════════════ HERO ════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* rising code glyphs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block" aria-hidden="true">
          {GLYPHS.map((g, i) => (
            <span
              key={i}
              className="hero-glyph"
              style={{ left: g.left, animationDuration: g.dur, animationDelay: g.delay, "--glyph-opacity": g.opacity }}
            >
              {g.symbol}
            </span>
          ))}
        </div>

        {/* Announcement badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-8 shadow-lg shadow-primary/10 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Match • Code • Build • Repeat
        </div>

        {/* Hero Title */}
        <div className="relative w-full max-w-5xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {/* glow behind headline */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-3/4 h-28 pointer-events-none">
            <div ref={heroGlowRef} className="w-full h-full will-change-transform">
              <div className="w-full h-full bg-gradient-to-r from-rose-500/30 via-purple-500/25 to-cyan-400/30 rounded-full blur-[90px] animate-pulse-glow"></div>
            </div>
          </div>

          <h1 className="relative text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.02]">
            <span className="block">Where Developers</span>
            <span className="block bg-[linear-gradient(90deg,#fb7185,#f472b6,#c084fc,#67e8f9)] bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_40px_rgba(244,114,182,0.35)]">
              Find Their Match
            </span>
          </h1>

          {/* animated underline */}
          <div className="relative mx-auto mt-6 h-1.5 w-40 sm:w-64 rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400 animate-underline shadow-[0_0_20px_rgba(244,114,182,0.5)]"></div>
        </div>

        {/* Typewriter */}
        <div className="mt-5 flex items-center justify-center text-base sm:text-xl font-bold text-white/85 min-h-[1.75rem] animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <span className="text-white/40 mr-2">›</span>
          <span>{typed}</span>
          <span className="typewriter-cursor"></span>
        </div>

        <p className="mt-5 text-base sm:text-xl text-base-content/70 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Swipe through developer profiles, pair code on next-gen ideas, and discover your co-founder or project match on <strong className="text-white">DevTinder</strong>.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center px-10 h-16 rounded-2xl font-black text-base text-white transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <span className="absolute -inset-[2px] rounded-2xl bg-[linear-gradient(120deg,#fb7185,#f472b6,#a78bfa,#22d3ee,#fb7185)] bg-[length:300%_300%] animate-gradient opacity-90 blur-[2px]"></span>
            <span className="absolute inset-0 rounded-2xl bg-base-950"></span>
            <span className="absolute inset-[2px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></span>
            <span className="pointer-events-none absolute inset-[2px] rounded-2xl bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.45)_50%,transparent_70%)] bg-[length:220%_100%] bg-no-repeat animate-gradient"></span>
            <span className="relative flex items-center gap-2.5">
              Start Swiping Free
              <svg className="w-5 h-5 fill-current transition-transform duration-300 group-hover:translate-x-1.5" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>

          <a
            href="#how"
            className="group relative inline-flex items-center justify-center px-9 h-16 rounded-2xl font-bold text-base text-white border border-white/15 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <span className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-rose-500/50 via-purple-500/50 to-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"></span>
            <span className="relative flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:rotate-12 group-hover:scale-110 transition-transform">
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M8 5.14v13.72L19 12 8 5.14z" />
                </svg>
              </span>
              How it Works
            </span>
          </a>
        </div>

        {/* Live Interactive Deck Card Mockup — mirrors the real feed card */}
        <Reveal className="w-full">
        <div className="relative w-full max-w-md mx-auto mt-16">
          {/* ambient glow */}
          <div className="absolute inset-x-8 inset-y-4 bg-gradient-to-tr from-primary/40 via-secondary/30 to-accent/40 rounded-3xl blur-2xl pointer-events-none animate-pulse-glow"></div>

          {/* stacked deck peeks */}
          <div className="absolute inset-x-8 top-3 h-[calc(100%-20px)] rounded-3xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-white/10 -rotate-2"></div>
          <div className="absolute inset-x-4 top-1.5 h-[calc(100%-14px)] rounded-3xl bg-white/5 border border-white/10 -rotate-1"></div>

          {/* floating hearts */}
          <div className="float-heart text-rose-500 text-lg" style={{ left: "4%", animationDuration: "3s", animationDelay: "-0.5s" }}>♥</div>
          <div className="float-heart text-pink-400 text-sm" style={{ left: "88%", animationDuration: "3.6s", animationDelay: "-1.4s" }}>♥</div>
          <div className="float-heart text-purple-400 text-base" style={{ left: "78%", animationDuration: "4.2s", animationDelay: "-2.2s" }}>♥</div>

          {/* floating code chips — floating OUTSIDE the card */}
          <div className="absolute -left-4 sm:-left-16 -top-6 sm:-top-10 z-20 glass-card rounded-xl px-3.5 py-2.5 border border-white/10 shadow-2xl animate-float-y">
            <span className="text-xs font-mono text-cyan-400">{"</>"}</span>
            <span className="text-xs font-mono text-white/70 ml-1">deploy();</span>
          </div>
          <div className="absolute -right-4 sm:-right-16 top-20 sm:top-28 z-20 glass-card rounded-xl px-3.5 py-2.5 border border-white/10 shadow-2xl animate-float-y" style={{ animationDelay: "-2.5s" }}>
            <span className="text-xs font-mono text-amber-400">git push</span>
            <span className="text-xs text-emerald-400 ml-1">✓ shipped</span>
          </div>
          <div className="absolute -left-4 sm:-left-20 bottom-20 sm:bottom-24 z-20 glass-card rounded-xl px-3.5 py-2.5 border border-white/10 shadow-2xl animate-float-y" style={{ animationDelay: "-4s" }}>
            <span className="text-xs font-mono text-purple-400">{"<pair />"}</span>
          </div>
          <div className="absolute -right-4 sm:-right-16 -bottom-8 sm:-bottom-10 z-20 glass-card rounded-xl px-3.5 py-2.5 border border-white/10 shadow-2xl animate-float-y" style={{ animationDelay: "-1.2s" }}>
            <span className="text-xs font-mono text-emerald-400">{"() =>"}</span>
            <span className="text-xs text-white/60 ml-1">build()</span>
          </div>

          {/* floating like notification — hovers above the card, never hides it */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 hidden sm:block">
            <div className="glass-card rounded-xl pl-2.5 pr-3.5 py-2.5 border border-white/10 shadow-2xl flex items-center gap-2.5 animate-float-y">
              <span className="relative flex w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 items-center justify-center text-white shadow-md shadow-rose-500/30">
                <span className="absolute inset-0 rounded-full animate-ping bg-rose-500/40"></span>
                <svg className="w-4 h-4 fill-current relative" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-black text-white leading-tight">Sarah liked your profile</p>
                <p className="text-[9px] text-white/50 font-semibold mt-0.5">2m ago · Match request</p>
              </div>
            </div>
          </div>

          <div className="animate-float-slow">
            <div
              ref={deckRef}
              onMouseMove={handleDeckTilt}
              onMouseLeave={handleDeckTiltLeave}
              className="relative transition-transform duration-150 ease-out will-change-transform"
            >
              <div className="glass-card text-left rounded-[1.75rem] shadow-2xl overflow-hidden border border-white/15 relative">
                <div ref={glareRef} className="glare-overlay" style={{ borderRadius: "0" }}></div>

                <figure className="relative h-[22rem] w-full overflow-hidden bg-base-900">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                    alt="Sarah Jenkins Developer"
                    className="h-full w-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none"></div>

                  {/* top badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white px-3 py-1.5 rounded-full border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
                        Available
                      </span>
                      <span className="w-8 h-8 rounded-full bg-base-950/70 backdrop-blur-md border border-amber-400/40 flex items-center justify-center" title="Gold Verified">
                        <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 1l2.9 2.4 3.7-.7.7 3.7L21.7 9l-1.9 3.2 1.9 3.2-2.4 2.6-.7 3.7-3.7-.7L12 23l-2.9-2.4-3.7.7-.7-3.7L2.3 15.4 4.2 12 2.3 8.8l2.4-2.6.7-3.7 3.7.7L12 1z" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/10">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 7a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        2/4
                      </span>
                      <span className="bg-black/50 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/10">26</span>
                    </div>
                  </div>

                  {/* profile info */}
                  <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-[1.75rem] font-black text-white leading-tight tracking-tight drop-shadow-lg">
                          Sarah <span className="font-light">Jenkins</span>
                        </h3>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Female
                        </p>
                        <p className="text-[11px] font-bold text-primary mt-1 flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Full Stack Engineer @ Stripe
                        </p>
                        <p className="text-[11px] font-semibold text-white/60 mt-0.5 flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                          MIT · 2022
                        </p>
                        <p className="text-[11px] font-semibold text-white/60 mt-0.5 flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Bengaluru, India
                        </p>
                      </div>
                      <div className="flex flex-col items-center bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/10">
                        <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-none">Match</span>
                        <span className="text-lg font-black text-primary leading-none mt-0.5">92%</span>
                      </div>
                    </div>
                  </div>
                </figure>

                <div className="px-5 pt-4 pb-5 space-y-4">
                  <p className="text-sm text-base-content/80 line-clamp-2 leading-relaxed tracking-[-0.01em]">
                    Full-stack engineer specializing in TypeScript and Node.js. I love clean architecture, contributing to open source, and pairing up on ambitious side projects that actually ship.
                  </p>

                  {/* tech stack */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-base-content/40 flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_SKILLS.map((skill) => {
                        const s = MOCK_SKILL_STYLES[skill];
                        return (
                          <span
                            key={skill}
                            className={`inline-flex items-center gap-1 ${s.bg} ${s.text} border ${s.border} text-[11px] font-bold px-2.5 py-1 rounded-lg`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`}></span>
                            {skill}
                          </span>
                        );
                      })}
                      <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg bg-base-300/60 text-base-content/50 border border-base-300">
                        +4
                      </span>
                    </div>
                  </div>

                  {/* profile links */}
                  <div className="flex flex-wrap items-center gap-2">
                    {MOCK_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        title={link.label}
                        aria-label={link.label}
                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
                        style={{ backgroundColor: link.color }}
                      >
                        {link.icon}
                      </a>
                    ))}
                    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-base-800 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Resume
                    </span>
                  </div>

                  <div className="border-t border-base-300/60"></div>

                  {/* actions */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 h-12 px-4 py-3 rounded-2xl border-2 border-base-300 text-base-content/60 font-black text-xs uppercase tracking-wider hover:border-error/60 hover:bg-error/8 hover:text-error active:scale-95 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      Pass
                    </button>
                    <button
                      type="button"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 hover:shadow-amber-500/50 active:scale-95 transition-all duration-200 border-2 border-amber-300/50 flex-shrink-0"
                    >
                      <svg className="w-5 h-5 fill-current animate-heartbeat" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 h-12 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-95 transition-all duration-200 border-none"
                    >
                      Connect
                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </Reveal>

        {/* Tech Marquee */}
        <div className="mt-20 w-full max-w-5xl tech-marquee-mask overflow-hidden">
          <div className="tech-marquee-track items-center gap-4">
            {[...TECHS, ...TECHS].map((t, i) => (
              <span
                key={`${t.name}-${i}`}
                className={`glass-card shrink-0 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-bold ${t.color} whitespace-nowrap`}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CODE WORD CONSTELLATION ════════════ */}
      <section className="relative border-y border-white/5 bg-base-900/40 py-16 overflow-hidden">
        <div className="absolute -top-20 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-[0.3em] text-primary mb-10">
              Find your flow on DevTinder
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              {/* constellation path */}
              <div className="hidden md:block absolute top-1/2 left-[4%] right-[4%] border-t-2 border-dashed border-white/10"></div>
              <div className="hidden md:block absolute top-1/2 left-[4%] right-[4%] h-px bg-gradient-to-r from-rose-500/40 via-purple-500/40 to-cyan-400/40 animate-pulse-glow"></div>

              <div className="relative flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-5">
                {TICKER_WORDS.map((w, i) => (
                  <div key={w} className={`relative ${i % 2 === 0 ? "md:-translate-y-3" : "md:translate-y-4"}`}>
                    <div className="word-bob" style={{ animationDelay: `${-i * 0.9}s` }}>
                      <span className={`word-chip glass-card rounded-2xl px-5 sm:px-6 py-3 sm:py-3.5 border border-white/15 shadow-xl ${
                        i % 2 === 0 ? "word-chip--a" : "word-chip--b"
                      }`}>
                        {w}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <p className="text-sm sm:text-base text-base-content/70 max-w-xl mx-auto mt-10 leading-relaxed">
              Seven ways the community levels up together — from your first match to your final ship.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section className="relative border-t border-white/5 bg-base-900/40 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <CountStat key={s.label} end={s.end} suffix={s.suffix} decimals={s.decimals} label={s.label} gradient={s.gradient} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" className="relative py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">How it Works</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
              Three steps to your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                dream team
              </span>
            </h3>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px border-t-2 border-dashed border-white/10"></div>

            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-[1.5px] shadow-xl shadow-primary/25">
                      <div className="w-full h-full rounded-[calc(2rem-2px)] bg-base-950 flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[11px] font-black flex items-center justify-center shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-white">{step.title}</h4>
                  <p className="text-sm text-base-content/65 leading-relaxed mt-2 max-w-xs">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="relative border-t border-white/5 bg-base-900/40 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">Why DevTinder?</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
              Designed Exclusively for{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Software Engineers
              </span>
            </h3>
            <p className="text-sm sm:text-base text-base-content/65 max-w-xl mx-auto mt-4">
              Stop searching random forums. Find verified developer matches based on tech stack affinity, coding goals, and active availability.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="sweep-card glass-card p-8 rounded-3xl space-y-4 border border-white/10 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} ${f.glow} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h4 className="text-xl font-black text-white">{f.title}</h4>
                  <p className="text-sm text-base-content/70 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="relative border-t border-white/5 bg-base-900/40 py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">Pricing</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
              Pick your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                dev pass
              </span>
            </h3>
            <p className="text-sm sm:text-base text-base-content/65 max-w-xl mx-auto mt-4">
              Start free forever. Upgrade only when you're ready for direct chat and priority visibility.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS.map((p, i) => (
              <Reveal key={p.key} delay={i * 120} className="h-full">
                <div className={`relative h-full rounded-3xl p-[1.5px] ${p.popular ? "border-animated shadow-[0_30px_90px_-30px_rgba(245,158,11,0.35)]" : "bg-white/10"}`}>
                  <div className={`sweep-card glass-card rounded-[calc(1.5rem-1.5px)] h-full p-8 flex flex-col transition-all duration-300 ${p.popular ? "hover:-translate-y-2" : "hover:-translate-y-1.5"} hover:shadow-2xl`}>
                    {p.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Most Popular
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.gradient} ${p.glow} shadow-lg flex items-center justify-center`}>
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white leading-tight">{p.name}</h4>
                        <p className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider mt-0.5">{p.period}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end gap-1.5">
                      <span className={`text-4xl font-black leading-none ${p.popular ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400" : "text-white"}`}>
                        {p.price}
                      </span>
                      <span className="text-xs text-base-content/50 font-bold pb-0.5">/ {p.period}</span>
                    </div>
                    <p className="text-xs text-base-content/65 leading-relaxed mt-3">{p.tagline}</p>

                    <div className="border-t border-white/5 my-5"></div>

                    <ul className="space-y-2.5 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-base-content/80">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/login"
                      className={`mt-8 btn w-full rounded-2xl font-black text-xs uppercase tracking-wider h-12 transition-all ${
                        p.popular
                          ? "btn-primary btn-shine bg-gradient-to-r from-amber-400 to-orange-500 border-none text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105"
                          : "bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                      }`}
                    >
                      {p.cta}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="relative max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="border-animated p-[1.5px] rounded-[2rem] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="glass-panel rounded-[calc(2rem-1.5px)] overflow-hidden relative p-10 sm:p-16 text-center space-y-6">
              <div className="absolute -top-12 -left-12 w-56 h-56 bg-primary/25 rounded-full blur-3xl pointer-events-none animate-aurora"></div>
              <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-secondary/25 rounded-full blur-3xl pointer-events-none animate-aurora" style={{ animationDelay: "-8s" }}></div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Free forever for developers
              </div>

              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Ready to Find Your{" "}
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Next Coding Partner?
                </span>
              </h3>
              <p className="text-sm sm:text-base text-base-content/75 max-w-xl mx-auto leading-relaxed">
                Join thousands of developers matching, pair programming, and shipping projects together on DevTinder.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white px-10 rounded-2xl h-14 font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <span>Join DevTinder Today</span>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Landing;
