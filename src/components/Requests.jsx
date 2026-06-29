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
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] p-4">
        <div className="card bg-base-200 border border-base-300 max-w-sm text-center p-8 rounded-3xl shadow-xl space-y-4">
          <div className="mx-auto w-16 h-16 bg-base-300 rounded-full flex items-center justify-center text-base-content/40">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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
            <h1 className="text-xl font-black text-white">No Requests</h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1">
              You don't have any pending developer connection requests right now.
            </p>
          </div>
          <Link
            to="/feed"
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white btn-sm rounded-xl h-10 px-6 mt-2"
          >
            Explore Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white">Connection Requests</h1>
        <p className="text-sm text-base-content/60 mt-1.5">
          You have <span className="text-secondary font-semibold">{requests.length}</span> pending requests.
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoURL, age, gender, about } = request.fromUserId;

          return (
            <div
              key={_id}
              className="card bg-base-200 border border-base-300 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-primary/10"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="avatar shrink-0">
                  <div className="w-16 h-16 rounded-full ring-2 ring-primary/20 overflow-hidden">
                    <img
                      src={photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt="avatar"
                      className="object-cover w-full h-full select-none"
                    />
                  </div>
                </div>
                <div className="text-left space-y-0.5">
                  <h2 className="font-bold text-lg text-white leading-snug">
                    {firstName} {lastName}
                  </h2>
                  {about && (
                    <p className="text-xs text-base-content/70 line-clamp-1 pr-2">
                      {about}
                    </p>
                  )}
                  {(age || gender) && (
                    <p className="text-[10px] text-base-content/40 font-semibold tracking-wider uppercase">
                      {age ? `${age} y/o` : ""}{age && gender ? " • " : ""}{gender || ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  className="btn btn-primary btn-sm rounded-xl px-4 bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1 h-10"
                  onClick={() => reviewRequests("accepted", request._id)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Accept</span>
                </button>
                <button
                  className="btn btn-outline border-base-300 hover:border-error hover:bg-error/10 hover:text-error btn-sm rounded-xl px-4 text-base-content/70 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 h-10"
                  onClick={() => reviewRequests("rejected", request._id)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Reject</span>
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