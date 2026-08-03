import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect, useState } from "react";
import { createSocketConnection, disconnectSocket } from "../utils/socket";
import { addNotification } from "../utils/notificationSlice";
import NotificationToast from "./NotificationToast";
import MatchOverlay from "./MatchOverlay";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  const [matchData, setMatchData] = useState(null);
  const location = useLocation();
  const standalone = location.pathname.startsWith("/user/");

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "profile/view", { withCredentials: true });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err.status === 401) {
        if (window.location.pathname !== "/") {
          navigate("/login");
        }
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userData && window.location.pathname === "/") {
      navigate("/feed");
    }
  }, [userData, navigate]);

  useEffect(() => {
    if (!userData?._id) {
      disconnectSocket();
      return;
    }
    const s = createSocketConnection();

    const onNotification = (data) => {
      if (data && data._id) dispatch(addNotification(data));
    };
    const onMatch = (data) => {
      if (data && Array.isArray(data.users) && data.users.length >= 2) {
        setMatchData(data);
      }
    };

    s.on("notification:new", onNotification);
    s.on("matched", onMatch);

    return () => {
      s.off("notification:new", onNotification);
      s.off("matched", onMatch);
    };
  }, [userData?._id, dispatch]);

  return (
    <div className="flex flex-col min-h-screen relative bg-[#0b0c14] text-slate-100 overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[32rem] sm:w-[42rem] h-[32rem] sm:h-[42rem] rounded-full bg-gradient-to-tr from-rose-600/15 via-pink-500/10 to-transparent blur-[130px] animate-pulse pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[28rem] sm:w-[36rem] h-[28rem] sm:h-[36rem] rounded-full bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-mesh-pattern opacity-20 pointer-events-none" />
      </div>
      <div className={`relative z-10 flex flex-col min-h-screen ${standalone ? "" : "pb-16 md:pb-0"}`}>
        {!standalone && <NavBar />}
        <div className="flex-1">
          <Outlet />
        </div>
        {!standalone && <Footer />}
      </div>
      {!standalone && <MobileNav />}
      <NotificationToast />
      <MatchOverlay
        matchData={userData ? matchData : null}
        onClose={() => setMatchData(null)}
      />
    </div>
  );
};

export default Body;
