import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import UserCard from "./UserCard";
import FeedBackground from "./FeedBackground";
import { Link } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [loading, setLoading] = useState(true);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(null);
  const [isViewerPremium, setIsViewerPremium] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  const getFeed = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL + "feed", { withCredentials: true });
      dispatch(addFeed(res.data));
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  // Live refresh: when someone super connects with me, re-pull the feed
  // so their card appears at the top with the "Starred You" badge.
  useEffect(() => {
    const s = createSocketConnection();
    const onNotification = (data) => {
      if (!data || data.type !== "superlike") return;
      axios
        .get(BASE_URL + "feed", { withCredentials: true })
        .then((res) => dispatch(addFeed(res.data)))
        .catch((err) => console.error("Error refreshing feed:", err));
    };
    s.on("notification:new", onNotification);
    return () => s.off("notification:new", onNotification);
  }, [dispatch]);

  const getSuperLikeStatus = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL + "request/superlike/status", {
        withCredentials: true,
      });
      setSuperLikesRemaining(
        res.data?.remaining !== undefined && res.data?.remaining !== null
          ? res.data.remaining
          : null
      );
      setIsViewerPremium(Boolean(res.data?.isPremium));
    } catch (err) {
      console.error("Error fetching super connect status:", err);
    }
  }, []);

  useEffect(() => {
    getSuperLikeStatus();
  }, [getSuperLikeStatus]);

  const handleSuperConnect = useCallback(async (targetUser) => {
    if (!targetUser) return false;
    try {
      const res = await axios.post(
        `${BASE_URL}request/superlike/${targetUser._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data && typeof res.data.remaining === "number") {
        setSuperLikesRemaining(res.data.remaining);
      }
      showToast(
        `⭐ Super connect sent to ${targetUser.firstName}! They'll see you at the top of their feed.`
      );
      return true;
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setSuperLikesRemaining(0);
      } else if (status === 400) {
        return true;
      } else {
        console.error("Super connect error:", err);
      }
      return false;
    }
  }, []);

  const handleSuperExit = useCallback(
    (userId) => {
      dispatch(removeUserFromFeed(userId));
    },
    [dispatch]
  );

  const handleSwipe = useCallback(
    async (dir) => {
      if (!feed || feed.length === 0) return;
      const targetUser = feed[0];
      const status = dir === "right" ? "interested" : "ignored";
      try {
        await axios.post(
          `${BASE_URL}request/send/${status}/${targetUser._id}`,
          {},
          { withCredentials: true }
        );
        dispatch(removeUserFromFeed(targetUser._id));
      } catch (err) {
        console.error("Swipe request error:", err);
      }
    },
    [feed, dispatch]
  );

  const triggerSwipe = useCallback(
    async (status) => {
      if (!feed || feed.length === 0) return;
      const currentUser = feed[0];
      try {
        await axios.post(
          `${BASE_URL}request/send/${status}/${currentUser._id}`,
          {},
          { withCredentials: true }
        );
        dispatch(removeUserFromFeed(currentUser._id));
      } catch (err) {
        console.error("Keyboard request error:", err);
      }
    },
    [feed, dispatch]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") triggerSwipe("ignored");
      else if (e.key === "ArrowRight") triggerSwipe("interested");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSwipe]);

  if (loading) {
    return (
      <div className="relative flex flex-col justify-center items-center min-h-[75vh] p-4">
        <FeedBackground />
        {/* Skeleton Matching Deck */}
        <div className="glass-card w-[22.5rem] sm:w-[26rem] h-[36rem] rounded-3xl overflow-hidden animate-pulse border border-white/10 p-6 space-y-6">
          <div className="bg-base-800/80 h-72 w-full rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-7 bg-base-800/80 rounded-lg w-2/3"></div>
            <div className="h-4 bg-base-800/80 rounded-lg w-full"></div>
            <div className="h-4 bg-base-800/80 rounded-lg w-4/5"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-base-800/80 rounded-md w-16"></div>
            <div className="h-6 bg-base-800/80 rounded-md w-20"></div>
            <div className="h-6 bg-base-800/80 rounded-md w-16"></div>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="h-12 bg-base-800/80 rounded-2xl flex-1"></div>
            <div className="h-12 bg-base-800/80 rounded-2xl flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!feed || feed.length <= 0) {
    return (
      <div className="relative flex justify-center items-center min-h-[75vh] p-4">
        <FeedBackground />
        <div className="glass-card max-w-lg text-center p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-3xl p-0.5 shadow-xl shadow-primary/25 flex items-center justify-center">
            <div className="w-full h-full bg-base-950 rounded-[1.4rem] flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Deck Cleared! 🎉</h1>
            <p className="text-sm text-base-content/70 leading-relaxed max-w-md mx-auto">
              You've swiped through all available developers in your area. Update your tech stack skills or check your pending matches!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link 
              to="/profile" 
              className="btn btn-outline border-white/10 text-white hover:bg-white/10 rounded-2xl h-12 px-6 font-bold text-xs"
            >
              Update Skills & Profile
            </Link>
            <Link 
              to="/connections" 
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white rounded-2xl h-12 px-6 font-bold text-xs shadow-lg shadow-primary/25"
            >
              View My Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentDev = feed[0];
  const nextDev = feed[1];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] px-3 sm:px-4 py-3 sm:py-8">
      <FeedBackground />
      {/* Keyboard Shortcut Indicator */}
      <div className="hidden sm:flex items-center gap-4 mb-3 text-xs text-base-content/40 font-bold tracking-wider uppercase">
        <span className="flex items-center gap-1">
          <kbd className="kbd kbd-xs bg-base-800 border-white/10 text-white">←</kbd> Press Left to Pass
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <kbd className="kbd kbd-xs bg-base-800 border-white/10 text-white">→</kbd> Press Right to Connect
        </span>
      </div>

      {/* Stacked Cards Layout */}
      <div className="relative w-[22.5rem] sm:w-[26rem] flex justify-center items-center">
        {/* Next Card Preview behind */}
        {nextDev && (
          <div className="absolute top-4 scale-[0.94] opacity-40 blur-[1px] pointer-events-none transition-all duration-300">
            <UserCard user={nextDev} />
          </div>
        )}

        <div className="w-full z-10 animate-slide-up" key={currentDev._id}>
          <UserCard
            user={currentDev}
            onSwipe={handleSwipe}
            superLikesRemaining={superLikesRemaining}
            isViewerPremium={isViewerPremium}
            onSuperConnect={handleSuperConnect}
            onSuperExit={handleSuperExit}
          />
        </div>
      </div>

      {toastVisible && (
        <div className="fixed top-24 right-4 sm:right-6 z-[99] max-w-xs">
          <div className="rounded-2xl border border-amber-400/40 bg-[#0d101c]/95 shadow-2xl shadow-amber-500/20 px-4 py-3 text-sm text-white font-bold flex items-center gap-2.5 animate-slide-up">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;