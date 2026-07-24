import React from "react";

export const getTier = (membershipType, isPremium) => {
  if (!isPremium && !membershipType) return null;
  const type = (membershipType || "").toLowerCase();
  if (type.includes("gold")) return "gold";
  if (type.includes("silver")) return "silver";
  // fallback if user is premium but type not specified
  return isPremium ? "gold" : null;
};

export const MembershipBadge = ({ membershipType, isPremium, size = "md", className = "" }) => {
  const tier = getTier(membershipType, isPremium);
  if (!tier) return null;

  const isGoldTier = tier === "gold";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-4 py-1.5 text-sm gap-2",
  }[size] || "px-3 py-1 text-xs gap-1.5";

  if (isGoldTier) {
    return (
      <span
        className={`inline-flex items-center font-black rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-lg shadow-amber-500/10 tracking-wide uppercase ${sizeClasses} ${className}`}
      >
        <span className="animate-bounce inline-block">👑</span>
        <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow">
          GOLD VIP
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-black rounded-full bg-gradient-to-r from-slate-400/20 via-slate-200/10 to-slate-400/20 text-slate-200 border border-slate-300/40 backdrop-blur-md shadow-lg shadow-slate-300/10 tracking-wide uppercase ${sizeClasses} ${className}`}
    >
      <span>🥈</span>
      <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow">
        SILVER VIP
      </span>
    </span>
  );
};

export const getAvatarRingStyle = (user) => {
  if (!user?.isPremium && !user?.membershipType) return "ring-2 ring-primary/40 ring-offset-2 ring-offset-base-900";
  const tier = getTier(user.membershipType, user.isPremium);

  if (tier === "gold") {
    return "ring-2 ring-amber-400 ring-offset-2 ring-offset-base-900 shadow-[0_0_18px_rgba(245,158,11,0.4)]";
  }
  if (tier === "silver") {
    return "ring-2 ring-slate-300 ring-offset-2 ring-offset-base-900 shadow-[0_0_15px_rgba(203,213,225,0.35)]";
  }
  return "ring-2 ring-primary/40 ring-offset-2 ring-offset-base-900";
};

export const getCardGlowStyle = (user) => {
  if (!user?.isPremium && !user?.membershipType) return "border-white/10";
  const tier = getTier(user.membershipType, user.isPremium);

  if (tier === "gold") {
    return "border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-400/60";
  }
  if (tier === "silver") {
    return "border-slate-400/40 shadow-[0_0_20px_rgba(203,213,225,0.15)] hover:border-slate-300/60";
  }
  return "border-white/10";
};
