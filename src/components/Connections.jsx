import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredConnections = connections.filter((conn) => {
    const fullName = `${conn.firstName} ${conn.lastName}`.toLowerCase();
    const skillsString = Array.isArray(conn.skills) ? conn.skills.join(" ").toLowerCase() : "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || skillsString.includes(search);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Developer Matches</h1>
          <p className="text-xs text-base-content/60 mt-1">
            You have <span className="text-primary font-bold">{connections.length}</span> active connections ready to pair program.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <label className="input input-bordered bg-base-900/60 border-white/10 focus-within:border-primary flex items-center gap-2 rounded-2xl h-11 text-xs">
            <svg className="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or skill..."
              className="grow text-white placeholder-base-content/40 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
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
            const { _id, firstName, lastName, photoURL, age, gender, about, skills } = connection;
            const skillList = Array.isArray(skills) ? skills : [];

            return (
              <div
                key={_id}
                className="glass-card border border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-primary/30 shadow-xl fade-in"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="avatar shrink-0">
                    <div className="w-16 h-16 rounded-2xl ring-2 ring-primary/30 overflow-hidden bg-base-900">
                      <img
                        src={photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                        alt={firstName}
                        className="object-cover w-full h-full select-none group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                  
                  <div className="text-left space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-lg text-white truncate">
                        {firstName} {lastName}
                      </h2>
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

                <Link to={"/chat/" + _id} className="shrink-0">
                  <button className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white font-bold text-xs rounded-2xl px-5 h-11 shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
                    </svg>
                    Chat
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;