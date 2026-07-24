import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);

  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      setToast(true);
      setTimeout(() => {
        setToast(false);
        return navigate("/feed");
      }, 1500);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      setToast(true);
      setTimeout(() => {
        setToast(false);
        return navigate("/profile");
      }, 1500);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data || "Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[82vh] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card shadow-2xl rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-10 backdrop-blur-2xl">
          
          {/* Header & Tab Toggle */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 mx-auto mb-3 shadow-lg shadow-primary/20 flex items-center justify-center">
              <div className="w-full h-full bg-base-950 rounded-[0.9rem] flex items-center justify-center">
                <svg className="w-6 h-6 text-primary fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-black tracking-tight text-white">
              {isLoginForm ? "Welcome Back" : "Join DevTinder"}
            </h2>
            <p className="text-xs text-base-content/60 mt-1">
              {isLoginForm
                ? "Match with software engineers & pair program"
                : "Create your developer profile & showcase your stack"}
            </p>

            {/* Segmented Switcher */}
            <div className="flex bg-base-900/80 p-1 rounded-2xl border border-white/10 mt-6">
              <button
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  isLoginForm
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-base-content/60 hover:text-white"
                }`}
                onClick={() => {
                  setError("");
                  setIsLoginForm(true);
                }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  !isLoginForm
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-base-content/60 hover:text-white"
                }`}
                onClick={() => {
                  setError("");
                  setIsLoginForm(false);
                }}
              >
                Register
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {!isLoginForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">First Name</span>
                  </label>
                  <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                    <input
                      type="text"
                      className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="Ujjal"
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Last Name</span>
                  </label>
                  <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                    <input
                      type="text"
                      className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Roy"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Developer Email</span>
              </label>
              <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  required
                  placeholder="ujjal@example.com"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Password</span>
              </label>
              <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 rounded-xl">
                <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  className="grow text-xs text-white placeholder-base-content/30 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="alert alert-error bg-error/15 border border-error/30 text-error rounded-xl text-xs py-3 px-4 flex items-center gap-2 mt-5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6">
            <button
              className="btn btn-primary w-full rounded-2xl h-12 font-black text-xs uppercase tracking-wider bg-gradient-to-r from-primary to-secondary border-none text-white hover:opacity-95 shadow-xl shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all"
              onClick={isLoginForm ? handleLogin : handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : isLoginForm ? (
                "Sign In to DevTinder"
              ) : (
                "Create Developer Profile"
              )}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert bg-emerald-500 text-white rounded-2xl shadow-xl border border-emerald-400 font-bold text-xs flex items-center gap-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{isLoginForm ? "Welcome back! Redirecting to feed..." : "Account created! Setting up profile..."}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;