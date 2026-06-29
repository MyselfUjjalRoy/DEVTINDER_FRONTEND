import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);

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

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (connections.length === 0) {
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-white">No Connections Yet</h1>
            <p className="text-xs text-base-content/65 leading-relaxed mt-1">
              Start connecting with developers in the feed. Once they accept your request, they will appear here!
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white">My Connections</h1>
        <p className="text-sm text-base-content/60 mt-1.5">
          You have <span className="text-secondary font-semibold">{connections.length}</span> active developer connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connections.map((connection) => {
          const { _id, firstName, lastName, photoURL, age, gender, about } = connection;

          return (
            <div
              key={_id}
              className="card bg-base-200 border border-base-300/80 p-5 rounded-2xl flex flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4">
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

              <Link to={"/chat/" + _id} className="shrink-0">
                <button className="btn btn-primary btn-sm rounded-xl px-4 bg-gradient-to-r from-primary to-secondary border-none text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 h-10">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>Chat</span>
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;