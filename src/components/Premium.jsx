import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import confetti from "canvas-confetti";
import { MembershipBadge, getTier } from "../utils/membershipUtils";

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
      // Golden / Silver Fireworks burst
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
        // If coming back from Stripe checkout with session_id
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
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Silver Plan Card */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-secondary/40 transition-all duration-300 relative group">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs uppercase font-black tracking-widest text-secondary">
                Silver Dev Pass
              </h2>
              <div className="flex items-baseline gap-1 mt-3 text-white">
                <span className="text-5xl font-black">$9.99</span>
                <span className="text-xs text-base-content/50 font-bold">/ 3 Months</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4"></div>

            <ul className="space-y-3.5 text-xs text-base-content/85 font-medium">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Direct socket chat with matched developers</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>100 Connection Requests daily</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Silver Developer badge</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleBuyClick("Silver")}
            className="btn btn-outline border-white/20 text-white hover:bg-white/10 w-full rounded-2xl font-black text-xs uppercase tracking-wider mt-8 h-12 transition-all"
          >
            Upgrade to Silver Pass
          </button>
        </div>

        {/* Gold Plan Card */}
        <div className="glass-card p-8 rounded-3xl border-2 border-amber-500/40 flex flex-col justify-between hover:border-amber-400 transition-all duration-300 relative group glow-primary">
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-lg pointer-events-none">
            Most Popular ★
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs uppercase font-black tracking-widest text-amber-400">
                Gold Pro Pass
              </h2>
              <div className="flex items-baseline gap-1 mt-3 text-white">
                <span className="text-5xl font-black">$19.99</span>
                <span className="text-xs text-base-content/50 font-bold">/ 6 Months</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4"></div>

            <ul className="space-y-3.5 text-xs text-white font-semibold">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Direct chat + Unlimited messages</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited daily connection requests</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Gold Verified badge on your profile</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Top placement in Developer Feed deck</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleBuyClick("Gold")}
            className="btn btn-primary bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-none w-full rounded-2xl font-black text-xs uppercase tracking-wider mt-8 h-12 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
          >
            Upgrade to Gold Pass ★
          </button>
        </div>

      </div>
    </div>
  );
};

export default Premium;
