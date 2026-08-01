import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { useTheme } from "../utils/useTheme";
import { MembershipBadge, getAvatarRingStyle } from "../utils/membershipUtils";
import NotificationBell from "./NotificationBell";
import MediaImage from "./MediaImage";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [upsellDismissed, setUpsellDismissed] = useState(() => {
    try {
      return localStorage.getItem("devtinder-upsell-dismissed") === "1";
    } catch {
      return false;
    }
  });

  const dismissUpsell = () => {
    setUpsellDismissed(true);
    try {
      localStorage.setItem("devtinder-upsell-dismissed", "1");
    } catch {
      /* storage unavailable — banner just stays */
    }
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

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
            <NotificationBell />
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
            <div className="relative flex-none" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`btn btn-ghost btn-circle avatar transition-all duration-300 shadow-lg ${getAvatarRingStyle(user)} ${menuOpen ? "ring-2 ring-white/30 scale-105" : ""}`}
              >
                <div className="w-10 rounded-full overflow-hidden bg-base-800">
                  <MediaImage
                    alt={user.firstName}
                    src={user.photoURL}
                    className="object-cover w-full h-full"
                  />
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#0b0c14]/95 border border-white/15 backdrop-blur-xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.95)] z-[60] origin-top-right animate-slide-up overflow-hidden">
                  {/* Brand accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
                  {/* Soft inner glow */}
                  <div className="pointer-events-none absolute -top-14 -right-10 w-40 h-40 rounded-full bg-rose-500/[0.07] blur-3xl" />

                  {/* Signed-in header (no avatar — it's in the navbar) */}
                  <div className="px-4 pt-3.5 pb-3 border-b border-white/[0.08]">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Signed in as
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <p className="text-sm font-black text-white leading-tight truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <MembershipBadge
                        membershipType={user.membershipType}
                        isPremium={user.isPremium}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.emailId || "Developer Account"}
                      </p>
                      <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center px-2 py-2.5 border-b border-white/[0.08]">
                    <StatButton
                      value={connections?.length ?? 0}
                      label="Matches"
                      onClick={() => {
                        closeMenu();
                        navigate("/connections");
                      }}
                    />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatButton
                      value={requests?.length ?? 0}
                      label="Requests"
                      onClick={() => {
                        closeMenu();
                        navigate("/requests");
                      }}
                    />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatButton
                      value={user?.skills?.length ?? 0}
                      label="Skills"
                      onClick={() => {
                        closeMenu();
                        navigate("/profile");
                      }}
                    />
                  </div>

                  {/* Account section */}
                  <div className="p-2 space-y-0.5">
                    <p className="px-3 pt-1 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Account
                    </p>
                    <ProfileMenuItem
                      to="/profile"
                      onClick={closeMenu}
                      active={isActive("/profile")}
                      tint="bg-indigo-500/10 text-indigo-300"
                      label="Edit Profile & Stack"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />
                    <ProfileMenuItem
                      to="/premium"
                      onClick={closeMenu}
                      active={isActive("/premium")}
                      tint="bg-amber-500/10 text-amber-300"
                      label={user?.isPremium ? "Premium Plan" : "Go Pro"}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      }
                    />
                  </div>

                  <div className="mx-3 h-px bg-white/[0.08]" />

                  {/* Logout */}
                  <div className="p-2">
                    <ProfileMenuItem
                      onClick={() => {
                        closeMenu();
                        handleLogout();
                      }}
                      tint="bg-rose-500/10 text-rose-400"
                      label="Log Out"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              )}
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

      {/* Premium upsell strip — shown to free users until dismissed */}
      {user && !user.isPremium && !upsellDismissed && location.pathname !== "/premium" && (
        <div className="bg-gradient-to-r from-amber-500/[0.14] via-yellow-500/[0.08] to-amber-500/[0.14] border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3">
            <span className="hidden sm:inline-block text-amber-400 text-sm">👑</span>
            <p className="text-[11px] sm:text-xs font-bold text-amber-200/90 text-center">
              Unlock Gold — direct developer chat, verified badge & top feed placement.
            </p>
            <Link
              to="/premium"
              className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-md shadow-amber-500/30 hover:scale-105 transition-transform"
            >
              Go Pro
            </Link>
            <button
              type="button"
              onClick={dismissUpsell}
              aria-label="Dismiss premium upsell"
              className="shrink-0 text-amber-300/60 hover:text-amber-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatButton = ({ value, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 flex flex-col items-center gap-0.5 py-1 group"
  >
    <span className="text-sm font-black text-white leading-none group-hover:scale-110 transition-transform">
      {value}
    </span>
    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">
      {label}
    </span>
  </button>
);

const ProfileMenuItem = ({ to, onClick, active, icon, label, count, tint }) => {
  const content = (
    <>
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110 ${tint}`}
      >
        {icon}
      </span>
      <span className="flex-1 text-xs font-bold text-slate-100 truncate">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="badge badge-sm bg-rose-500/15 text-rose-300 border border-rose-500/30 px-1.5 text-[10px] font-black">
          {count}
        </span>
      )}
      <svg
        className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  const baseCls = `group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 ${
    active ? "bg-white/[0.06]" : "hover:bg-white/[0.06] hover:translate-x-0.5"
  }`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={baseCls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={baseCls + " text-left"}>
      {content}
    </button>
  );
};

export default NavBar;