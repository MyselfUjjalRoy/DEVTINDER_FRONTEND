import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import confetti from "canvas-confetti";
import { MembershipBadge, getTier } from "../utils/membershipUtils";

const PLANS = [
  {
    key: "Silver",
    name: "Silver Dev Pass",
    tagline: "For developers getting started with premium networking.",
    price: 300,
    period: "3 Months",
    cta: "Upgrade to Silver Pass",
    features: [
      "Direct socket chat with matched developers",
      "100 connection requests daily",
      "Silver Developer badge on your profile",
      "Boosted feed placement",
    ],
  },
  {
    key: "Gold",
    name: "Gold Pro Pass",
    tagline: "Everything in Silver, maxed out for serious matchmaking.",
    price: 700,
    period: "6 Months",
    cta: "Upgrade to Gold Pass",
    popular: true,
    features: [
      "Direct chat with unlimited messages",
      "Unlimited daily connection requests",
      "Gold Verified badge on your profile",
      "Top placement in Developer Feed deck",
      "Priority profile views & insights",
    ],
  },
];

const COMPARISON = [
  {
    label: "Daily connection requests",
    tint: "bg-rose-500/10 text-rose-300",
    type: "meter",
    free: { value: 10, label: "10" },
    silver: { value: 100, label: "100" },
    gold: { value: Infinity, label: "Unlimited" },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    label: "Direct chat with matches",
    tint: "bg-pink-500/10 text-pink-300",
    type: "bool",
    free: false,
    silver: true,
    gold: "Unlimited messages",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-9 5l2-2h9a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Verified profile badge",
    tint: "bg-amber-500/10 text-amber-300",
    type: "badge",
    free: false,
    silver: "silver",
    gold: "gold",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Feed deck placement",
    tint: "bg-indigo-500/10 text-indigo-300",
    type: "text",
    free: "Standard",
    silver: "Boosted",
    gold: "Top ranking",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
      </svg>
    ),
  },
  {
    label: "Profile views on you",
    tint: "bg-sky-500/10 text-sky-300",
    type: "text",
    free: "Basic",
    silver: "Enhanced",
    gold: "Priority",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    label: "Cancel anytime",
    tint: "bg-emerald-500/10 text-emerald-300",
    type: "bool",
    free: false,
    silver: true,
    gold: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

const CheckIcon = ({ className = "text-secondary" }) => (
  <svg className={`w-5 h-5 shrink-0 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const PlanCard = ({ plan, onBuy }) => {
  const popular = plan.popular;
  return (
    <div
      className={`relative glass-card p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
        popular
          ? "border-2 border-amber-500/40 glow-primary hover:border-amber-400"
          : "border border-white/10 hover:border-secondary/40"
      } overflow-hidden`}
    >
      {popular && (
        <>
          <div className="absolute top-5 -right-10 rotate-45 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black uppercase px-12 py-1 tracking-wider shadow-lg pointer-events-none">
            Most Popular
          </div>
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs uppercase font-black tracking-widest text-white">
              {plan.name}
            </h2>
            {popular && <MembershipBadge membershipType="Gold" isPremium size="sm" />}
          </div>
          <p className="text-[11px] text-base-content/60 mt-1.5">{plan.tagline}</p>
          <div className="flex items-baseline gap-1 mt-4 text-white">
            <span className="text-5xl font-black">₹{plan.price}</span>
            <span className="text-xs text-base-content/50 font-bold">/ {plan.period}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                popular
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-secondary/10 text-secondary border border-secondary/30"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {popular ? "Best Value · 6 Months" : "Starter Premium"}
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5" />

        <ul className="space-y-3.5 text-xs font-medium">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckIcon className={popular ? "text-amber-400" : "text-secondary"} />
              <span className={popular ? "text-white font-semibold" : "text-base-content/85"}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onBuy(plan.key)}
        className={`btn w-full rounded-2xl font-black text-xs uppercase tracking-wider mt-8 h-12 transition-all ${
          popular
            ? "btn-primary bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-none shadow-xl shadow-amber-500/25 hover:scale-105"
            : "btn-outline border-white/20 text-white hover:bg-white/10"
        }`}
      >
        {plan.cta}
      </button>
    </div>
  );
};

const YesCell = ({ gold }) => (
  <span
    className={`inline-flex items-center justify-center w-6 h-6 rounded-full border shadow-[0_0_14px_rgba(52,211,153,0.25)] ${
      gold
        ? "bg-amber-400/15 border-amber-400/40 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.25)]"
        : "bg-emerald-400/15 border-emerald-400/40 text-emerald-400"
    }`}
  >
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  </span>
);

const NoCell = () => (
  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-600">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </span>
);

const MeterCell = ({ value, label, gold }) => {
  const isUnlimited = value === Infinity;
  const pct = isUnlimited ? 100 : Math.min(100, Math.round((value / 100) * 100));
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <span className={`text-[10px] font-black leading-none ${gold ? "text-amber-300" : "text-white"}`}>
        {isUnlimited ? "∞" : label}
      </span>
      <div className="h-1.5 w-16 sm:w-20 rounded-full bg-white/[0.06] overflow-hidden">
        {isUnlimited ? (
          <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-pulse" />
        ) : (
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
        {isUnlimited ? "unlimited" : "daily"}
      </span>
    </div>
  );
};

const BadgeCell = ({ tier }) =>
  tier === "gold" ? (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/40 rounded-full px-2.5 py-1">
      👑 Gold
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-200 bg-slate-400/10 border border-slate-300/30 rounded-full px-2.5 py-1">
      🥈 Silver
    </span>
  );

const TextCell = ({ value, gold }) => (
  <span
    className={`text-[10px] sm:text-[11px] font-bold ${
      gold ? "text-amber-300" : "text-slate-200"
    }`}
  >
    {value}
  </span>
);

const ValueCell = ({ value, gold }) => {
  if (typeof value === "boolean") return value ? <YesCell gold={gold} /> : <NoCell />;
  if (value && typeof value === "object" && "value" in value) {
    return <MeterCell value={value.value} label={value.label} gold={gold} />;
  }
  if (value === "silver" || value === "gold") return <BadgeCell tier={value} />;
  return <TextCell value={value} gold={gold} />;
};

const ComparisonTable = () => (
  <div className="mt-16 max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Feature Comparison
      </span>
      <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">
        Compare{" "}
        <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
          Plans
        </span>
      </h2>
      <p className="text-xs text-base-content/60 mt-2">
        Every plan includes secure Stripe checkout and cancel-anytime flexibility.
      </p>
    </div>

    <div className="relative">
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-b from-amber-500/10 to-transparent blur-2xl" />
      <div className="relative glass-card rounded-3xl border border-white/10 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-500" />
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="p-5 font-black text-slate-400 uppercase tracking-wider text-[10px]">
                  Features
                </th>
                <th className="p-5 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Free
                  </span>
                </th>
                <th className="p-5 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    🥈 Silver
                  </span>
                </th>
                <th className="p-5 text-center bg-amber-500/[0.08]">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    👑 Gold
                  </span>
                  <span className="mt-2 block mx-auto w-fit bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/30">
                    Most Popular
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr
                  key={row.label}
                  className="group border-t border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <td className="p-4 pl-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${row.tint}`}
                      >
                        {row.icon}
                      </span>
                      <span className="text-xs font-bold text-white/85">{row.label}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <ValueCell value={row.free} />
                  </td>
                  <td className="p-4 text-center">
                    <ValueCell value={row.silver} />
                  </td>
                  <td className="p-4 text-center bg-gradient-to-b from-amber-500/[0.10] via-amber-500/[0.04] to-transparent border-l border-r border-amber-500/10">
                    <ValueCell value={row.gold} gold />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const TrustFooter = () => (
  <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
    <span className="flex items-center gap-2">
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      Secure Stripe checkout
    </span>
    <span className="flex items-center gap-2">
      <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Cancel anytime
    </span>
    <span className="flex items-center gap-2">
      <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      No hidden fees
    </span>
  </div>
);

const Premium = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const sessionId = searchParams.get("session_id");

  const [isUserPremium, setIsUserPremium] = useState(false);
  const [userMembershipType, setUserMembershipType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(paymentStatus === "cancel");
  const dispatch = useDispatch();
  const loggedInUser = useSelector((store) => store.user);

  const fireConfetti = () => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 1000,
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ["#f59e0b", "#fbbf24", "#d97706", "#ffffff"],
      });
      fire(0.2, {
        spread: 60,
        colors: ["#e2e8f0", "#94a3b8", "#f59e0b"],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        colors: ["#fbbf24", "#ffffff"],
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch (e) {
      console.log("Confetti trigger error:", e);
    }
  };

  useEffect(() => {
    const verifyAndSync = async () => {
      try {
        if (paymentStatus === "success" && sessionId) {
          try {
            await axios.post(
              BASE_URL + "payment/verify",
              { sessionId },
              { withCredentials: true }
            );
          } catch (e) {
            console.log("Session verification backup check:", e);
          }
        }

        const res = await axios.get(BASE_URL + "payment/premium/verify", {
          withCredentials: true,
        });
        if (res.data.isPremium) {
          setIsUserPremium(true);
          setUserMembershipType(res.data.membershipType);
          if (res.data.user) {
            dispatch(addUser(res.data.user));
          }
        }
      } catch (err) {
        console.error("Failed to verify premium status:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyAndSync();
  }, [paymentStatus, sessionId, dispatch]);

  useEffect(() => {
    if (paymentStatus === "success") {
      fireConfetti();
    }
  }, [paymentStatus]);

  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => {
        setShowErrorToast(false);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("payment");
        setSearchParams(newParams);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast, searchParams, setSearchParams]);

  const handleBuyClick = async (type) => {
    try {
      const res = await axios.post(
        BASE_URL + "payment/create",
        { membershipType: type },
        { withCredentials: true }
      );
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      console.error("Payment initiation failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const activeType = userMembershipType || loggedInUser?.membershipType || "Gold";
  const activeTier = getTier(activeType, true);

  if (paymentStatus === "success") {
    return (
      <div className="flex justify-center items-center min-h-[75vh] p-4 animate-slide-up">
        <div className={`glass-card max-w-lg text-center p-8 sm:p-10 rounded-3xl border ${activeTier === "silver" ? "border-slate-300/40 shadow-slate-300/20" : "border-amber-500/40 shadow-amber-500/20"} shadow-2xl space-y-6 relative overflow-hidden`}>
          
          <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-amber-300/20 rounded-full flex items-center justify-center border border-amber-500/40 shadow-xl animate-pulse">
            <span className="text-4xl">👑</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <MembershipBadge membershipType={activeType} isPremium={true} size="lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome to DevTinder {activeTier === "silver" ? "Silver" : "Gold"}!
            </h1>
            <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed">
              Your VIP Membership is active! You now enjoy direct developer socket chat, verified badges, and top feed placement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={fireConfetti}
              className="btn btn-outline border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-2xl font-bold text-xs"
            >
              🎉 Fire Confetti!
            </button>
            <Link
              to="/feed"
              className="btn btn-primary bg-gradient-to-r from-amber-500 to-yellow-400 border-none text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 hover:scale-105 transition-all flex items-center justify-center"
            >
              Start Swiping Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isUserPremium) {
    return (
      <div className="flex justify-center items-center min-h-[75vh] p-4 animate-slide-up">
        <div className={`glass-card max-w-lg text-center p-8 sm:p-10 rounded-3xl border ${activeTier === "silver" ? "border-slate-300/40 shadow-slate-300/20" : "border-amber-500/40 shadow-amber-500/20"} shadow-2xl space-y-6`}>
          <div className="mx-auto w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/40 shadow-lg">
            <span className="text-3xl">👑</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <MembershipBadge membershipType={activeType} isPremium={true} size="lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              VIP Pass Active
            </h1>
            <p className="text-xs text-base-content/75 leading-relaxed">
              Your account has full DevTinder Pro perks including priority card indexing, direct socket chat, and verified member badges.
            </p>
          </div>

          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-none w-full rounded-2xl font-black text-xs uppercase tracking-wider h-12 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
          >
            Explore Developer Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {showErrorToast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert bg-error/90 text-white rounded-2xl shadow-xl border border-error/30 font-bold text-xs flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Payment checkout cancelled. You can retry anytime.</span>
          </div>
        </div>
      )}

      <div className="text-center mb-14">
        <span className="badge bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-black uppercase tracking-widest py-2 px-4 mb-3">
          DevTinder Pro Membership
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Unlock Unlimited Matchmaking
        </h1>
        <p className="text-xs sm:text-sm text-base-content/65 max-w-xl mx-auto mt-3">
          Get direct developer chat access, gold verification badges, and top-ranking feed placement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} onBuy={handleBuyClick} />
        ))}
      </div>

      <ComparisonTable />
      <TrustFooter />
    </div>
  );
};

export default Premium;
