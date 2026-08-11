import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import MediaImage from "./MediaImage";
import {
  addNotifications,
  clearNotifications,
  removeNotification,
} from "../utils/notificationSlice";

const getTypeMeta = (type) => {
  switch (type) {
    case "connection_request":
      return {
        icon: "M13 7a3 3 0 11-6 0 3 3 0 016 0zM18 15a3 3 0 11-6 0 3 3 0 016 0zM7 15a3 3 0 11-6 0 3 3 0 016 0zM8.5 16a4.5 4.5 0 017 0",
        tint: "text-sky-400 bg-sky-500/10",
      };
    case "match":
      return {
        icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
        tint: "text-rose-500 bg-rose-500/10",
      };
    case "connection_accepted":
      return {
        icon: "M5 13l4 4L19 7",
        tint: "text-emerald-400 bg-emerald-500/10",
      };
    case "connection_rejected":
      return {
        icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        tint: "text-red-400 bg-red-500/10",
      };
    case "message":
      return {
        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        tint: "text-violet-400 bg-violet-500/10",
      };
    case "superlike":
      return {
        icon: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
        tint: "text-amber-400 bg-amber-500/10",
      };
    default:
      return {
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        tint: "text-slate-400 bg-slate-500/10",
      };
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector(
    (store) => store.notifications
  );
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(BASE_URL + "notifications", {
          withCredentials: true,
        });
        dispatch(
          addNotifications({
            notifications: res.data.data || [],
            unreadCount: res.data.unreadCount || 0,
          })
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleClick = async (n) => {
    setOpen(false);
    try {
      await axios.patch(
        `${BASE_URL}notifications/${n._id}/read`,
        {},
        { withCredentials: true }
      );
      dispatch(removeNotification(n._id));
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
    if (n.link) navigate(n.link);
  };

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${BASE_URL}notifications/${id}`, {
        withCredentials: true,
      });
      dispatch(removeNotification(id));
    } catch (err) {
      console.error("Error dismissing notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        BASE_URL + "notifications/read-all",
        {},
        { withCredentials: true }
      );
      dispatch(clearNotifications());
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="btn btn-ghost btn-circle relative shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <svg
          className="w-5 h-5 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg shadow-rose-500/40 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 z-[60] overflow-hidden rounded-2xl bg-[#0d101c] border border-white/10 shadow-2xl shadow-black/60 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-xs font-black text-white uppercase tracking-widest">
              Notifications
            </p>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center space-y-2">
                <svg
                  className="w-10 h-10 mx-auto text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-xs text-base-content/50 font-medium">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = getTypeMeta(n.type);
                const actor = n.actor || n.fromUserId || {};
                const actorName = actor.firstName
                  ? `${actor.firstName}${actor.lastName ? " " + actor.lastName : ""}`
                  : "Someone";
                return (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleClick(n);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer transition-colors hover:bg-white/5 group bg-rose-500/5 border-l-2 border-rose-500"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.tint}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={meta.icon}
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {actor.photoURL && (
                          <MediaImage
                            src={actor.photoURL}
                            alt={actorName}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        )}
                        <p className="text-xs leading-snug truncate text-white font-bold">
                          {n.message}
                        </p>
                      </div>
                      <p className="text-[10px] text-base-content/40 mt-1 font-medium">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Dismiss notification"
                      title="Dismiss"
                      onClick={(e) => handleDismiss(e, n._id)}
                      className="shrink-0 w-6 h-6 -mr-1 mt-0.5 rounded-full flex items-center justify-center text-base-content/40 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
