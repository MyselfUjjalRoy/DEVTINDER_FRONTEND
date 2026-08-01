import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import MediaImage from "./MediaImage";
import { addRequests, removeRequest } from "../utils/requestsSlice";
import { useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);

  const reviewRequests = async (status, _id) => {
    try {
      await axios.post(
        `${BASE_URL}request/review/${status}/${_id}`,
        {},
        { withCredentials: true },
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      console.error("Error reviewing request:", err);
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
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[75vh] p-4">
        <div className="glass-card max-w-sm text-center p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <svg
              className="w-8 h-8"
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
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              No Pending Requests
            </h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1">
              You don't have any incoming developer connection requests right
              now. Keep your profile updated!
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Pending Connection Requests
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          You have{" "}
          <span className="text-primary font-bold">{requests.length}</span>{" "}
          developers wanting to connect.
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const {
            _id,
            firstName,
            lastName,
            photoURL,
            age,
            gender,
            about,
            skills,
          } = request.fromUserId;
          const skillList = Array.isArray(skills) ? skills : [];

          return (
            <div
              key={request._id}
              className="glass-card border border-white/10 p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 hover:border-rose-500/30 shadow-xl fade-in animate-slide-up"
            >
              {/* Left: Avatar + Info */}
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <div className="avatar shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-2 ring-primary/30 overflow-hidden bg-base-900">
                    <MediaImage
                      src={photoURL}
                      alt={firstName}
                      className="object-cover w-full h-full select-none"
                    />
                  </div>
                </div>

                <div className="text-left space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-base sm:text-lg text-white truncate">
                      {firstName} {lastName}
                    </h2>
                    {age && (
                      <span className="badge badge-xs bg-base-800 text-base-content/60 border-white/5 font-semibold shrink-0">
                        {age}y
                      </span>
                    )}
                    {gender && (
                      <span className="badge badge-xs bg-base-800 text-base-content/60 border-white/5 font-semibold shrink-0">
                        {gender}
                      </span>
                    )}
                  </div>

                  {about && (
                    <p className="text-xs text-base-content/70 line-clamp-2 sm:line-clamp-1">
                      {about}
                    </p>
                  )}

                  {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {skillList.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="badge badge-xs bg-primary/10 text-primary border-none font-bold"
                        >
                          {s}
                        </span>
                      ))}
                      {skillList.length > 3 && (
                        <span className="badge badge-xs bg-base-800 text-base-content/50 border-none font-bold">
                          +{skillList.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end md:justify-start">
                <button
                  className="btn btn-sm border border-white/10 bg-transparent text-red-400 hover:bg-red-500/15 hover:border-red-500/40 text-xs rounded-2xl px-4 h-9 font-bold uppercase tracking-wide transition-all flex-1 md:flex-none"
                  onClick={() => reviewRequests("rejected", request._id)}
                >
                  Reject
                </button>
                <button
                  className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 border-none text-white text-xs rounded-2xl px-4 h-9 font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all whitespace-nowrap flex-1 md:flex-none"
                  onClick={() => reviewRequests("accepted", request._id)}
                >
                  Accept ✓
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
