import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [skills, setSkills] = useState(
    Array.isArray(user.skills) ? user.skills.join(", ") : user.skills || ""
  );

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveProfile = async () => {
    setError("");
    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await axios.patch(
        BASE_URL + "profile/edit",
        {
          firstName,
          lastName,
          photoURL,
          age: age ? Number(age) : undefined,
          gender,
          about,
          skills: skillsArray,
        },
        { withCredentials: true }
      );

      dispatch(addUser(res?.data?.data));
      setToastMessage("Profile Updated Successfully!");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || "Failed to update profile details.");
    }
  };

  const handleCancelMembership = async () => {
    setError("");
    try {
      const res = await axios.post(
        BASE_URL + "payment/premium/cancel",
        {},
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.user));
      setToastMessage("Membership Cancelled Successfully!");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || "Failed to cancel membership.");
    }
  };

  const currentSkillsArray = skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7">
          <div className="card bg-base-200 border border-base-300 shadow-2xl rounded-3xl overflow-hidden">
            <div className="card-body p-6 sm:p-8 space-y-4">
              <div className="border-b border-base-300 pb-4 mb-2">
                <h2 className="text-2xl font-black text-white">Edit Profile</h2>
                <p className="text-xs text-base-content/60 mt-1">
                  Update your developer details and showcase your stack to other builders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-base-content/85">First Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl h-11"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-base-content/85">Last Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl h-11"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/85">Photo URL</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl h-11"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  required
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-base-content/85">Age</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl h-11"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    placeholder="Age"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-base-content/85">Gender</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl h-11"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    placeholder="e.g. Male, Female, Non-binary"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/85">Skills (comma-separated)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl h-11"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node, Express, MongoDB, Tailwind"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/85">About Me</span>
                </label>
                <textarea
                  className="textarea textarea-bordered bg-base-300 border-base-200 text-white focus:outline-none focus:border-primary transition-all text-sm rounded-xl min-h-[6rem] leading-relaxed resize-none"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  required
                  placeholder="Tell other developers about yourself, your background, and your goals..."
                />
              </div>

              {error && (
                <div className="alert alert-error bg-error/15 border border-error/25 text-error-content rounded-xl text-xs py-3 px-4 flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="card-actions pt-4 border-t border-base-300 mt-2">
                <button
                  className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full sm:w-auto sm:px-8 rounded-xl font-bold hover:opacity-95 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 h-11"
                  onClick={saveProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Membership & Billing Management Card */}
          <div className="card bg-base-200 border border-base-300 shadow-2xl rounded-3xl overflow-hidden mt-6 text-left">
            <div className="card-body p-6 sm:p-8 space-y-4">
              <div className="border-b border-base-300 pb-4 mb-2">
                <h3 className="text-xl font-black text-white">Membership & Billing</h3>
                <p className="text-xs text-base-content/60 mt-1">
                  Manage your DevFinder premium features and membership status.
                </p>
              </div>

              {user.isPremium ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708.522L4.047 9.05a.75.75 0 00.418.91l4.25 1.7a.75.75 0 00.648-.04l2.5-1.5 2.5 1.5a.75.75 0 00.648.04l4.25-1.7a.75.75 0 00.418-.91l-1.512-5.073a.75.75 0 00-.708-.522H6.267zm-.59 8.243c.125.074.27.113.417.113H13.9a.75.75 0 00.418-.113l1.838-1.103 2.188.875a2.25 2.25 0 01-1.254 2.73l-4.25 1.7a2.25 2.25 0 01-1.944-.12l-2.388-1.433-2.388 1.433a2.25 2.25 0 01-1.944.12l-4.25-1.7A2.25 2.25 0 01.378 11.47l2.188-.875 1.838 1.103z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-white text-sm">{user.membershipType} Membership</h4>
                        <p className="text-[10px] text-warning uppercase font-bold tracking-wider mt-0.5">Active Premium</p>
                      </div>
                    </div>
                    <span className="badge badge-warning text-xs font-bold py-2.5 px-3">PRO</span>
                  </div>

                  <p className="text-xs text-base-content/65 leading-relaxed">
                    You have full access to developer chat sessions and higher request limits. Cancelling will return you to the free plan.
                  </p>

                  <button
                    onClick={handleCancelMembership}
                    className="btn btn-outline btn-error w-full rounded-xl font-bold h-11 transition-all duration-200"
                  >
                    Cancel Membership
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-base-300 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center text-base-content/40">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-base-content/80 text-sm">Free Tier</h4>
                        <p className="text-[10px] text-base-content/40 uppercase font-bold tracking-wider mt-0.5">Limited Access</p>
                      </div>
                    </div>
                    <span className="badge badge-neutral text-xs font-bold py-2.5 px-3">FREE</span>
                  </div>

                  <p className="text-xs text-base-content/65 leading-relaxed">
                    Upgrade to a premium plan to verify your profile, send unlimited connection requests, and unlock direct developer messaging.
                  </p>

                  <Link
                    to="/premium"
                    className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full rounded-xl font-bold h-11 flex items-center justify-center shadow-md shadow-primary/10"
                  >
                    View Premium Plans
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full flex flex-col items-center lg:items-start lg:pl-6 space-y-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40 self-center lg:self-start lg:pl-1">
              Live Card Preview
            </span>
            <div className="flex justify-center w-full">
              <UserCard
                user={{
                  firstName,
                  lastName,
                  photoURL,
                  age,
                  gender,
                  about,
                  skills: currentSkillsArray,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert alert-success rounded-xl shadow-lg border border-success/20 bg-success/90 text-white font-medium text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMessage || "Profile Updated Successfully!"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;