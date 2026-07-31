import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL, resolveMediaUrl } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { useTheme } from "../utils/useTheme";
import { MembershipBadge, getAvatarRingStyle } from "../utils/membershipUtils";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full glass-nav-aesthetic transition-all duration-300">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 justify-between">
        {/* Brand Logo */}
        <div className="flex-none">
          <Link 
            to={user ? "/feed" : "/"} 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/25 group-hover:scale-105 group-hover:shadow-rose-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0b0c14] rounded-[0.85rem] flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-rose-500 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 fill-current drop-shadow-[0_0_8px_rgba(255,45,85,0.6)]" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              Dev<span className="bg-gradient-to-r from-rose-500 via-pink-400 to-purple-400 bg-clip-text text-transparent">Tinder</span>
            </span>
          </Link>
        </div>

        {/* Center Quick Links for Logged-In Users */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-xl">
            <Link
              to="/feed"
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive("/feed")
                  ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/25"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Explore Deck
            </Link>

            <Link
              to="/connections"
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive("/connections")
                  ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/25"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Matches
            </Link>

            <Link
              to="/requests"
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                isActive("/requests")
                  ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/25"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Requests
              {requests && requests.length > 0 && (
                <span className="badge badge-sm badge-secondary px-1.5 py-0.5 text-[10px] font-black animate-pulse">
                  {requests.length}
                </span>
              )}
            </Link>

            <Link
              to="/premium"
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                isActive("/premium")
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105"
                  : user?.isPremium
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                  : "text-amber-400 hover:bg-amber-400/15"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {user?.isPremium ? (
                <span className="flex items-center gap-1">
                  <span>Pro VIP</span>
                </span>
              ) : (
                "Pro Pass"
              )}
            </Link>
          </div>
        )}

        {/* User Right Menu */}
        {user ? (
          <div className="flex-none flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-black text-white leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <MembershipBadge membershipType={user.membershipType} isPremium={user.isPremium} size="sm" />
              </div>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Active Now
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className={`btn btn-ghost btn-circle avatar transition-all duration-300 shadow-lg ${getAvatarRingStyle(user)}`}
              >
                <div className="w-10 rounded-full overflow-hidden bg-base-800">
                  <img 
                    alt={user.firstName} 
                    src={resolveMediaUrl(user.photoURL) || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"} 
                    className="object-cover w-full h-full" 
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-2xl bg-base-900/95 border border-white/10 backdrop-blur-xl rounded-2xl w-64 space-y-1"
              >
                <li className="px-3 py-2.5 border-b border-white/10 mb-1">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-bold text-white leading-none">{user.firstName} {user.lastName}</p>
                      <MembershipBadge membershipType={user.membershipType} isPremium={user.isPremium} size="sm" />
                    </div>
                    <p className="text-[10px] text-base-content/50 truncate mt-1">{user.emailId || "Developer Account"}</p>
                  </div>
                </li>
                <li>
                  <Link to="/profile" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-xs text-white">Edit Profile & Stack</span>
                  </Link>
                </li>
                <li>
                  <Link to="/connections" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors md:hidden">
                    <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-semibold text-xs text-white">My Connections</span>
                  </Link>
                </li>
                <li>
                  <Link to="/requests" className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors md:hidden">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="font-semibold text-xs text-white">Connection Requests</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/premium" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="font-semibold text-xs text-amber-400">DevTinder Premium</span>
                  </Link>
                </li>
                <div className="divider my-1 opacity-20"></div>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-3 py-2 px-3 rounded-xl text-error hover:bg-error/10 transition-colors text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-bold text-xs">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="btn btn-primary bg-gradient-to-r from-rose-500 to-pink-500 border-none text-white px-6 rounded-2xl h-10 font-bold text-xs shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              Sign In / Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;