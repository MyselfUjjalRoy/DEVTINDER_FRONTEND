import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import MediaImage from "./MediaImage";
import { addRequests, removeRequest } from "../utils/requestsSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const GENDER_GLYPH = {
  Male: { symbol: "♂", color: "text-sky-400" },
  Female: { symbol: "♀", color: "text-pink-400" },
  Others: { symbol: "⚧", color: "text-violet-400" },
};

const CountUp = ({ to, duration = 1200 }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <>{val}</>;
};

const Requests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const requests = useSelector((store) => store.requests);
  const [leaving, setLeaving] = useState({});

  const handleDecision = async (status, _id) => {
    if (leaving[_id]) return;
    setLeaving((p) => ({ ...p, [_id]: status }));
    try {
      await axios.post(
        `${BASE_URL}request/review/${status}/${_id}`,
        {},
        { withCredentials: true },
      );
      setTimeout(() => dispatch(removeRequest(_id)), 480);
    } catch (err) {
      console.error("Error reviewing request:", err);
      setLeaving((p) => {
        const c = { ...p };
        delete c[_id];
        return c;
      });
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "user/requests/received", {
        withCredentials: true,
      });
      dispatch(addRequests(res?.data?.data));
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) {
    return (
      <div className="flex justify-center items-center min-h-[65vh]">
        <div className="relative flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40 animate-pulse">
            Loading requests
          </p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="relative flex justify-center items-center min-h-[75vh] p-4 overflow-hidden">
        <div className="aurora-blob w-72 h-72 bg-rose-500/20 -top-10 -right-16" />
        <div className="aurora-blob w-64 h-64 bg-amber-500/[0.12] bottom-0 -left-16" style={{ animationDelay: "-9s" }} />
        <div className="glass-card max-w-md w-full text-center p-10 rounded-[2rem] border border-white/10 shadow-2xl space-y-5 relative overflow-hidden fade-up">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative mx-auto w-20 h-20 bg-gradient-to-tr from-rose-400 to-rose-600 rounded-3xl p-0.5 shadow-xl shadow-rose-500/30 glow-primary animate-float-soft">
            <div className="w-full h-full bg-base-950 rounded-[calc(1.5rem-2px)] flex items-center justify-center">
              <svg className="w-9 h-9 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <h1 className="text-2xl font-black text-white">No Pending Requests</h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1.5">
              You don't have any incoming developer connection requests right now. Keep your profile updated!
            </p>
          </div>
          <Link
            to="/feed"
            className="relative btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-11 px-7 font-bold text-xs shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all"
          >
            Explore Developer Deck
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-10rem)] px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-blob w-96 h-96 bg-rose-500/[0.20] -top-24 -right-24" />
      <div className="aurora-blob w-80 h-80 bg-amber-500/[0.14] top-44 -left-24" style={{ animationDelay: "-8s" }} />
      <div className="aurora-blob w-72 h-72 bg-fuchsia-500/[0.13] bottom-16 right-1/4" style={{ animationDelay: "-15s" }} />

      {/* Header */}
      <div className="relative text-center mb-8 fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-400/25 bg-rose-500/10 text-rose-300 text-[11px] font-black uppercase tracking-[0.18em] shadow-lg shadow-rose-500/10 count-pulse">
          <span className="ring-dot" />
          <CountUp to={requests.length} /> {requests.length === 1 ? "Pending Request" : "Pending Requests"}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-shimmer mt-4">
          Connection Requests
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-3">
          Incoming developer requests, in one clean inbox.
        </p>
      </div>

      {/* Horizontal inbox list */}
      <div className="relative mx-auto max-w-3xl space-y-3">
        {requests.map((request, idx) => {
          const {
            _id,
            firstName,
            lastName,
            photoURL,
            age,
            gender,
            skills,
          } = request.fromUserId;
          const skillList = Array.isArray(skills) ? skills : [];
          const glyph = GENDER_GLYPH[gender];
          const state = leaving[_id];

          return (
            <div
              key={request._id}
              className={`req-in-left relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 sm:p-4 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 ${
                state === "accepted" ? "leaving-right" : state === "rejected" ? "leaving-left" : ""
              }`}
              style={{ animationDelay: `${Math.min(idx * 90, 600)}ms` }}
            >
              {/* Left accent bar */}
              <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-rose-400 via-fuchsia-500 to-amber-400" />

              {/* Stamps */}
              {state === "accepted" && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <span className="stamp-pop text-2xl sm:text-3xl font-black text-emerald-400 border-4 border-emerald-400 rounded-xl px-3 py-0.5 leading-none -rotate-12 drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]">
                    ACCEPTED
                  </span>
                </div>
              )}
              {state === "rejected" && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <span className="stamp-pop text-2xl sm:text-3xl font-black text-rose-400 border-4 border-rose-400 rounded-xl px-3 py-0.5 leading-none -rotate-12 drop-shadow-[0_0_25px_rgba(251,113,133,0.6)]">
                    REJECTED
                  </span>
                </div>
              )}

              {/* Avatar with gradient ring */}
              <div className="relative shrink-0 p-[2px] rounded-2xl bg-gradient-to-br from-rose-400/60 via-fuchsia-500/40 to-amber-400/50">
                <MediaImage
                  src={photoURL}
                  alt={`${firstName} ${lastName}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-base-950">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 ring-dot" />
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-black text-white text-base sm:text-lg">
                    {firstName} <span className="font-light">{lastName}</span>
                  </h2>
                  {glyph && (
                    <span className={`shrink-0 text-base font-bold ${glyph.color} drop-shadow`}>
                      {glyph.symbol}
                    </span>
                  )}
                  {age && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-bold text-white/80">
                      {age}y
                    </span>
                  )}
                </div>

                {skillList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {skillList.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        className="pill-in inline-flex items-center px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/15 text-primary text-[10px] font-bold"
                        style={{ animationDelay: `${120 + idx * 90 + i * 70}ms` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => navigate(`/user/${_id}`)}
                  disabled={Boolean(state)}
                  className="group/view relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 transition-all duration-300 hover:bg-violet-500/25 hover:scale-110 hover:border-violet-400/60 active:scale-95 shadow-lg shadow-violet-500/15 disabled:opacity-40 disabled:scale-100"
                  title="View profile"
                >
                  <svg className="w-4 h-4 group-hover/view:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDecision("rejected", request._id)}
                  disabled={Boolean(state)}
                  className="group/reject relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-400 transition-all duration-300 hover:bg-rose-500/25 hover:scale-110 hover:border-rose-400/60 active:scale-95 shadow-lg shadow-rose-500/15 disabled:opacity-40 disabled:scale-100"
                  title="Reject"
                >
                  <svg className="w-4 h-4 group-hover/reject:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDecision("accepted", request._id)}
                  disabled={Boolean(state)}
                  className="group/accept relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-40 disabled:scale-100"
                  title="Accept"
                >
                  <svg className="w-4 h-4 group-hover/accept:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
