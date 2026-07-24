import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

const Premium = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [isUserPremium, setIsUserPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(paymentStatus === "cancel");

  useEffect(() => {
    const verifyPremium = async () => {
      try {
        const res = await axios.get(BASE_URL + "payment/premium/verify", {
          withCredentials: true,
        });
        if (res.data.isPremium) {
          setIsUserPremium(true);
        }
      } catch (err) {
        console.error("Failed to verify premium status:", err);
      } finally {
        setLoading(false);
      }
    };
    verifyPremium();
  }, []);

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

  if (paymentStatus === "success") {
    return (
      <div className="flex justify-center items-center min-h-[75vh] p-4">
        <div className="glass-card max-w-md text-center p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="mx-auto w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Pro Pass Activated!</h1>
            <p className="text-sm text-base-content/75 leading-relaxed">
              Congratulations! Your DevTinder Premium Pass is now active. You have full access to unlimited connection requests and verified badges.
            </p>
          </div>
          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full rounded-2xl font-black text-xs uppercase tracking-wider h-12 shadow-xl shadow-primary/25 hover:scale-105 transition-all"
          >
            Start Swiping Feed
          </Link>
        </div>
      </div>
    );
  }

  if (isUserPremium) {
    return (
      <div className="flex justify-center items-center min-h-[75vh] p-4">
        <div className="glass-card max-w-md text-center p-8 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6">
          <div className="mx-auto w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/40">
            <svg className="w-10 h-10 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">DevTinder Premium Active</h1>
            <p className="text-xs text-base-content/75 leading-relaxed">
              Your account has full Pro Pass perks including priority card indexing, direct socket chat, and gold verification.
            </p>
          </div>
          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full rounded-2xl font-black text-xs uppercase tracking-wider h-12 shadow-xl shadow-primary/25 hover:scale-105 transition-all"
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
