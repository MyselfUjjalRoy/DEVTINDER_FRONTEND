import { BASE_URL } from "../utils/constants";
import MediaImage from "./MediaImage";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";

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

const handleSpot = (e) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const formatLastActivity = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const messagePreview = (text, attachment) => {
  if (attachment?.type === "image") return "📷 Photo";
  if (attachment?.type === "audio") return "🎤 Voice message";
  if (attachment) return "📎 " + (attachment.name || "File");
  return text || "";
};

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastActivityMap, setLastActivityMap] = useState({});
  const unreadRef = useRef({});
  const user = useSelector((store) => store.user);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res?.data?.data));
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await axios.get(BASE_URL + "chats/unread", {
        withCredentials: true,
      });
      const map = res.data?.unreadMap || {};
      setUnreadCounts(map);
      unreadRef.current = map;
      setLastActivityMap(res.data?.lastActivityMap || {});
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchUnreadCounts();
  }, []);

  // listen for incoming messages to update unread count live
  useEffect(() => {
    if (!user?._id) return;
    const socket = createSocketConnection();

    socket.on("messageReceived", (payload) => {
      const fromId = payload?.senderId?._id || payload?.senderId;
      if (!fromId || fromId === user._id) return;
      unreadRef.current = {
        ...unreadRef.current,
        [fromId]: (unreadRef.current[fromId] || 0) + 1,
      };
      setUnreadCounts({ ...unreadRef.current });
      setLastActivityMap((prev) => ({
        ...prev,
        [fromId]: {
          lastActivityAt: new Date().toISOString(),
          lastText: messagePreview(payload.text, payload.attachment),
          lastSenderId: fromId,
        },
      }));
    });

    socket.on("messagesRead", ({ readByUserId, messageIds }) => {
      // when this user reads messages (in another tab), decrement our unread for them
      // not strictly needed for connections page UX
    });

    return () => {
      socket.off("messageReceived");
      socket.off("messagesRead");
    };
  }, [user?._id]);

  const clearUnread = (partnerId) => {
    const copy = { ...unreadRef.current };
    delete copy[partnerId];
    unreadRef.current = copy;
    setUnreadCounts(copy);
  };

  if (!connections) {
    return (
      <div className="flex justify-center items-center min-h-[65vh]">
        <div className="relative flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40 animate-pulse">
            Loading matches
          </p>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="relative flex justify-center items-center min-h-[75vh] p-4 overflow-hidden">
        <div className="aurora-blob w-72 h-72 bg-rose-500/20 -top-10 -left-16" />
        <div className="aurora-blob w-64 h-64 bg-indigo-500/15 bottom-0 -right-16" style={{ animationDelay: "-8s" }} />
        <div className="glass-card max-w-md w-full text-center p-10 rounded-[2rem] border border-white/10 shadow-2xl space-y-5 relative overflow-hidden fade-up">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative mx-auto w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-3xl p-0.5 shadow-xl shadow-primary/30 glow-primary animate-float-soft">
            <div className="w-full h-full bg-base-950 rounded-[calc(1.5rem-2px)] flex items-center justify-center">
              <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <h1 className="text-2xl font-black text-white">No Matches Yet</h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1.5">
              Start swiping on developers in the feed. When another engineer connects back, they'll appear here!
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

  const filteredConnections = connections.filter((connection) => {
    const fullName = `${connection.firstName} ${connection.lastName}`.toLowerCase();
    const skillsStr = Array.isArray(connection.skills)
      ? connection.skills.join(" ").toLowerCase()
      : (connection.skills || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || skillsStr.includes(query);
  });

  const sortedConnections = [...filteredConnections].sort((a, b) => {
    const ta = lastActivityMap[a._id]?.lastActivityAt;
    const tb = lastActivityMap[b._id]?.lastActivityAt;
    if (ta && tb) return new Date(tb) - new Date(ta);
    if (ta) return -1;
    if (tb) return 1;
    return 0;
  });

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-blob w-96 h-96 bg-rose-500/[0.22] -top-24 -left-24" />
      <div className="aurora-blob w-80 h-80 bg-indigo-500/[0.18] top-44 -right-24" style={{ animationDelay: "-7s" }} />
      <div className="aurora-blob w-72 h-72 bg-fuchsia-500/[0.14] bottom-16 left-1/3" style={{ animationDelay: "-14s" }} />

      {/* Header */}
      <div className="relative mb-10 fade-up">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-base-content/60 mb-4 backdrop-blur-xl">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              Mutual Connections
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-shimmer">
              Dev Matches
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-3">
              Developers who matched back with you — jump into a chat anytime.
            </p>
          </div>

          <div className="w-full lg:w-80">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/25 text-primary font-black text-sm count-pulse">
              <CountUp to={connections.length} /> {connections.length === 1 ? "Match" : "Matches"}
            </div>
            <div className="relative mt-3 group">
              <svg
                className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Filter by name or tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10 pr-10 py-3.5 rounded-2xl bg-base-900/70 border border-white/10 text-sm text-white placeholder:text-base-content/40
                           focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_28px_rgba(255,45,85,0.15)] focus:outline-none transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-base-800 border border-white/10 text-base-content/50 hover:text-white hover:bg-base-700 hover:scale-110 flex items-center justify-center transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inbox List */}
      {filteredConnections.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/10 text-center py-14 fade-up">
          <p className="text-sm text-base-content/60">
            No matches found for "<span className="text-primary font-bold">{searchTerm}</span>"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sortedConnections.map((connection, idx) => {
            const { _id, firstName, lastName, photoURL, age, gender } = connection;
            const unread = unreadCounts[_id] || 0;
            const glyph = GENDER_GLYPH[gender];
            const last = lastActivityMap[_id];

            return (
              <div
                key={_id}
                className="edge-card edge-shine card-reveal"
                style={{ animationDelay: `${Math.min(idx * 70, 560)}ms` }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5"
                  onMouseMove={handleSpot}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className="group-photo photo-breathe relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl">
                        <MediaImage
                          src={photoURL}
                          alt={`${firstName} ${lastName}`}
                          className="absolute inset-0 w-full h-full object-cover select-none"
                        />
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-red-500/40 animate-pop-check">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                      <span
                        title="Online"
                        className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-[#10121e] shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-black text-base sm:text-lg text-white truncate">
                          {firstName} {lastName}
                        </h2>
                        {glyph && (
                          <span title={gender} className={`font-bold text-sm shrink-0 ${glyph.color}`}>
                            {glyph.symbol}
                          </span>
                        )}
                        {age && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-base-800 border border-white/5 text-[10px] font-bold text-base-content/60 shrink-0">
                            {age}y
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`truncate text-[11px] leading-tight ${
                            unread > 0 ? "text-white font-bold" : "text-white/50"
                          }`}
                        >
                          {last
                            ? `${last.lastSenderId === user?._id ? "You: " : ""}${last.lastText || ""}`
                            : "No messages yet"}
                        </span>
                      {last && (
                        <span className="ml-auto shrink-0 text-[10px] font-bold text-white/40">
                          {formatLastActivity(last.lastActivityAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                  <div className="shrink-0 flex gap-2 sm:justify-end">
                    <Link
                      to={"/user/" + _id}
                      title="View profile"
                      className="group/prof relative flex-1 sm:flex-none overflow-hidden rounded-xl border border-white/15 bg-white/5 text-slate-200 font-black text-[11px] uppercase tracking-wider h-10 px-4 flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/30 hover:scale-105 hover:text-white transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      to={"/chat/" + _id}
                      onClick={() => clearUnread(_id)}
                      className="group/chat relative flex-1 sm:flex-none overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black text-[11px] uppercase tracking-wider h-10 px-5 flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all duration-300"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/chat:translate-x-full transition-transform duration-700" />
                      <svg className="w-4 h-4 fill-current relative" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
                      </svg>
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;
