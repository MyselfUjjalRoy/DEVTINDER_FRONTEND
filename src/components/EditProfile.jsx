import { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL, resolveMediaUrl } from "../utils/constants";
import UserCard from "./UserCard";
import { MembershipBadge } from "../utils/membershipUtils";

const AvatarUploadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [about, setAbout] = useState(user?.about || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [skills, setSkills] = useState(
    Array.isArray(user?.skills) ? user.skills.join(", ") : user?.skills || ""
  );

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(BASE_URL + "upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoURL(res.data.url);
      setToastMessage("Photo Uploaded! Save to apply.");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Photo upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveProfile = async () => {
    setError("");
    setLoading(true);
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
      setToastMessage("Developer Profile Updated Successfully!");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || "Failed to update profile details.");
    } finally {
      setLoading(false);
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
      setTimeout(() => setToast(false), 3000);
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
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <div className="border-b border-white/10 pb-5 mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight">Edit Developer Profile</h2>
              <p className="text-xs text-base-content/60 mt-1">
                Customize your bio, photo, and tech stack to get matched with right developers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">First Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl h-11"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Last Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl h-11"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Avatar Photo</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-none inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-base-800/80 border border-white/10 text-white text-xs font-bold hover:border-primary/50 hover:bg-base-800 transition-all"
                  >
                    {uploading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <AvatarUploadIcon className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload from Device"}
                  </button>
                  {photoURL && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-base-800 border border-white/10">
                      <img
                        src={resolveMediaUrl(photoURL)}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider flex-shrink-0">or paste image URL</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <input
                  type="text"
                  className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl h-11 mt-3"
                  value={photoURL.startsWith("/uploads/") ? "" : photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Age</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl h-11"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Gender</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl h-11"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="e.g. Male, Female, Non-binary"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Skills (comma-separated)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl h-11"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React 19, Redux, Node.js, TypeScript, Tailwind"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Developer Bio</span>
                </label>
                <textarea
                  className="textarea textarea-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-xs rounded-xl min-h-[6rem] leading-relaxed resize-none"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell potential matches what tech projects you are building and what skills you are looking to pair on..."
                />
              </div>

              {error && (
                <div className="alert alert-error bg-error/15 border border-error/30 text-error rounded-xl text-xs py-3 px-4 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <button
                  className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full sm:w-auto px-8 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all h-12"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? <span className="loading loading-spinner loading-xs"></span> : "Save Profile & Tech Stack"}
                </button>
              </div>
            </div>
          </div>

          {/* Membership Management Card */}
          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <div className="border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xl font-black text-white">Membership Tier</h3>
              <p className="text-xs text-base-content/60 mt-1">
                DevTinder Subscription Status
              </p>
            </div>

            {user?.isPremium ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                      👑
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm">{(user.membershipType || "Gold").toUpperCase()} Pass Active</h4>
                        <MembershipBadge membershipType={user.membershipType} isPremium={user.isPremium} size="sm" />
                      </div>
                      <p className="text-[10px] text-amber-400/90 font-bold tracking-wider mt-1">
                        Verified Member Badge & Direct Socket Messaging Enabled
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCancelMembership}
                  className="btn btn-outline border-error/40 text-error hover:bg-error/15 w-full rounded-2xl font-bold text-xs h-11 transition-all"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-900/60 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-base-800 rounded-xl flex items-center justify-center text-base-content/40">
                      ⚡
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-white text-sm">Free Developer Tier</h4>
                      <p className="text-[10px] text-base-content/40 uppercase font-bold tracking-wider mt-0.5">Standard Feed</p>
                    </div>
                  </div>
                  <span className="badge badge-neutral text-xs font-bold py-2 px-3">FREE</span>
                </div>

                <Link
                  to="/premium"
                  className="btn btn-primary bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black border-none w-full rounded-2xl h-11 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform text-xs"
                >
                  Upgrade to DevTinder Pro Pass ★
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full flex flex-col items-center space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-primary pl-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Live Card Preview
            </span>
            <div className="flex justify-center w-full">
              <UserCard
                preview
                user={{
                  _id: user?._id || "preview-id",
                  firstName: firstName || "Your",
                  lastName: lastName || "Name",
                  photoURL: photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80",
                  age: age ? Number(age) : 25,
                  gender: gender || "Developer",
                  about: about || "Write a bio to tell matches what you are coding...",
                  skills: currentSkillsArray.length > 0 ? currentSkillsArray : ["React", "JavaScript", "Tailwind"],
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-end z-[99] mt-16 p-4">
          <div className="alert bg-emerald-500 text-white rounded-2xl shadow-xl border border-emerald-400 font-bold text-xs flex items-center gap-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;