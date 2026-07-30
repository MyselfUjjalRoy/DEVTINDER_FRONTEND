import { useState, useRef, useEffect } from "react";
import { MembershipBadge, getCardGlowStyle } from "../utils/membershipUtils";

const SWIPE_THRESHOLD = 100;

const getSkillStyle = (skill) => {
  const s = skill.toLowerCase();
  if (s.includes("react") || s.includes("next"))
    return { bg: "bg-cyan-500/15", text: "text-cyan-500", border: "border-cyan-500/30", dot: "bg-cyan-400" };
  if (s.includes("node") || s.includes("express") || s.includes("mongo"))
    return { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30", dot: "bg-emerald-400" };
  if (s.includes("python") || s.includes("django") || s.includes("fastapi"))
    return { bg: "bg-yellow-500/15", text: "text-yellow-500", border: "border-yellow-500/30", dot: "bg-yellow-400" };
  if (s.includes("typescript") || s.includes("ts"))
    return { bg: "bg-sky-500/15", text: "text-sky-500", border: "border-sky-500/30", dot: "bg-sky-400" };
  if (s.includes("javascript") || s.includes("js"))
    return { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30", dot: "bg-amber-400" };
  if (s.includes("java") || s.includes("spring") || s.includes("kotlin"))
    return { bg: "bg-orange-500/15", text: "text-orange-500", border: "border-orange-500/30", dot: "bg-orange-400" };
  if (s.includes("aws") || s.includes("cloud") || s.includes("docker") || s.includes("devops"))
    return { bg: "bg-purple-500/15", text: "text-purple-500", border: "border-purple-500/30", dot: "bg-purple-400" };
  if (s.includes("flutter") || s.includes("dart") || s.includes("swift") || s.includes("ios"))
    return { bg: "bg-blue-500/15", text: "text-blue-500", border: "border-blue-500/30", dot: "bg-blue-400" };
  return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/25", dot: "bg-primary" };
};

const HeartParticle = () => {
  const style = {
    left: `${10 + Math.random() * 80}%`,
    width: `${8 + Math.random() * 16}px`,
    height: `${8 + Math.random() * 16}px`,
    animationDelay: `${Math.random() * 0.3}s`,
    animationDuration: `${0.8 + Math.random() * 0.6}s`,
    color: ["#ff2d55", "#ff6b8a", "#ffd60a", "#bf5af2", "#30d158"][Math.floor(Math.random() * 5)],
  };
  return (
    <span className="heart-particle" style={style}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </span>
  );
};

const UserCard = ({ user, onSwipe }) => {
  if (!user) return null;
  const { firstName, lastName, photoURL, age, gender, about, skills, membershipType, isPremium } = user;

  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragX = useRef(0);
  const dragY = useRef(0);
  const isExiting = useRef(false);
  const onSwipeRef = useRef(onSwipe);
  const mountedRef = useRef(true);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [swipeDir, setSwipeDir] = useState(null);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => { onSwipeRef.current = onSwipe; }, [onSwipe]);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const animateTo = (x, y, transition, opacity) => {
    if (!cardRef.current) return;
    const rot = x * 0.08;
    cardRef.current.style.transition = transition;
    cardRef.current.style.transform = `translateX(${x}px) rotate(${rot}deg)`;
    if (opacity !== undefined) cardRef.current.style.opacity = opacity;
  };

  const resetCard = () => {
    animateTo(0, 0, "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease");
  };

  const handlePointerDown = (clientX, clientY) => {
    if (isExiting.current) return;
    isDragging.current = true;
    startPos.current = { x: clientX, y: clientY };
    dragX.current = 0;
    dragY.current = 0;
    if (cardRef.current) cardRef.current.style.transition = "none";
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDragging.current) return;
    const dx = clientX - startPos.current.x;
    const dy = clientY - startPos.current.y;
    dragX.current = dx;
    dragY.current = dy;
    setPos({ x: dx, y: dy });
    if (!cardRef.current) return;
    const rot = dx * 0.08;
    const op = Math.max(0.5, 1 - Math.abs(dx) / 400);
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = op;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = dragX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      const dir = dx > 0 ? "right" : "left";
      const exitX = dir === "right" ? 700 : -700;
      isExiting.current = true;
      setSwipeDir(dir);
      if (dir === "right") setShowHearts(true);
      animateTo(exitX, 0, "transform 0.35s ease-in, opacity 0.3s ease-in", 0);
      setTimeout(() => {
        if (mountedRef.current) onSwipeRef.current(dir);
      }, 380);
    } else {
      resetCard();
      setPos({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e) => {
      const t = e.touches[0];
      handlePointerMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => handlePointerUp();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const handleButtonSwipe = (dir) => {
    if (isExiting.current) return;
    const exitX = dir === "right" ? 700 : -700;
    isExiting.current = true;
    setSwipeDir(dir);
    if (dir === "right") setShowHearts(true);
    animateTo(exitX, 0, "transform 0.35s ease-in, opacity 0.3s ease-in", 0);
    setTimeout(() => {
      if (mountedRef.current) onSwipeRef.current(dir);
    }, 380);
  };

  const dirIndicator = pos.x > 50 ? "right" : pos.x < -50 ? "left" : null;
  const dirOpacity = Math.min(1, Math.abs(pos.x) / 150);

  const skillList = (() => {
    if (!skills) return [];
    const arr = Array.isArray(skills) ? skills : typeof skills === "string" ? skills.split(",").map((s) => s.trim()) : [];
    return arr.filter((s) => s.length > 0);
  })();

  return (
    <div
      ref={cardRef}
      className={`dev-card relative select-none ${swipeDir ? "pointer-events-none" : ""} ${getCardGlowStyle(user)}`}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        const t = e.touches[0];
        handlePointerDown(t.clientX, t.clientY);
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {dirIndicator === "left" && (
        <div className="absolute top-8 right-8 z-30 -rotate-[15deg] pointer-events-none" style={{ opacity: dirOpacity }}>
          <span className="text-5xl sm:text-6xl font-black text-red-500/90 border-[5px] border-red-500/90 rounded-xl px-3 py-1 leading-none inline-block">
            NOPE
          </span>
        </div>
      )}
      {dirIndicator === "right" && (
        <div className="absolute top-8 left-8 z-30 rotate-[15deg] pointer-events-none" style={{ opacity: dirOpacity }}>
          <span className="text-5xl sm:text-6xl font-black text-emerald-500/90 border-[5px] border-emerald-500/90 rounded-xl px-3 py-1 leading-none inline-block">
            LIKE
          </span>
        </div>
      )}
      {showHearts && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 14 }, (_, i) => (
            <HeartParticle key={i} />
          ))}
        </div>
      )}
      {swipeDir === "left" && <div className="stamp nope-stamp">NOPE</div>}
      {swipeDir === "right" && <div className="stamp like-stamp">LIKE</div>}

      <figure className="relative h-[22rem] w-full overflow-hidden">
        <img
          src={photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80"}
          alt={`${firstName} ${lastName}`}
          className="h-full w-full object-cover select-none transition-transform duration-700"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
              Available
            </span>
            <MembershipBadge membershipType={membershipType} isPremium={isPremium} size="sm" />
          </div>
          {age && (
            <span className="bg-black/50 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/10">
              {age}
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[1.75rem] font-black text-white leading-tight tracking-tight drop-shadow-lg">
                {firstName} <span className="font-light">{lastName}</span>
              </h2>
              {gender && (
                <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {gender}
                </p>
              )}
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
          {about || "Full-stack developer passionate about clean architecture, innovative algorithms, and building experiences that matter."}
        </p>
        {skillList.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-base-content/40 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillList.slice(0, 5).map((skill, idx) => {
                const s = getSkillStyle(skill);
                return (
                  <span key={idx}
                    className={`inline-flex items-center gap-1 ${s.bg} ${s.text} border ${s.border} text-[11px] font-bold px-2.5 py-1 rounded-lg`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                    {skill}
                  </span>
                );
              })}
              {skillList.length > 5 && (
                <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg bg-base-300/60 text-base-content/50 border border-base-300">
                  +{skillList.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="border-t border-base-300/60" />
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => handleButtonSwipe("left")}
            title="Pass (← Arrow Key)"
            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 py-3 rounded-2xl
                       border-2 border-base-300 text-base-content/60 font-black text-xs uppercase tracking-wider
                       hover:border-error/60 hover:bg-error/8 hover:text-error
                       active:scale-95 transition-all duration-200 group/pass"
          >
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center
                            group-hover/pass:bg-error group-hover/pass:border-error group-hover/pass:text-white
                            transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            Pass
          </button>
          <button
            onClick={() => handleButtonSwipe("right")}
            title="Super Connect"
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                       text-white flex items-center justify-center shadow-lg shadow-amber-500/30
                       hover:scale-110 hover:shadow-amber-500/50 active:scale-95
                       transition-all duration-200 border-2 border-amber-300/50 flex-shrink-0"
          >
            <svg className="w-5 h-5 fill-current animate-heartbeat" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0
                1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54
                1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <button
            onClick={() => handleButtonSwipe("right")}
            title="Connect (→ Arrow Key)"
            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 py-3 rounded-2xl
                       bg-gradient-to-r from-primary to-secondary text-white
                       font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30
                       hover:shadow-primary/50 hover:scale-[1.03] active:scale-95
                       transition-all duration-200 border-none group/conn"
          >
            Connect
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center
                            group-hover/conn:bg-white/25 group-hover/conn:scale-110
                            transition-all duration-200">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5
                  3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42
                  22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
