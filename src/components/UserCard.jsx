import { useState, useRef, useEffect } from "react";
import { MembershipBadge, getCardGlowStyle } from "../utils/membershipUtils";
import { resolveMediaUrl, getProfileLink } from "../utils/constants";
import { getSkillStyle } from "../utils/skillStyles";
import { PlatformIcon, BRAND_COLORS, LINK_LABELS } from "../utils/profileLinks";
import MediaImage from "./MediaImage";
import MatchBadge from "./MatchBadge";

const GENDER_GLYPH = {
  Male: { symbol: "♂", tint: "from-sky-400 to-blue-600", glow: "rgba(56,189,248,0.55)" },
  Female: { symbol: "♀", tint: "from-pink-400 to-rose-600", glow: "rgba(244,114,182,0.55)" },
  Others: { symbol: "⚧", tint: "from-violet-400 to-purple-600", glow: "rgba(167,139,250,0.55)" },
};

const SWIPE_THRESHOLD = 100;

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

const StarParticle = () => {
  const style = {
    left: `${10 + Math.random() * 80}%`,
    width: `${10 + Math.random() * 18}px`,
    height: `${10 + Math.random() * 18}px`,
    animationDelay: `${Math.random() * 0.3}s`,
    animationDuration: `${0.9 + Math.random() * 0.6}s`,
    color: ["#fbbf24", "#f59e0b", "#fcd34d", "#f97316", "#fff7ed"][Math.floor(Math.random() * 5)],
  };
  return (
    <span className="heart-particle" style={style}>
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </span>
  );
};

const UserCard = ({
  user,
  onSwipe,
  preview = false,
  superLikesRemaining = null,
  isViewerPremium = false,
  onSuperConnect = null,
  onSuperExit = null,
}) => {
  if (!user) return null;
  const { firstName, lastName, photoURL, photos, age, gender, about, skills, membershipType, isPremium, location, isStudent, education, work, codingProfiles, github, linkedin, portfolio, resumeURL } = user;

  const profileLinks = [
    { platform: "github", value: github },
    { platform: "linkedin", value: linkedin },
    { platform: "portfolio", value: portfolio },
    { platform: "leetcode", value: codingProfiles?.leetcode },
    { platform: "gfg", value: codingProfiles?.gfg },
    { platform: "codeforces", value: codingProfiles?.codeforces },
    { platform: "codechef", value: codingProfiles?.codechef },
    { platform: "hackerrank", value: codingProfiles?.hackerrank },
    { platform: "codingninjas", value: codingProfiles?.codingninjas },
  ].filter((l) => l.value && l.value.trim());

  const headline = (() => {
    if (isStudent) {
      if (education?.degree) return education.degree;
      if (work?.role) return work.company ? `${work.role} @ ${work.company}` : work.role;
      return null;
    }
    if (work?.role) return work.company ? `${work.role} @ ${work.company}` : work.role;
    if (education?.degree) return education.degree;
    return null;
  })();

  const institution = education?.college
    ? education.passingYear
      ? `${education.college} · ${education.passingYear}`
      : education.college
    : null;

  const locationText = [location?.city, location?.country].filter(Boolean).join(", ");

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
  const [superBurst, setSuperBurst] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [superPending, setSuperPending] = useState(false);

  const allPhotos = [];
  if (photoURL) allPhotos.push(photoURL);
  if (Array.isArray(photos)) allPhotos.push(...photos.filter(Boolean));
  const totalPhotos = allPhotos.length;
  const currentIdx = totalPhotos ? Math.min(photoIdx, totalPhotos - 1) : 0;
  const mainPhotoSrc = totalPhotos > 0
    ? resolveMediaUrl(allPhotos[currentIdx])
    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80";

  useEffect(() => { onSwipeRef.current = onSwipe; }, [onSwipe]);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  useEffect(() => {
    if (totalPhotos > 0 && photoIdx >= totalPhotos) setPhotoIdx(totalPhotos - 1);
  }, [totalPhotos, photoIdx]);

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
    if (preview || isExiting.current) return;
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
    if (preview || isExiting.current) return;
    const exitX = dir === "right" ? 700 : -700;
    isExiting.current = true;
    setSwipeDir(dir);
    if (dir === "right") setShowHearts(true);
    animateTo(exitX, 0, "transform 0.35s ease-in, opacity 0.3s ease-in", 0);
    setTimeout(() => {
      if (mountedRef.current) onSwipeRef.current(dir);
    }, 380);
  };

  const handleSuperConnectClick = async () => {
    if (preview || isExiting.current || superPending) return;
    if (!onSuperConnect) {
      handleButtonSwipe("right");
      return;
    }
    setSuperPending(true);
    try {
      const ok = await onSuperConnect(user);
      if (!ok) return;
      isExiting.current = true;
      setSwipeDir("right");
      setShowHearts(true);
      setSuperBurst(true);
      animateTo(700, 0, "transform 0.35s ease-in, opacity 0.3s ease-in", 0);
      setTimeout(() => {
        if (mountedRef.current && onSuperExit) onSuperExit(user._id);
      }, 380);
    } catch (err) {
      console.error("Super connect error:", err);
    } finally {
      setSuperPending(false);
    }
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
      {superBurst && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }, (_, i) => (
            <StarParticle key={i} />
          ))}
        </div>
      )}
      {swipeDir === "left" && <div className="stamp nope-stamp">NOPE</div>}
      {swipeDir === "right" && <div className="stamp like-stamp">LIKE</div>}

      <figure className="relative h-[15rem] sm:h-[19rem] lg:h-[22rem] w-full overflow-hidden">
        <MediaImage
          src={mainPhotoSrc}
          alt={`${firstName} ${lastName}`}
          className="h-full w-full object-cover select-none transition-transform duration-700"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
        {totalPhotos > 1 && currentIdx > 0 && (
          <button
            type="button"
            title="Previous photo"
            aria-label="Previous photo"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIdx((i) => Math.max(0, i - 1));
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg hover:bg-black/70 hover:scale-110 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {totalPhotos > 1 && currentIdx < totalPhotos - 1 && (
          <button
            type="button"
            title="Next photo"
            aria-label="Next photo"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIdx((i) => Math.min(totalPhotos - 1, i + 1));
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg hover:bg-black/70 hover:scale-110 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <MatchBadge score={user.score} breakdown={user.breakdown} reasons={user.reasons} />
            {user.starredYou && (
              <span
                title="This developer super connected with your profile"
                className="flex items-center gap-1.5 bg-amber-400/25 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-amber-400/60 animate-pulse shadow-lg shadow-amber-500/20"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Starred You
              </span>
            )}
            <MembershipBadge membershipType={membershipType} isPremium={isPremium} size="sm" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {totalPhotos > 1 && (
              <span
                title={`Photo ${currentIdx + 1} of ${totalPhotos}`}
                className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 7a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                {currentIdx + 1}/{totalPhotos}
              </span>
            )}
            {age && (
              <span
                title={`${age} years old`}
                className="flex items-center gap-1.5 rounded-full p-[1.5px] bg-gradient-to-br from-rose-400 via-fuchsia-500 to-amber-400 shadow-[0_0_16px_rgba(244,114,182,0.45)]"
              >
                <span className="flex items-center gap-1.5 bg-[#0d0a18]/90 backdrop-blur-md rounded-full pl-2.5 pr-3 py-1.5 text-white text-xs font-black leading-none">
                  <svg className="w-3.5 h-3.5 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {age}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[1.75rem] font-black text-white leading-tight tracking-tight drop-shadow-lg">
                  {firstName} <span className="font-light">{lastName}</span>
                </h2>
                {gender && (() => {
                  const g = GENDER_GLYPH[gender];
                  if (!g) return null;
                  return (
                    <span
                      title={gender}
                      aria-label={gender}
                      className={`gender-badge flex items-center justify-center w-[1.55rem] h-[1.55rem] shrink-0 rounded-full bg-gradient-to-br ${g.tint} text-white text-base font-bold leading-none`}
                      style={{ boxShadow: `0 0 14px ${g.glow}, 0 4px 12px rgba(0,0,0,0.45)` }}
                    >
                      {g.symbol}
                    </span>
                  );
                })()}
              </div>
              {headline && (
                <p className="text-[11px] font-bold text-primary mt-1 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {headline}
                </p>
              )}
              {institution && (
                <p className="text-[11px] font-semibold text-white/60 mt-0.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                  {institution}
                </p>
              )}
              {locationText && (
                <p className="text-[11px] font-semibold text-white/60 mt-0.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locationText}
                </p>
              )}
            </div>
            {(isViewerPremium || superLikesRemaining !== null) && (
              <div className="flex flex-col items-center bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2 border border-amber-400/40 shadow-[0_0_18px_rgba(251,191,36,0.3)]">
                <span className="flex items-center gap-1 text-[9px] text-amber-200/80 font-black uppercase tracking-widest leading-none">
                  <svg className="w-2.5 h-2.5 fill-current text-amber-300" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Super
                </span>
                <span
                  className={`text-lg font-black leading-none mt-1 ${
                    isViewerPremium || superLikesRemaining > 0
                      ? "text-amber-300"
                      : "text-white/40"
                  }`}
                >
                  {isViewerPremium ? "∞" : superLikesRemaining}
                </span>
              </div>
            )}
          </div>
        </div>
      </figure>
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
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
        {(profileLinks.length > 0 || resumeURL) && (
          <div className="flex flex-wrap items-center gap-2">
            {profileLinks.map((link) => {
              const href = getProfileLink(link.value.trim(), link.platform);
              if (!href) return null;
              const brandColor = BRAND_COLORS[link.platform] || "#0ea5e9";
              const label = LINK_LABELS[link.platform] || link.platform;
              return (
                <a
                  key={link.platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: brandColor }}
                  className="w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
                >
                  <PlatformIcon platform={link.platform} />
                </a>
              );
            })}
            {resumeURL && (
              <a
                href={resolveMediaUrl(resumeURL)}
                target="_blank"
                rel="noopener noreferrer"
                title="View Resume"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="group/resume relative overflow-hidden inline-flex items-center gap-1.5 h-8 pl-2.5 pr-2 rounded-lg
                           bg-gradient-to-br from-primary to-secondary text-white text-[10px] font-black uppercase tracking-wider
                           shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95
                           transition-all duration-200"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/resume:translate-x-full transition-transform duration-700" />
                <svg className="w-3.5 h-3.5 relative shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M12 18v-6" />
                  <path d="M9 15h6" />
                </svg>
                Resume
                <svg className="w-3 h-3 relative shrink-0 transition-transform group-hover/resume:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>
        )}
        <div className="border-t border-base-300/60" />
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => handleButtonSwipe("left")}
            title="Pass (← Arrow Key)"
            className="group/pass relative flex-1 flex items-center justify-center gap-2 h-12 px-4 py-3 rounded-2xl overflow-hidden
                       bg-gradient-to-r from-rose-600 to-red-500 text-white
                       font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30
                       hover:shadow-rose-600/50 hover:scale-[1.03] active:scale-95
                       transition-all duration-200 border-none"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/pass:translate-x-full transition-transform duration-700" />
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center
                            group-hover/pass:bg-white/25 group-hover/pass:scale-110
                            transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            Pass
          </button>
          <button
            onClick={handleSuperConnectClick}
            disabled={!isViewerPremium && superLikesRemaining === 0}
            title={
              isViewerPremium
                ? "Super Connect — Unlimited (premium)"
                : superLikesRemaining > 0
                  ? `Super Connect (${superLikesRemaining} left today)`
                  : "Super Connect — Daily limit reached. Go premium for unlimited!"
            }
            className={`relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              superPending ? "opacity-60 pointer-events-none" : ""
            } ${
              !isViewerPremium && superLikesRemaining === 0
                ? "bg-gradient-to-br from-base-400 to-base-500 text-base-content/40 border-2 border-base-600/50 cursor-not-allowed"
                : "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-2 border-amber-300/50 shadow-lg shadow-amber-500/30 hover:scale-110 hover:shadow-amber-500/50 active:scale-95"
            }`}
          >
            {!isViewerPremium && superLikesRemaining === 0 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current animate-heartbeat" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
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
