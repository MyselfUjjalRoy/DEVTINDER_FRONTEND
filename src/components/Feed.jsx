import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import UserCard from "./UserCard";
import { Link } from "react-router-dom";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] p-4">
        {/* Skeleton Matching UserCard */}
        <div className="card bg-base-200 border border-base-300 w-96 h-[32rem] shadow-xl rounded-3xl overflow-hidden animate-pulse">
          <div className="bg-base-300 h-80 w-full"></div>
          <div className="card-body p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-base-300 rounded-md w-1/2"></div>
              <div className="h-5 bg-base-300 rounded-md w-1/5"></div>
            </div>
            <div className="h-3 bg-base-300 rounded-md w-1/3"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3.5 bg-base-300 rounded-md w-full"></div>
              <div className="h-3.5 bg-base-300 rounded-md w-5/6"></div>
              <div className="h-3.5 bg-base-300 rounded-md w-4/6"></div>
            </div>
            <div className="flex gap-1.5 mt-4">
              <div className="h-5 bg-base-300 rounded-md w-12"></div>
              <div className="h-5 bg-base-300 rounded-md w-16"></div>
              <div className="h-5 bg-base-300 rounded-md w-14"></div>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="h-12 bg-base-300 rounded-2xl flex-1"></div>
              <div className="h-12 bg-base-300 rounded-2xl flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feed || feed.length <= 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] p-4">
        <div className="card bg-base-200 border border-base-300 max-w-md text-center p-8 rounded-3xl shadow-xl space-y-5">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">All Caught Up!</h1>
            <p className="text-sm text-base-content/65 leading-relaxed">
              No new developer profiles found in your area. Try editing your skills, or check your pending connection requests!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link to="/requests" className="btn btn-outline btn-sm rounded-xl h-10 px-4">
              View Requests
            </Link>
            <Link to="/connections" className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white btn-sm rounded-xl h-10 px-4">
              My Connections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[75vh] p-4">
      <UserCard user={feed[0]} />
    </div>
  );
};

export default Feed;