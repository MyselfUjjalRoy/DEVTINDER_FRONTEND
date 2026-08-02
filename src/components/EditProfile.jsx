import { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL, resolveMediaUrl } from "../utils/constants";
import MediaImage from "./MediaImage";
import UserCard from "./UserCard";
import { MembershipBadge } from "../utils/membershipUtils";
import CalendarPicker from "./CalendarPicker";
import GenderSelect from "./GenderSelect";

const AvatarUploadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MAX_TAGS = { skills: 10, hobbies: 5, likes: 5, dislikes: 5 };

const calculateAge = (dob) => {
  if (!dob) return "";
  const [y, m, d] = dob.split("-").map(Number);
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Number.isFinite(age) && age > 0 ? age : "";
};

const toDateInputValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="border-b border-white/10 pb-4 mb-5 flex items-start gap-3">
    <div className="w-9 h-9 shrink-0 bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-black text-white tracking-tight leading-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-base-content/50 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, placeholder, type = "text", hint, validate, ...rest }) => {
  const [error, setError] = useState("");

  const runValidation = (v) => {
    if (typeof validate !== "function") {
      setError("");
      return;
    }
    setError(validate(v) || "");
  };

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">{label}</span>
      </label>
      <input
        type={type}
        {...rest}
        className={`input input-bordered bg-base-900/60 text-white focus:outline-none rounded-xl h-11 text-base sm:text-xs transition-colors ${
          error ? "border-error/60 focus:border-error" : "border-white/10 focus:border-primary"
        }`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (error) runValidation(e.target.value);
        }}
        onBlur={() => runValidation(value)}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
      />
      {error ? (
        <p className="text-[10px] font-bold text-error mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : (
        hint && <p className="text-[10px] text-base-content/40 mt-1">{hint}</p>
      )}
    </div>
  );
};

const TagInput = ({ label, value, onChange, max, placeholder, hint }) => {
  const [draft, setDraft] = useState("");
  const full = value.length >= max;

  const addTag = (raw) => {
    const tag = String(raw || "").trim().replace(/,$/, "");
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">{label}</span>
        <span className="label-text text-[10px] font-black text-base-content/40">{value.length}/{max}</span>
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 bg-base-900/60 transition-colors ${
          full
            ? "border-primary/50"
            : "border-white/10 focus-within:border-primary"
        }`}
      >
        <input
          type="text"
          className="flex-1 min-w-0 bg-transparent text-base sm:text-xs text-white placeholder:text-base-content/30 focus:outline-none h-11"
          value={draft}
          disabled={full}
          placeholder={full ? `Max ${max} added` : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
        />
        <button
          type="button"
          onClick={() => addTag(draft)}
          disabled={full || !draft.trim()}
          className="shrink-0 text-[10px] font-black uppercase tracking-wider text-primary disabled:text-base-content/30 h-11 px-2"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 text-[11px] font-bold"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      {hint && <p className="text-[10px] text-base-content/40 mt-1">{hint}</p>}
    </div>
  );
};

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [dob, setDob] = useState(user?.dob || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [about, setAbout] = useState(user?.about || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [skills, setSkills] = useState(Array.isArray(user?.skills) ? user.skills.filter(Boolean) : []);

  const [city, setCity] = useState(user?.location?.city || "");
  const [country, setCountry] = useState(user?.location?.country || "");
  const [hobbies, setHobbies] = useState(Array.isArray(user?.hobbies) ? user.hobbies.filter(Boolean) : []);
  const [likes, setLikes] = useState(Array.isArray(user?.likes) ? user.likes.filter(Boolean) : []);
  const [dislikes, setDislikes] = useState(Array.isArray(user?.dislikes) ? user.dislikes.filter(Boolean) : []);
  const [photos, setPhotos] = useState(
    Array.isArray(user?.photos) ? user.photos.filter(Boolean) : []
  );

  const [isStudent, setIsStudent] = useState(user?.isStudent ?? true);
  const [college, setCollege] = useState(user?.education?.college || "");
  const [degree, setDegree] = useState(user?.education?.degree || "");
  const [passingYear, setPassingYear] = useState(user?.education?.passingYear || "");
  const [cgpa, setCgpa] = useState(user?.education?.cgpa || "");
  const [company, setCompany] = useState(user?.work?.company || "");
  const [role, setRole] = useState(user?.work?.role || "");
  const [experienceYears, setExperienceYears] = useState(user?.work?.experienceYears || "");

  const [github, setGithub] = useState(user?.github || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [portfolio, setPortfolio] = useState(user?.portfolio || "");
  const [leetcode, setLeetcode] = useState(user?.codingProfiles?.leetcode || "");
  const [gfg, setGfg] = useState(user?.codingProfiles?.gfg || "");
  const [codeforces, setCodeforces] = useState(user?.codingProfiles?.codeforces || "");
  const [codechef, setCodechef] = useState(user?.codingProfiles?.codechef || "");
  const [hackerrank, setHackerrank] = useState(user?.codingProfiles?.hackerrank || "");
  const [codingninjas, setCodingninjas] = useState(user?.codingProfiles?.codingninjas || "");
  const [resumeURL, setResumeURL] = useState(user?.resumeURL || "");

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const photoTargetRef = useRef(-1);
  const dispatch = useDispatch();

  const now = new Date();
  const dobBounds = {
    min: toDateInputValue(new Date(now.getFullYear() - 100, now.getMonth(), now.getDate())),
    max: toDateInputValue(new Date(now.getFullYear() - 15, now.getMonth(), now.getDate())),
  };
  const maxPassingYear = now.getFullYear() + 5;

  const validatePassingYear = (v) => {
    if (!v) return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return "Enter a valid year";
    if (!Number.isInteger(n)) return "Year must be a whole number";
    if (n < 1950) return "Can't be before 1950";
    if (n > maxPassingYear) return `Can't be after ${maxPassingYear}`;
    return "";
  };

  const validateCgpa = (v) => {
    if (!v) return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return "Enter a valid CGPA";
    if (n < 0) return "Can't be negative";
    if (n > 10) return "Can't exceed 10";
    return "";
  };

  const validateExperience = (v) => {
    if (!v) return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return "Enter a valid number";
    if (n < 0) return "Can't be negative";
    if (n > 60) return "Can't exceed 60 years";
    return "";
  };

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

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(BASE_URL + "upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeURL(res.data.url);
      setToastMessage("Resume Uploaded! Save to apply.");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Resume upload failed.");
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const handlePhotoAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(BASE_URL + "upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;
      const target = photoTargetRef.current;
      setPhotos((prev) => {
        const next = [...prev];
        if (target >= 0 && target < 3) {
          next[target] = url;
        } else if (next.length < 3) {
          next.push(url);
        }
        return next;
      });
      setToastMessage("Photo Added! Save to apply.");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    setError("");

    if (dob && !calculateAge(dob)) {
      setError("Please select a valid date of birth.");
      return;
    }
    if (passingYear && (Number(passingYear) < 1950 || Number(passingYear) > maxPassingYear)) {
      setError(`Passing year must be between 1950 and ${maxPassingYear}.`);
      return;
    }
    if (cgpa && (Number(cgpa) < 0 || Number(cgpa) > 10)) {
      setError("CGPA must be between 0 and 10.");
      return;
    }
    if (experienceYears && (Number(experienceYears) < 0 || Number(experienceYears) > 60)) {
      setError("Years of experience must be between 0 and 60.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch(
        BASE_URL + "profile/edit",
        {
          firstName,
          lastName,
          photoURL,
          dob,
          gender,
          about,
          skills,
          location: { city, country },
          hobbies,
          likes,
          dislikes,
          photos: photos.filter(Boolean),
          isStudent,
          education: {
            college,
            degree,
            passingYear: passingYear ? Number(passingYear) : undefined,
            cgpa: cgpa ? Number(cgpa) : undefined,
          },
          work: {
            company,
            role,
            experienceYears: experienceYears ? Number(experienceYears) : undefined,
          },
          codingProfiles: {
            leetcode,
            gfg,
            codeforces,
            codechef,
            hackerrank,
            codingninjas,
          },
          github,
          linkedin,
          portfolio,
          resumeURL,
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

  const previewUser = {
    _id: user?._id || "preview-id",
    firstName: firstName || "Your",
    lastName: lastName || "Name",
    photoURL: photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80",
    age: calculateAge(dob) || 25,
    gender: gender || "Developer",
    about: about || "Write a bio to tell matches what you are coding...",
    skills: skills.length > 0 ? skills : ["React", "JavaScript", "Tailwind"],
    location: { city, country },
    photos: photos.filter(Boolean),
    isStudent,
    education: { college, degree, passingYear: passingYear ? Number(passingYear) : undefined, cgpa: cgpa ? Number(cgpa) : undefined },
    work: { company, role, experienceYears: experienceYears ? Number(experienceYears) : undefined },
    codingProfiles: { leetcode, gfg, codeforces, codechef, hackerrank, codingninjas },
    github,
    linkedin,
    portfolio,
    resumeURL,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">

          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <div className="border-b border-white/10 pb-5 mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight">Edit Developer Profile</h2>
              <p className="text-xs text-base-content/60 mt-1">
                Customize your bio, photo, and tech stack to get matched with right developers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput label="First Name" value={firstName} onChange={setFirstName} placeholder="First Name" />
                <TextInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Last Name" />
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
                      <MediaImage
                        src={photoURL}
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
                  className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-base sm:text-xs rounded-xl h-11 mt-3"
                  value={photoURL.startsWith("/uploads/") ? "" : photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <CalendarPicker
                    label="Date of Birth"
                    value={dob}
                    onChange={setDob}
                    minDate={dobBounds.min}
                    maxDate={dobBounds.max}
                  />
                  <p className="text-[10px] text-base-content/40 mt-1">
                    {dob ? `Age: ${calculateAge(dob)}` : "No age set yet"}
                  </p>
                </div>
                <div className="form-control">
                  <GenderSelect value={gender} onChange={setGender} />
                </div>
              </div>

              <TagInput
                label="Skills"
                value={skills}
                onChange={setSkills}
                max={MAX_TAGS.skills}
                placeholder="Type a skill, press Enter"
                hint={`Add up to ${MAX_TAGS.skills} skills`}
              />

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Developer Bio</span>
                </label>
                <textarea
                  className="textarea textarea-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-base sm:text-xs rounded-xl min-h-[6rem] leading-relaxed resize-none"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell potential matches what tech projects you are building and what skills you are looking to pair on..."
                />
              </div>
            </div>
          </div>

          {/* Personal Details Card */}
          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Personal Details"
              subtitle="Where are you based and what makes you, you?"
            />
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput label="City" value={city} onChange={setCity} placeholder="e.g. Kolkata" />
                <TextInput label="Country" value={country} onChange={setCountry} placeholder="e.g. India" />
              </div>
              <TagInput
                label="Hobbies"
                value={hobbies}
                onChange={setHobbies}
                max={MAX_TAGS.hobbies}
                placeholder="Type a hobby, press Enter"
                hint={`Add up to ${MAX_TAGS.hobbies} hobbies`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TagInput
                  label="Likes"
                  value={likes}
                  onChange={setLikes}
                  max={MAX_TAGS.likes}
                  placeholder="Type a like, press Enter"
                  hint={`Add up to ${MAX_TAGS.likes} likes`}
                />
                <TagInput
                  label="Dislikes"
                  value={dislikes}
                  onChange={setDislikes}
                  max={MAX_TAGS.dislikes}
                  placeholder="Type a dislike, press Enter"
                  hint={`Add up to ${MAX_TAGS.dislikes} dislikes`}
                />
              </div>
            </div>
          </div>

          {/* Personal Photos Card */}
          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Personal Photos"
              subtitle="Add up to 3 photos so matches can see the real you"
            />

            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoAdd}
            />

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((idx) => {
                const url = photos[idx];
                return (
                  <div
                    key={idx}
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-base-900/60 border border-white/10"
                  >
                    {url ? (
                      <>
                        <MediaImage
                          src={url}
                          alt={`Personal photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          title="Remove photo"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center hover:bg-error hover:border-error/50 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          photoTargetRef.current = idx;
                          photoInputRef.current?.click();
                        }}
                        disabled={uploadingPhoto}
                        className="w-full h-full flex flex-col items-center justify-center gap-2 text-base-content/40 hover:text-primary transition-colors"
                      >
                        {uploadingPhoto ? (
                          <span className="loading loading-spinner loading-sm text-primary"></span>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {uploadingPhoto ? "Uploading..." : `Photo ${idx + 1}`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-base-content/40 mt-3">
              {photos.length < 3
                ? `${3 - photos.length} more slot${3 - photos.length === 1 ? "" : "s"} available`
                : "All 3 photo slots used"}
            </p>
          </div>

          {/* Education & Career Card */}
          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              }
              title="Education & Career"
              subtitle="Tell devs whether you are learning or shipping at a company"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setIsStudent(true)}
                className={`h-12 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                  isStudent
                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                    : "bg-base-900/60 border-white/10 text-base-content/50 hover:border-white/25"
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setIsStudent(false)}
                className={`h-12 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                  !isStudent
                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                    : "bg-base-900/60 border-white/10 text-base-content/50 hover:border-white/25"
                }`}
              >
                💼 Working Professional
              </button>
            </div>

            {isStudent ? (
              <div className="space-y-4">
                <TextInput label="College / University" value={college} onChange={setCollege} placeholder="e.g. Jadavpur University" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput label="Degree / Course" value={degree} onChange={setDegree} placeholder="e.g. B.Tech CSE" />
                  <TextInput label="Passing Year" value={passingYear} onChange={setPassingYear} placeholder="e.g. 2027" type="number" min={1950} max={maxPassingYear} hint={`Between 1950 and ${maxPassingYear}`} validate={validatePassingYear} />
                </div>
                <TextInput label="CGPA" value={cgpa} onChange={setCgpa} placeholder="e.g. 8.5" type="number" step="0.01" min={0} max={10} hint="Between 0 and 10" validate={validateCgpa} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput label="Company" value={company} onChange={setCompany} placeholder="e.g. Google, Microsoft, Startup" />
                  <TextInput label="Role / Designation" value={role} onChange={setRole} placeholder="e.g. SDE Intern, Full-Stack Dev" />
                </div>
                <TextInput
                  label="Years of Experience"
                  value={experienceYears}
                  onChange={setExperienceYears}
                  placeholder="e.g. 2"
                  type="number"
                  min={0}
                  max={60}
                  hint="Between 0 and 60 — helpful for matching with devs at a similar stage"
                  validate={validateExperience}
                />
              </div>
            )}
          </div>

          {/* Coding & Social Profiles Card */}
          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }
              title="Coding & Social Profiles"
              subtitle="Add full URL or just your username — links resolve automatically"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <TextInput label="GitHub" value={github} onChange={setGithub} placeholder="github.com/username or username" hint="Required for recruiters" />
              <TextInput label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/username or username" />
              <TextInput label="Portfolio Website" value={portfolio} onChange={setPortfolio} placeholder="yourportfolio.dev" />
              <TextInput label="LeetCode" value={leetcode} onChange={setLeetcode} placeholder="leetcode.com/u/username or username" />
              <TextInput label="GeeksforGeeks" value={gfg} onChange={setGfg} placeholder="auth.geeksforgeeks.org/user/username or username" />
              <TextInput label="Codeforces" value={codeforces} onChange={setCodeforces} placeholder="codeforces.com/profile/username or username" />
              <TextInput label="CodeChef" value={codechef} onChange={setCodechef} placeholder="codechef.com/users/username or username" />
              <TextInput label="HackerRank" value={hackerrank} onChange={setHackerrank} placeholder="hackerrank.com/username or username" />
              <TextInput label="Coding Ninjas" value={codingninjas} onChange={setCodingninjas} placeholder="codingninjas.com/studio/profile/username or username" />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Resume</span>
              </label>
              <input
                type="file"
                ref={resumeInputRef}
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={uploadingResume}
                  className="flex-none inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-base-800/80 border border-white/10 text-white text-xs font-bold hover:border-primary/50 hover:bg-base-800 transition-all"
                >
                  {uploadingResume ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {uploadingResume ? "Uploading..." : "Upload Resume (PDF/DOC)"}
                </button>
                {resumeURL && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-success badge-sm gap-1 shrink-0">Attached</span>
                    <a
                      href={resolveMediaUrl(resumeURL)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-bold truncate hover:underline"
                    >
                      {resumeURL.split("/").pop()}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider flex-shrink-0">or paste resume URL</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <input
                type="text"
                className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-base sm:text-xs rounded-xl h-11 mt-3"
                value={resumeURL.startsWith("/uploads/") ? "" : resumeURL}
                onChange={(e) => setResumeURL(e.target.value)}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error bg-error/15 border border-error/30 text-error rounded-xl text-xs py-3 px-4 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-2xl flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-black text-white">Ready to save?</h3>
              <p className="text-xs text-base-content/50 mt-0.5">Email, password & membership can only be changed via dedicated flows.</p>
            </div>
            <button
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-full sm:w-auto px-8 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 sm:hover:scale-105 active:scale-95 transition-all h-12"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : "Save Profile & Tech Stack"}
            </button>
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
        <div className="lg:col-span-5 flex flex-col items-center order-1 lg:order-2">
          <div className="lg:sticky lg:top-24 w-full flex flex-col items-center space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-primary pl-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Live Card Preview
            </span>
            <div className="flex justify-center w-full">
              <UserCard preview user={previewUser} />
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
