import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
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
        { withCredentials: true }
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
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">No Pending Requests</h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1">
              You don't have any incoming developer connection requests right now. Keep your profile updated!
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
        <h1 className="text-3xl font-black text-white tracking-tight">Pending Connection Requests</h1>
        <p className="text-xs text-base-content/60 mt-1">
          You have <span className="text-primary font-bold">{requests.length}</span> developers wanting to connect.
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoURL, age, gender, about, skills } = request.fromUserId;
          const skillList = Array.isArray(skills) ? skills : [];

          return (
            <div
              key={request._id}
              className="dev-card my-4 group transition-all duration-300 hover:-translate-y-1 animate-slide-up fade-in glass-card border border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-primary/30 shadow-xl fade-in"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="avatar shrink-0">
                  <div className="w-16 h-16 rounded-2xl ring-2 ring-primary/30 overflow-hidden bg-base-900">
                    <img
                      src={photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={firstName}
                      className="object-cover w-full h-full select-none"
                    />
                  </div>
                </div>
                
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-white">
                      {firstName} {lastName}
                    </h2>
                    {age && (
                      <span className="badge badge-xs bg-base-800 text-base-content/60 border-white/5 font-semibold">
                        {age}y
                      </span>
                    )}
                  </div>
                  
                  {about && (
                    <p className="text-xs text-base-content/70 line-clamp-1 max-w-md">
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

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                <button
                  className="btn btn-outline border-white/10 text-error hover:bg-error/15 hover:border-error text-xs rounded-2xl px-4 h-10 font-bold uppercase transition-all"
                  onClick={() => reviewRequests("rejected", request._id)}
                >
                  Reject
                </button>
                <button
                  className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 border-none text-white text-xs rounded-2xl px-5 h-10 font-bold uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                  onClick={() => reviewRequests("accepted", request._id)}
                >
                  Accept Match ✓
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