import { useState, useRef, useEffect, useCallback, Fragment } from "react";
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
import { PlatformIcon } from "../utils/profileLinks";
import TiltCard from "./TiltCard";

/* Per-section accent themes — the whole page rethemes as you navigate */
const ACCENTS = {
  basic:      { from: "#ff2d55", to: "#ff708a", glow: "rgba(255,45,85,0.45)",   soft: "rgba(255,45,85,0.14)",   text: "#ff7a96", line: "rgba(255,45,85,0.5)" },
  bio:        { from: "#8b5cf6", to: "#c084fc", glow: "rgba(139,92,246,0.45)",  soft: "rgba(139,92,246,0.16)",  text: "#c4b5fd", line: "rgba(139,92,246,0.5)" },
  personality:{ from: "#06b6d4", to: "#38bdf8", glow: "rgba(6,182,212,0.45)",   soft: "rgba(6,182,212,0.14)",   text: "#7dd3fc", line: "rgba(6,182,212,0.5)" },
  photos:     { from: "#10b981", to: "#34d399", glow: "rgba(16,185,129,0.45)",  soft: "rgba(16,185,129,0.14)",  text: "#6ee7b7", line: "rgba(16,185,129,0.5)" },
  career:     { from: "#f59e0b", to: "#fbbf24", glow: "rgba(245,158,11,0.45)",  soft: "rgba(245,158,11,0.15)",  text: "#fcd34d", line: "rgba(245,158,11,0.5)" },
  social:     { from: "#6366f1", to: "#818cf8", glow: "rgba(99,102,241,0.45)",  soft: "rgba(99,102,241,0.16)",  text: "#a5b4fc", line: "rgba(99,102,241,0.5)" },
  membership: { from: "#fbbf24", to: "#f59e0b", glow: "rgba(251,191,36,0.5)",   soft: "rgba(251,191,36,0.15)",  text: "#fde68a", line: "rgba(251,191,36,0.55)" },
};

const BRAND_TINT = {
  github: "#181717",
  linkedin: "#0A66C2",
  portfolio: "#8b5cf6",
  leetcode: "#FFA116",
  gfg: "#2F8D46",
  codeforces: "#1F8ACB",
  codechef: "#8b5cf6",
  hackerrank: "#00EA64",
  codingninjas: "#DD6620",
};

const AvatarUploadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const MAX_TAGS = { skills: 10, hobbies: 5, likes: 5, dislikes: 5 };
const TAG_CHAR_LIMIT = 30;
const TOTAL_SECTIONS = 7;

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

const AutoSaveIndicator = ({ status }) => {
  const config = {
    idle: null,
    dirty: {
      dot: "bg-amber-400",
      text: "Unsaved changes",
      cls: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    },
    saving: {
      dot: "bg-cyan-400 animate-pulse",
      text: "Saving...",
      cls: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    },
    saved: {
      dot: "bg-emerald-400",
      text: "All changes saved",
      cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    },
    error: {
      dot: "bg-rose-400",
      text: "Auto-save failed",
      cls: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    },
    paused: {
      dot: "bg-amber-400 animate-pulse",
      text: "Fixing fields to save...",
      cls: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    },
  }[status];

  if (!config) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${config.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.text}
    </div>
  );
};

const Stagger = ({ children, delay = 0, className = "" }) => (
  <div className={`stagger-in ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const SECTION_HINTS = {
  basic: "Name, avatar & date of birth",
  bio: "Your story & the tech you use",
  personality: "Location, hobbies & likes",
  photos: "Up to 3 personal photos",
  career: "Education or work details",
  social: "Coding profiles & links",
  membership: "Subscription status",
};

const StepMedallion = ({ s, isActive, isDone, size = "sm" }) => {
  const sz = size === "lg" ? "w-10 h-10 rounded-xl" : "w-9 h-9 rounded-full";
  return (
    <span
      className={`relative shrink-0 flex items-center justify-center border transition-all duration-300 ${sz} ${
        isActive ? "scale-110" : ""
      }`}
      style={
        isActive
          ? {
              background: `linear-gradient(135deg, ${s.accent.from}, ${s.accent.to})`,
              borderColor: "transparent",
              boxShadow: `0 8px 24px -6px ${s.accent.glow}`,
              color: "#fff",
            }
          : isDone
            ? {
                background: s.accent.soft,
                borderColor: s.accent.line,
                color: s.accent.text,
              }
            : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.35)" }
      }
    >
      {isActive && (
        <>
          <span className="step-aura" style={{ "--aura-color": s.accent.line }} aria-hidden="true" />
        </>
      )}
      {isDone ? (
        <svg className="w-3.5 h-3.5 animate-pop-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        s.icon
      )}
    </span>
  );
};

const TextInput = ({ label, value, onChange, placeholder, type = "text", hint, validate, icon, ...rest }) => {
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
      <div className="relative">
        {icon && (
          <span
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 pointer-events-none border border-white/10"
            style={{ backgroundColor: BRAND_TINT[icon] || "#8b5cf6" }}
          >
            <PlatformIcon platform={icon} className="w-4 h-4 text-white" />
          </span>
        )}
        <input
          type={type}
          {...rest}
          className={`input input-bordered bg-base-900/60 text-white focus:outline-none rounded-xl h-11 text-base sm:text-xs transition-colors input-glow ${
            icon ? "pl-11" : ""
          } ${error ? "border-error/60 focus:border-error" : "border-white/10 focus:border-primary"}`}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) runValidation(e.target.value);
          }}
          onBlur={() => runValidation(value)}
          aria-invalid={Boolean(error)}
          placeholder={placeholder}
        />
      </div>
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

const TagInput = ({ label, value, onChange, max, placeholder, hint, maxChars = TAG_CHAR_LIMIT }) => {
  const [draft, setDraft] = useState("");
  const full = value.length >= max;

  const addTag = (raw) => {
    const tag = String(raw || "").trim().replace(/,$/, "").slice(0, maxChars);
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
        className={`flex items-center gap-2 rounded-xl border px-3 bg-base-900/60 transition-all input-glow ${
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
          maxLength={maxChars}
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
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 text-[11px] font-bold animate-pop-check"
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

const StepHeader = ({ step, title, subtitle, icon, accent }) => (
  <div className="flex items-center gap-3 mb-6">
    <div
      className="relative shrink-0"
      style={{ background: accent.soft, borderColor: accent.line, boxShadow: `0 8px 25px -10px ${accent.glow}` }}
    >
      <div className="w-11 h-11 rounded-2xl border flex items-center justify-center" style={{ color: accent.text }}>
        {icon}
      </div>
      <span
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg"
        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
      >
        {step}
      </span>
    </div>
    <div>
      <h3 className="text-lg font-black text-white tracking-tight leading-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-base-content/50 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const ProgressRing = ({ pct, accent }) => {
  const size = 84;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#progGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
        <defs>
          <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent.from} />
            <stop offset="100%" stopColor={accent.to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white leading-none">{pct}%</span>
        <span className="text-[7px] font-bold uppercase tracking-widest text-base-content/50 mt-0.5">complete</span>
      </div>
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
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const photoTargetRef = useRef(-1);
  const dispatch = useDispatch();

  // ── Wizard navigation state ──────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [slideDir, setSlideDir] = useState(1); // 1 = forward (right), -1 = backward (left)
  const contentRef = useRef(null);

  // ── Auto-save ────────────────────────────────────────────────────────
  const buildPayload = () => ({
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
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState("idle"); // idle | dirty | saving | saved | error | paused
  const initialSnapshotRef = useRef(null);
  const payloadRef = useRef(null);
  const dirtyRef = useRef(false);
  const autoSaveTimer = useRef(null);
  const autoSaveSeq = useRef(0);

  const validateFields = () => {
    if (dob && !calculateAge(dob)) return "Please select a valid date of birth.";
    if (passingYear && (Number(passingYear) < 1950 || Number(passingYear) > maxPassingYear)) {
      return `Passing year must be between 1950 and ${maxPassingYear}.`;
    }
    if (cgpa && (Number(cgpa) < 0 || Number(cgpa) > 10)) {
      return "CGPA must be between 0 and 10.";
    }
    if (experienceYears && (Number(experienceYears) < 0 || Number(experienceYears) > 60)) {
      return "Years of experience must be between 0 and 60.";
    }
    return "";
  };

  const runAutoSave = async () => {
    setError("");
    const validationError = validateFields();
    if (validationError) {
      // Invalid mid-typing values (e.g. partial year) pause auto-save;
      // it resumes automatically once the field is valid again.
      setAutoSaveStatus("paused");
      return;
    }
    const seq = ++autoSaveSeq.current;
    setAutoSaveStatus("saving");
    try {
      const res = await axios.patch(BASE_URL + "profile/edit", payloadRef.current, {
        withCredentials: true,
      });
      if (seq !== autoSaveSeq.current) return;
      dispatch(addUser(res?.data?.data));
      initialSnapshotRef.current = JSON.stringify(payloadRef.current);
      dirtyRef.current = false;
      setAutoSaveStatus("saved");
    } catch (err) {
      if (seq !== autoSaveSeq.current) return;
      console.error(err);
      dirtyRef.current = true;
      setAutoSaveStatus("error");
    }
  };

  // Debounced auto-save on any field change (skips the initial mount render).
  useEffect(() => {
    const current = buildPayload();
    payloadRef.current = current;
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify(current);
      return;
    }
    const changed = JSON.stringify(current) !== initialSnapshotRef.current;
    if (!changed) {
      dirtyRef.current = false;
      setAutoSaveStatus("idle");
      return;
    }
    dirtyRef.current = true;
    setAutoSaveStatus("dirty");
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(runAutoSave, 1500);
    return () => clearTimeout(autoSaveTimer.current);
  }, [firstName, lastName, dob, gender, about, photoURL, skills, city, country, hobbies, likes, dislikes, photos, isStudent, college, degree, passingYear, cgpa, company, role, experienceYears, github, linkedin, portfolio, leetcode, gfg, codeforces, codechef, hackerrank, codingninjas, resumeURL]);

  // Fade the "Saved" pill back to idle after a moment.
  useEffect(() => {
    if (autoSaveStatus === "saved") {
      const t = setTimeout(() => setAutoSaveStatus("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [autoSaveStatus]);

  // Flush any pending changes if the user leaves before the debounce fires.
  useEffect(() => {
    return () => {
      clearTimeout(autoSaveTimer.current);
      if (dirtyRef.current && payloadRef.current) {
        axios
          .patch(BASE_URL + "profile/edit", payloadRef.current, { withCredentials: true })
          .catch(() => {});
      }
    };
  }, []);

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
      setToastMessage("Photo Uploaded! Auto-saving...");
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
      setToastMessage("Resume Uploaded! Auto-saving...");
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
      setToastMessage("Photo Added! Auto-saving...");
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
    lastName: lastName,
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

  // ── Profile strength ─────────────────────────────────────────────────
  const completionChecks = [
    { label: "Full name", done: !!(firstName && lastName) },
    { label: "Avatar photo", done: !!photoURL || photos.length > 0 },
    { label: "Date of birth", done: !!dob },
    { label: "Gender", done: !!gender },
    { label: "Bio", done: !!about },
    { label: "Skills", done: skills.length > 0 },
    { label: "Location", done: !!(city && country) },
    { label: "Hobbies & interests", done: hobbies.length > 0 },
    { label: "Personal photos", done: photos.length > 0 },
    {
      label: isStudent ? "Education details" : "Work details",
      done: isStudent ? !!(college && degree && passingYear) : !!(company && role),
    },
    { label: "GitHub or LinkedIn", done: !!(github || linkedin) },
    { label: "Coding profile", done: !!(leetcode || gfg || codeforces || codechef || hackerrank || codingninjas) },
    { label: "Resume", done: !!resumeURL },
  ];
  const completionPct = Math.round(
    (completionChecks.filter((c) => c.done).length / completionChecks.length) * 100
  );

  // ── Wizard: sections ─────────────────────────────────────────────────
  const sections = [
    {
      id: "basic",
      label: "Basic Info",
      accent: ACCENTS.basic,
      complete: !!(firstName && lastName && photoURL && dob && gender),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "bio",
      label: "Bio & Skills",
      accent: ACCENTS.bio,
      complete: !!(about && skills.length > 0),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
    {
      id: "personality",
      label: "Personality",
      accent: ACCENTS.personality,
      complete: !!(city && country && hobbies.length > 0),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "photos",
      label: "Photos",
      accent: ACCENTS.photos,
      complete: photos.length > 0,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "career",
      label: "Education & Work",
      accent: ACCENTS.career,
      complete: isStudent ? !!(college && degree && passingYear) : !!(company && role),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
    },
    {
      id: "social",
      label: "Coding & Links",
      accent: ACCENTS.social,
      complete: !!((github || linkedin) && (leetcode || gfg || codeforces || codechef || hackerrank || codingninjas)),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      id: "membership",
      label: "Membership",
      accent: ACCENTS.membership,
      complete: !!user?.isPremium,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l1.912 5.813a2 2 0 001.9 1.374H21.5l-4.944 3.593a2 2 0 00-.725 2.236l1.888 5.738-4.945-3.592a2 2 0 00-2.348 0l-4.945 3.592 1.888-5.738a2 2 0 00-.725-2.236L2.5 10.187h5.688a2 2 0 001.9-1.374L12 3z" />
        </svg>
      ),
    },
  ];

  const goTo = useCallback(
    (idx, opts = {}) => {
      if (idx < 0 || idx >= TOTAL_SECTIONS || idx === activeStep) return;
      setSlideDir(idx > activeStep ? 1 : -1);
      setActiveStep(idx);
      if (opts.scroll) {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [activeStep]
  );

  // Keyboard navigation (skip when typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") goTo(activeStep + 1);
      if (e.key === "ArrowLeft") goTo(activeStep - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeStep, goTo]);

  const heroPhoto =
    photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80";
  const aboutLeft = 300 - about.length;
  const active = sections[activeStep];
  const accent = active.accent;
  const stepNumber = String(activeStep + 1).padStart(2, "0");
  const lastStep = activeStep === TOTAL_SECTIONS - 1;
  const completedCount = sections.filter((s) => s.complete).length;

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-10">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="glass-card rounded-[2rem] border border-white/10 backdrop-blur-2xl relative overflow-hidden mb-6">
        <div
          className="absolute inset-x-0 top-0 h-px transition-colors duration-700"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.line}, transparent)` }}
        />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with static accent ring */}
          <div className="relative shrink-0">
            <div
              className="rounded-full p-[3px] transition-all duration-700"
              style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`, boxShadow: `0 10px 30px -8px ${accent.glow}` }}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-black/50 bg-base-900">
                <MediaImage src={heroPhoto} alt="Profile avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl text-white flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
            >
              <PencilIcon className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {firstName || "Your"} {lastName}
              </h2>
              <AutoSaveIndicator status={autoSaveStatus} />
            </div>
            <p className="text-xs text-base-content/60 mt-1.5">
              Complete each section — changes save automatically as you type.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 border text-[10px] font-black uppercase tracking-widest transition-colors duration-500"
              style={{ borderColor: accent.line, backgroundColor: accent.soft, color: accent.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent.from }} />
              {active.label} · Step {stepNumber}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                {completedCount} of {TOTAL_SECTIONS} done
              </span>
              <span className="text-[10px] font-bold mt-1" style={{ color: accent.text }}>
                {completionPct}% complete
              </span>
            </div>
            <ProgressRing pct={completionPct} accent={accent} />
          </div>
        </div>
      </div>

      {/* ── Mobile step dots (compact) ───────────────────────────────── */}
      <nav className="lg:hidden sticky top-16 z-40 glass-nav-aesthetic border-b border-white/10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s, i) => {
            const isActive = i === activeStep;
            const isDone = s.complete;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i, { scroll: true })}
                aria-label={`${s.label}${isDone ? " (completed)" : ""}`}
                aria-current={isActive ? "step" : undefined}
                className="shrink-0 group"
              >
                <StepMedallion s={s} isActive={isActive} isDone={isDone} />
              </button>
            );
          })}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)_23rem] gap-8 items-start mt-8">
        {/* ── Vertical setup checklist (desktop) ─────────────────────── */}
        <aside className="hidden lg:block sticky top-24 order-1">
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-4 pl-1">
            Setup checklist
          </span>
          <ol className="relative">
            {sections.map((s, i) => {
              const isActive = i === activeStep;
              const isDone = s.complete;
              const passed = isDone || i < activeStep;
              return (
                <Fragment key={s.id}>
                  <li>
                    <button
                      type="button"
                      onClick={() => goTo(i, { scroll: true })}
                      aria-current={isActive ? "step" : undefined}
                      className={`w-full flex items-center gap-3 rounded-2xl p-2.5 text-left transition-all duration-300 group ${
                        isActive ? "bg-white/[0.06] ring-1 ring-white/10" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <StepMedallion s={s} isActive={isActive} isDone={isDone} size="lg" />
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-[11px] font-black uppercase tracking-wider transition-colors duration-300 ${
                            isActive ? "text-white" : isDone ? "text-base-content/70" : "text-base-content/40"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span
                          className={`block text-[10px] font-medium mt-0.5 truncate transition-colors duration-300 ${
                            isActive ? "text-base-content/60" : "text-base-content/30"
                          }`}
                        >
                          {SECTION_HINTS[s.id]}
                        </span>
                      </span>
                      {isActive && (
                        <span
                          className="shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: s.accent.from }}
                        />
                      )}
                    </button>
                  </li>
                  {i < TOTAL_SECTIONS - 1 && (
                    <div
                      className="relative h-9 w-[2px] -mt-2.5 mb-2.5 ml-[29px]"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 rounded-full bg-white/10" />
                      <div
                        className={`absolute inset-0 rounded-full ${passed ? "rail-sec-line" : ""}`}
                        style={{
                          "--h1": s.accent.from,
                          "--h2": s.accent.to,
                          transform: passed ? "none" : "scaleY(0)",
                          transformOrigin: "top center",
                        }}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </aside>

        {/* ── Active section panel ───────────────────────────────────── */}
        <div className="space-y-6 order-2">
          <div ref={contentRef} className="scroll-mt-40">
            <div
              key={activeStep}
              className={`glass-card shadow-2xl rounded-[2rem] border border-white/10 p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden ${slideDir === 1 ? "step-in-right" : "step-in-left"}`}
            >
              {/* accent top hairline */}
              <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />

              <StepHeader step={stepNumber} title={active.label} icon={active.icon} accent={accent} subtitle={SECTION_HINTS[active.id]} />

              {error && (
                <div className="alert alert-error bg-error/15 border border-error/30 text-error rounded-xl text-xs py-3 px-4 flex items-center gap-2 mb-5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* ── Step 1 · Basic Info ─────────────────────────────── */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  <Stagger delay={0}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput label="First Name" value={firstName} onChange={setFirstName} placeholder="First Name" maxLength={50} />
                      <TextInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Last Name" maxLength={50} />
                    </div>
                  </Stagger>

                  <Stagger delay={45}>
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
                          className="flex-none inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-base-800/80 border border-white/10 text-white text-xs font-bold hover:border-primary/50 hover:bg-base-800 hover:shadow-lg hover:shadow-primary/10 transition-all"
                        >
                          {uploading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <AvatarUploadIcon className="w-4 h-4" />
                          )}
                          {uploading ? "Uploading..." : "Upload from Device"}
                        </button>
                        {photoURL && (
                          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-base-800 border border-white/10 shadow-lg">
                            <MediaImage src={photoURL} alt="Avatar preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider flex-shrink-0">or paste image URL</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                      <input
                        type="text"
                        className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-base sm:text-xs rounded-xl h-11 mt-3 input-glow"
                        value={photoURL.startsWith("/uploads/") ? "" : photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </Stagger>

                  <Stagger delay={90}>
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
                  </Stagger>
                </div>
              )}

              {/* ── Step 2 · Bio & Skills ───────────────────────────── */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <Stagger delay={0}>
                    <TagInput
                      label="Skills"
                      value={skills}
                      onChange={setSkills}
                      max={MAX_TAGS.skills}
                      placeholder="Type a skill, press Enter"
                      hint={`Add up to ${MAX_TAGS.skills} skills`}
                    />
                  </Stagger>

                  <Stagger delay={45}>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-[11px] font-bold uppercase tracking-wider text-base-content/70">Developer Bio</span>
                        <span
                          className={`label-text text-[10px] font-black ${
                            aboutLeft <= 20 ? "text-error" : aboutLeft <= 50 ? "text-amber-400" : "text-base-content/40"
                          }`}
                        >
                          {about.length}/300
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-base sm:text-xs rounded-xl min-h-[6.5rem] leading-relaxed resize-none input-glow"
                        value={about}
                        maxLength={300}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Tell potential matches what tech projects you are building and what skills you are looking to pair on..."
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-base-content/40">
                          {aboutLeft === 0 ? "Bio is full" : `${aboutLeft} characters remaining`}
                        </span>
                        {aboutLeft <= 50 && (
                          <span className={`text-[10px] font-black ${aboutLeft <= 20 ? "text-error" : "text-amber-400"}`}>
                            {aboutLeft <= 20 ? "Almost full!" : "Getting long — trim a little"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Stagger>
                </div>
              )}

              {/* ── Step 3 · Personality ────────────────────────────── */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <Stagger delay={0}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput label="City" value={city} onChange={setCity} placeholder="e.g. Kolkata" maxLength={60} />
                      <TextInput label="Country" value={country} onChange={setCountry} placeholder="e.g. India" maxLength={60} />
                    </div>
                  </Stagger>
                  <Stagger delay={45}>
                    <TagInput
                      label="Hobbies"
                      value={hobbies}
                      onChange={setHobbies}
                      max={MAX_TAGS.hobbies}
                      placeholder="Type a hobby, press Enter"
                      hint={`Add up to ${MAX_TAGS.hobbies} hobbies`}
                    />
                  </Stagger>
                  <Stagger delay={90}>
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
                  </Stagger>
                </div>
              )}

              {/* ── Step 4 · Photos ─────────────────────────────────── */}
              {activeStep === 3 && (
                <div className="space-y-3">
                  <Stagger delay={0}>
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
                            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-base-900/60 border border-white/10 group"
                          >
                            {url ? (
                              <>
                                <MediaImage
                                  src={url}
                                  alt={`Personal photo ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                                <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider text-white/80 bg-black/40 rounded-full px-2 py-0.5">
                                  Photo {idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(idx)}
                                  title="Remove photo"
                                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center hover:bg-error hover:border-error/50 transition-all opacity-0 group-hover:opacity-100"
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
                                className="w-full h-full flex flex-col items-center justify-center gap-2 text-base-content/40 hover:text-primary transition-colors border-2 border-dashed border-white/10 hover:border-primary/40 rounded-2xl"
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
                  </Stagger>
                  <Stagger delay={45}>
                    <p className="text-[10px] text-base-content/40">
                      {photos.length < 3
                        ? `${3 - photos.length} more slot${3 - photos.length === 1 ? "" : "s"} available`
                        : "All 3 photo slots used"}
                    </p>
                  </Stagger>
                </div>
              )}

              {/* ── Step 5 · Education & Work ───────────────────────── */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <Stagger delay={0}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      <button
                        type="button"
                        onClick={() => setIsStudent(true)}
                        className={`flex items-center gap-3 px-4 h-14 rounded-2xl border transition-all ${
                          isStudent
                            ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                            : "bg-base-900/60 border-white/10 text-base-content/50 hover:border-white/25"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-lg shrink-0">
                          🎓
                        </span>
                        <span className="text-left">
                          <span className="block text-xs font-black uppercase tracking-wider">Student</span>
                          <span className="block text-[9px] font-bold text-base-content/40">Currently studying</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsStudent(false)}
                        className={`flex items-center gap-3 px-4 h-14 rounded-2xl border transition-all ${
                          !isStudent
                            ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                            : "bg-base-900/60 border-white/10 text-base-content/50 hover:border-white/25"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-lg shrink-0">
                          💼
                        </span>
                        <span className="text-left">
                          <span className="block text-xs font-black uppercase tracking-wider">Working Professional</span>
                          <span className="block text-[9px] font-bold text-base-content/40">Shipping at a company</span>
                        </span>
                      </button>
                    </div>
                  </Stagger>

                  {isStudent ? (
                    <Stagger delay={45}>
                      <div className="space-y-4">
                        <TextInput label="College / University" value={college} onChange={setCollege} placeholder="e.g. Jadavpur University" maxLength={100} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TextInput label="Degree / Course" value={degree} onChange={setDegree} placeholder="e.g. B.Tech CSE" maxLength={100} />
                          <TextInput label="Passing Year" value={passingYear} onChange={setPassingYear} placeholder="e.g. 2027" type="number" min={1950} max={maxPassingYear} hint={`Between 1950 and ${maxPassingYear}`} validate={validatePassingYear} />
                        </div>
                        <TextInput label="CGPA" value={cgpa} onChange={setCgpa} placeholder="e.g. 8.5" type="number" step="0.01" min={0} max={10} hint="Between 0 and 10" validate={validateCgpa} />
                      </div>
                    </Stagger>
                  ) : (
                    <Stagger delay={45}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TextInput label="Company" value={company} onChange={setCompany} placeholder="e.g. Google, Microsoft, Startup" maxLength={100} />
                          <TextInput label="Role / Designation" value={role} onChange={setRole} placeholder="e.g. SDE Intern, Full-Stack Dev" maxLength={100} />
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
                    </Stagger>
                  )}
                </div>
              )}

              {/* ── Step 6 · Coding & Links ─────────────────────────── */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <Stagger delay={0}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput label="GitHub" value={github} onChange={setGithub} placeholder="github.com/username or username" hint="Required for recruiters" maxLength={500} icon="github" />
                      <TextInput label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/username or username" maxLength={500} icon="linkedin" />
                      <TextInput label="Portfolio Website" value={portfolio} onChange={setPortfolio} placeholder="yourportfolio.dev" maxLength={500} icon="portfolio" />
                      <TextInput label="LeetCode" value={leetcode} onChange={setLeetcode} placeholder="leetcode.com/u/username or username" maxLength={200} icon="leetcode" />
                      <TextInput label="GeeksforGeeks" value={gfg} onChange={setGfg} placeholder="auth.geeksforgeeks.org/user/username or username" maxLength={200} icon="gfg" />
                      <TextInput label="Codeforces" value={codeforces} onChange={setCodeforces} placeholder="codeforces.com/profile/username or username" maxLength={200} icon="codeforces" />
                      <TextInput label="CodeChef" value={codechef} onChange={setCodechef} placeholder="codechef.com/users/username or username" maxLength={200} icon="codechef" />
                      <TextInput label="HackerRank" value={hackerrank} onChange={setHackerrank} placeholder="hackerrank.com/username or username" maxLength={200} icon="hackerrank" />
                      <TextInput label="Coding Ninjas" value={codingninjas} onChange={setCodingninjas} placeholder="codingninjas.com/studio/profile/username or username" maxLength={200} icon="codingninjas" />
                    </div>
                  </Stagger>

                  <Stagger delay={45}>
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
                          className="flex-none inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-base-800/80 border border-white/10 text-white text-xs font-bold hover:border-primary/50 hover:bg-base-800 hover:shadow-lg hover:shadow-primary/10 transition-all"
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
                        className="input input-bordered bg-base-900/60 border-white/10 text-white focus:outline-none focus:border-primary text-base sm:text-xs rounded-xl h-11 mt-3 input-glow"
                        value={resumeURL.startsWith("/uploads/") ? "" : resumeURL}
                        onChange={(e) => setResumeURL(e.target.value)}
                        placeholder="https://example.com/resume.pdf"
                      />
                    </div>
                  </Stagger>
                </div>
              )}

              {/* ── Step 7 · Membership ─────────────────────────────── */}
              {activeStep === 6 && (
                <div className="space-y-4">
                  <Stagger delay={0}>
                    {user?.isPremium ? (
                      <>
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
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </Stagger>
                </div>
              )}

              {/* ── Step footer navigation ──────────────────────────── */}
              <div className="flex items-center justify-between gap-3 pt-5 mt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goTo(activeStep - 1)}
                  disabled={activeStep === 0}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/10 text-white text-xs font-black uppercase tracking-wider hover:border-primary/50 hover:text-primary transition-all disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="hidden sm:flex items-center gap-1.5">
                  {sections.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(i, { scroll: true })}
                      aria-label={`Go to section ${i + 1}`}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={
                        i === activeStep
                          ? { width: "2rem", background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }
                          : i < activeStep
                            ? { width: "0.75rem", background: accent.soft, border: `1px solid ${accent.line}` }
                            : { width: "0.75rem", background: "rgba(255,255,255,0.1)" }
                      }
                    />
                  ))}
                </div>

                {!lastStep ? (
                  <button
                    type="button"
                    onClick={() => goTo(activeStep + 1)}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`, boxShadow: `0 10px 30px -8px ${accent.glow}` }}
                  >
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all"
                  >
                    All Done
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card shadow-2xl rounded-3xl border border-white/10 p-5 backdrop-blur-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AutoSaveIndicator status={autoSaveStatus} />
              <div>
                <h3 className="font-black text-white text-sm">Everything saves automatically</h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Tip: use <kbd className="px-1.5 py-0.5 rounded-md bg-base-800 border border-white/10 text-[10px] font-bold">←</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded-md bg-base-800 border border-white/10 text-[10px] font-bold">→</kbd> keys to switch sections.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Live Preview + Strength ──────────────────── */}
        <div className="flex flex-col items-center order-3">
          <div className="lg:sticky lg:top-40 w-full flex flex-col items-center space-y-5">

            <span
              className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] pl-1 transition-colors duration-500"
              style={{ color: accent.text }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent.from }}></span>
              Live Card Preview
            </span>
            <div className="flex justify-center w-full">
              <TiltCard className="rounded-[2rem]">
                <UserCard preview user={previewUser} />
              </TiltCard>
            </div>

            {/* Profile Strength */}
            <div className="glass-card rounded-3xl border border-white/10 backdrop-blur-2xl p-5 w-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-base-content/60">Profile Strength</h3>
                <span className="text-[10px] font-black" style={{ color: accent.text }}>{completionPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${completionPct}%`, background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
                />
              </div>
              <ul className="space-y-1.5">
                {completionChecks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-[11px] font-semibold text-base-content/70">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        c.done
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-base-800 text-base-content/30 border border-white/10"
                      }`}
                    >
                      {c.done ? "✓" : ""}
                    </span>
                    <span className={c.done ? "" : "opacity-60"}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro tip */}
            <div className="glass-card rounded-3xl border border-white/10 backdrop-blur-2xl p-5 w-full flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: accent.soft, color: accent.text, border: `1px solid ${accent.line}` }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Pro Tip</h4>
                <p className="text-[11px] text-base-content/50 mt-0.5 leading-relaxed">
                  Profiles with a photo, a bio and at least one coding profile get up to 3×
                  more connections. Fill in the missing items above to boost your match rate.
                </p>
              </div>
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
