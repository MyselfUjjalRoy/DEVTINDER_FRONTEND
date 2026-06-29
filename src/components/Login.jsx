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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
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
      }, 2000);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data || "ERROR: Something Went Wrong");
    }
  };

  const handleSignUp = async () => {
    setError("");
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
      }, 2000);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data || "ERROR: Something Went Wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="card bg-base-200 border border-base-300 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="card-body p-8 sm:p-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                {isLoginForm ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-base-content/60">
                {isLoginForm
                  ? "Connect with talented developers worldwide"
                  : "Start showcasing your projects & find peers"}
              </p>
            </div>

            <div className="space-y-4">
              {!isLoginForm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold text-base-content/85">First Name</span>
                    </label>
                    <label className="input input-bordered bg-base-300 border-base-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2">
                      <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        type="text"
                        className="grow text-sm text-white placeholder-base-content/30 focus:outline-none"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="John"
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold text-base-content/85">Last Name</span>
                    </label>
                    <label className="input input-bordered bg-base-300 border-base-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2">
                      <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        type="text"
                        className="grow text-sm text-white placeholder-base-content/30 focus:outline-none"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Doe"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/85">Email / Username</span>
                </label>
                <label className="input input-bordered bg-base-300 border-base-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    className="grow text-sm text-white placeholder-base-content/30 focus:outline-none"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    required
                    placeholder="john.doe@example.com"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/85">Password</span>
                </label>
                <label className="input input-bordered bg-base-300 border-base-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type="password"
                    className="grow text-sm text-white placeholder-base-content/30 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="alert alert-error bg-error/15 border border-error/25 text-error-content rounded-xl text-xs py-3 px-4 flex items-start gap-2 mt-4">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="card-actions justify-center mt-6">
              <button
                className="btn btn-primary w-full rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary border-none text-white hover:opacity-95 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.01]"
                onClick={isLoginForm ? handleLogin : handleSignUp}
              >
                {isLoginForm ? "Sign In" : "Register"}
              </button>
            </div>

            <div className="divider my-6 opacity-30 text-xs">OR</div>

            <p className="text-center text-sm text-base-content/60">
              {isLoginForm ? "New to DevFinder?" : "Already have an account?"}{" "}
              <button
                className="text-primary hover:underline font-bold transition-all"
                onClick={() => {
                  setError("");
                  setIsLoginForm((value) => !value);
                }}
              >
                {isLoginForm ? "Create an account" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert alert-success rounded-xl shadow-lg border border-success/20 bg-success/90 text-white font-medium text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{isLoginForm ? "Login Successful!" : "Sign Up Successful!"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;