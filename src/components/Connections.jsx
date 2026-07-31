import { BASE_URL, resolveMediaUrl } from "../utils/constants";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";
import { MembershipBadge, getAvatarRingStyle, getCardGlowStyle } from "../utils/membershipUtils";
import { createSocketConnection } from "../utils/socket";

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
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

    socket.on("messageReceived", ({ senderId }) => {
      const fromId = senderId?._id || senderId;
      if (!fromId || fromId === user._id) return;
      unreadRef.current = {
        ...unreadRef.current,
        [fromId]: (unreadRef.current[fromId] || 0) + 1,
      };
      setUnreadCounts({ ...unreadRef.current });
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
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[75vh] p-4">
        <div className="glass-card max-w-sm text-center p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">No Matches Yet</h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1">
              Start swiping on developers in the feed. When another engineer connects back, they'll appear here!
            </p>
          </div>
          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white btn-sm rounded-xl h-10 px-6 mt-2 font-bold text-xs"
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 fade-in">
      {/* Top Banner & Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Dev Matches</span>
            <span className="badge badge-primary font-black text-xs px-3 py-2">
              {connections.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Connect and chat in real-time with developers who matched back with you.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <div className="relative">
            <svg
              className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Filter by name or tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm w-full pl-10 pr-4 py-4 rounded-2xl bg-base-900/60 border border-white/10 text-xs focus:border-primary focus:outline-none transition-all text-white placeholder:text-base-content/40"
            />
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredConnections.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl border border-white/10">
          <p className="text-sm text-base-content/60">No matches found for "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredConnections.map((connection) => {
            const { _id, firstName, lastName, photoURL, age, gender, about, skills, membershipType, isPremium } = connection;
            const skillList = Array.isArray(skills) ? skills : [];
            const unread = unreadCounts[_id] || 0;

            return (
              <div
                key={_id}
                className={`glass-card border p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 shadow-xl fade-in ${getCardGlowStyle(connection)}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="avatar shrink-0">
                    <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-base-900 ${getAvatarRingStyle(connection)}`}>
                      <img
                        src={resolveMediaUrl(photoURL) || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                        alt={firstName}
                        className="object-cover w-full h-full select-none group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="text-left space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-lg text-white truncate">
                        {firstName} {lastName}
                      </h2>
                      <MembershipBadge membershipType={membershipType} isPremium={isPremium} size="sm" />
                      {age && (
                        <span className="badge badge-xs bg-base-800 text-base-content/60 border-white/5 font-semibold">
                          {age}y
                        </span>
                      )}
                    </div>

                    {about && (
                      <p className="text-xs text-base-content/70 line-clamp-1">
                        {about}
                      </p>
                    )}

                    {skillList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {skillList.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="badge badge-xs bg-primary/10 text-primary border-none font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to={"/chat/" + _id}
                    onClick={() => clearUnread(_id)}
                    className="relative"
                  >
                    <button className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white font-bold text-xs rounded-2xl px-4 h-11 shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
                      </svg>
                      Chat
                      {unread > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-lg shadow-red-500/40">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </button>
                  </Link>
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
