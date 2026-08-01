import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import MediaImage from "./MediaImage";
import { markNotificationRead } from "../utils/notificationSlice";

const getToastMeta = (type) => {
  switch (type) {
    case "match":
      return { emoji: "💖", tint: "border-rose-500/50" };
    case "connection_request":
      return { emoji: "📨", tint: "border-sky-500/50" };
    case "connection_accepted":
      return { emoji: "✅", tint: "border-emerald-500/50" };
    case "connection_rejected":
      return { emoji: "😕", tint: "border-red-500/50" };
    case "message":
      return { emoji: "💬", tint: "border-violet-500/50" };
    default:
      return { emoji: "🔔", tint: "border-slate-500/50" };
  }
};

const NotificationToast = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const live = useSelector((store) => store.notifications.liveNotification);
  const [dismissedKey, setDismissedKey] = useState(null);

  const key = live && live._id ? `${live._id}-${live.createdAt}` : null;
  const visible = Boolean(key) && dismissedKey !== key;

  useEffect(() => {
    if (!key) return;
    const timer = setTimeout(() => setDismissedKey(key), 5000);
    return () => clearTimeout(timer);
  }, [key]);

  if (!visible) return null;

  const meta = getToastMeta(live.type);
  const actor = live.actor || live.fromUserId || {};
  const actorName = actor.firstName
    ? `${actor.firstName}${actor.lastName ? " " + actor.lastName : ""}`
    : null;

  const handleClick = async () => {
    setDismissedKey(key);
    if (!live.isRead) {
      try {
        await axios.patch(
          `${BASE_URL}notifications/${live._id}/read`,
          {},
          { withCredentials: true }
        );
        dispatch(markNotificationRead(live._id));
      } catch (err) {
        console.error("Error marking notification read:", err);
      }
    }
    if (live.link) navigate(live.link);
  };

  return (
    <div
      className={`fixed top-20 right-4 sm:right-6 z-[70] max-w-sm w-full cursor-pointer animate-slide-up glass-card-aesthetic rounded-2xl border ${meta.tint} p-4 shadow-2xl`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {actor.photoURL ? (
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/20">
            <MediaImage
              src={actor.photoURL}
              alt={actorName || "notification"}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-base-800 flex items-center justify-center text-lg shrink-0">
            {meta.emoji}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {actorName && (
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">
              {actorName}
            </p>
          )}
          <p className="text-xs font-bold text-white leading-snug">
            {live.message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissedKey(key);
          }}
          className="text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <svg
            className="w-4 h-4"
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
    </div>
  );
};

export default NotificationToast;
