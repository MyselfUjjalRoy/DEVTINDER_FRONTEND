import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";
import axios from "axios";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoURL, age, gender, about, skills } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status, _id) => {
    try {
      await axios.post(
        `${BASE_URL}request/send/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(_id));
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  const renderSkills = () => {
    if (!skills) return null;
    const skillArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim())
      : [];
    const validSkills = skillArray.filter((s) => s.length > 0);
    if (validSkills.length === 0) return null;

    return (
      <div className="mt-3.5 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
          Core Skills
        </span>
        <div className="flex flex-wrap gap-1.5">
          {validSkills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="badge badge-sm border-none bg-primary/10 text-primary font-semibold py-2"
            >
              {skill}
            </span>
          ))}
          {validSkills.length > 5 && (
            <span className="badge badge-sm border-none bg-base-300 text-base-content/50 font-semibold py-2">
              +{validSkills.length - 5} more
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="card bg-base-200 border border-base-300 text-base-content w-[23.5rem] sm:w-96 shadow-2xl my-6 transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20 hover:scale-[1.01] overflow-hidden">
      <figure className="relative h-80 w-full overflow-hidden bg-base-300">
        <img
          src={photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"}
          alt={`${firstName} ${lastName}`}
          className="h-full w-full object-cover select-none transition-transform duration-500 hover:scale-[1.03]"
        />
        {/* Soft bottom gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-transparent to-transparent opacity-90 pointer-events-none"></div>
      </figure>

      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white leading-tight">
            {firstName} {lastName}
          </h2>
          {age && (
            <span className="badge badge-neutral text-xs font-bold py-2.5 px-3">
              {age} y/o
            </span>
          )}
        </div>

        {gender && (
          <div className="text-[11px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5 -mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
            {gender}
          </div>
        )}

        <p className="text-sm text-base-content/75 mt-3 line-clamp-3 leading-relaxed h-[4.5rem]">
          {about || "No profile description provided yet. This developer is busy coding."}
        </p>

        {renderSkills()}

        <div className="card-actions justify-between items-center gap-3 mt-6">
          <button
            className="btn btn-outline border-base-300 hover:border-error hover:bg-error/10 hover:text-error flex-1 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 group text-base-content/70 h-12"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            <svg
              className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200 text-base-content/40 group-hover:text-error"
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
            <span className="font-bold text-xs uppercase tracking-wider">Ignore</span>
          </button>

          <button
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white flex-1 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] h-12"
            onClick={() => handleSendRequest("interested", _id)}
          >
            <svg
              className="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform duration-200"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="font-bold text-xs uppercase tracking-wider">Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
