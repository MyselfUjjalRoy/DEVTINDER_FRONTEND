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
        // Clear the URL parameter so it doesn't reappear on page refresh
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
        BASE_URL + "payment/createProduct",
        { membershipType: type },
        { withCredentials: true }
      );

      // Redirect user to Stripe-hosted checkout page
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
      <div className="flex justify-center items-center min-h-[70vh] p-4">
        <div className="card bg-base-200 border border-base-300 max-w-md text-center p-8 rounded-3xl shadow-2xl space-y-5">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success">
            <svg
              className="w-8 h-8 fill-none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Payment Successful!</h1>
            <p className="text-sm text-base-content/75 leading-relaxed">
              Thank you for upgrading! Your premium membership has been successfully simulated (Test Mode).
            </p>
          </div>
          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full rounded-2xl font-bold h-12 shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Explore Feed
          </Link>
        </div>
      </div>
    );
  }

  if (isUserPremium) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] p-4">
        <div className="card bg-base-200 border border-base-300 max-w-md text-center p-8 rounded-3xl shadow-2xl space-y-5">
          <div className="mx-auto w-16 h-16 bg-warning/15 rounded-full flex items-center justify-center text-warning">
            <svg
              className="w-8 h-8 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a.75.75 0 00-.708.522L4.047 9.05a.75.75 0 00.418.91l4.25 1.7a.75.75 0 00.648-.04l2.5-1.5 2.5 1.5a.75.75 0 00.648.04l4.25-1.7a.75.75 0 00.418-.91l-1.512-5.073a.75.75 0 00-.708-.522H6.267zm-.59 8.243c.125.074.27.113.417.113H13.9a.75.75 0 00.418-.113l1.838-1.103 2.188.875a2.25 2.25 0 01-1.254 2.73l-4.25 1.7a2.25 2.25 0 01-1.944-.12l-2.388-1.433-2.388 1.433a2.25 2.25 0 01-1.944.12l-4.25-1.7A2.25 2.25 0 01.378 11.47l2.188-.875 1.838 1.103z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Premium Activated</h1>
            <p className="text-sm text-base-content/75 leading-relaxed">
              Congratulations! Your account is verified premium. You have full access to developer chat sessions and higher request limits.
            </p>
          </div>
          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full rounded-2xl font-bold h-12 shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Explore Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {showErrorToast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert alert-error rounded-xl shadow-lg border border-error/20 bg-error/90 text-white font-medium text-sm flex items-center gap-2">
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
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Payment cancelled or failed. Please try again.</span>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tight">Upgrade Your Account</h1>
        <p className="text-sm text-base-content/65 mt-2">
          Connect with more developers, build your dream team, and stand out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Silver Plan Card */}
        <div className="card bg-base-200 border border-base-300 p-8 rounded-3xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-secondary/20 hover:scale-[1.01] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors pointer-events-none"></div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-secondary">
                Silver Plan
              </h2>
              <div className="flex items-baseline gap-1 mt-2 text-white">
                <span className="text-4xl font-black">$9.99</span>
                <span className="text-xs text-base-content/50">/ 3 months</span>
              </div>
            </div>

            <div className="divider my-0 opacity-40"></div>

            <ul className="space-y-3.5 text-sm text-base-content/85">
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-secondary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Direct chat with any developer</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-secondary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>100 Connection Requests daily</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-secondary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Verified developer profile badge</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-secondary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>3 months membership duration</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleBuyClick("Silver")}
            className="btn btn-secondary w-full rounded-2xl font-bold mt-8 h-12 shadow-md shadow-secondary/10 hover:shadow-secondary/20 transition-all duration-300 hover:scale-[1.01] border-none"
          >
            Upgrade to Silver
          </button>
        </div>

        {/* Gold Plan Card */}
        <div className="card bg-base-200 border-2 border-primary/40 p-8 rounded-3xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-primary text-primary-content text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm pointer-events-none">
            Most Popular
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary">
                Gold Plan
              </h2>
              <div className="flex items-baseline gap-1 mt-2 text-white">
                <span className="text-4xl font-black">$19.99</span>
                <span className="text-xs text-base-content/50">/ 6 months</span>
              </div>
            </div>

            <div className="divider my-0 opacity-40"></div>

            <ul className="space-y-3.5 text-sm text-base-content/85">
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-primary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-semibold text-white">Direct chat + unlimited messages</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-primary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-semibold text-white">Unlimited Requests daily</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-primary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Verified developer profile badge</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-primary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Priority profile indexing in feed</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 text-primary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>6 months membership duration</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleBuyClick("Gold")}
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full rounded-2xl font-bold mt-8 h-12 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.01]"
          >
            Upgrade to Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;