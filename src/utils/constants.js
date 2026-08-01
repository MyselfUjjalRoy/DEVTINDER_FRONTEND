export const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777/" //development
    : "/api/"; //production

const BASE = BASE_URL.replace(/\/+$/, "");

const isUploadPath = (pathname) => /^\/?(api\/)?uploads\//.test(pathname);

const normalizeUploadPath = (path) => {
  const p = path
    .replace(/^\/+/, "")
    .replace(/^api(?=\/)/, "")
    .replace(/^\/+/, "");
  return "/uploads/" + p.replace(/^uploads\//, "");
};

export const resolveMediaUrl = (url) => {
  if (!url) return "";
  const raw = String(url).trim();
  if (!raw) return "";

  if (/^(data:|blob:|file:)/i.test(raw)) return raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (isUploadPath(parsed.pathname)) {
        return BASE + normalizeUploadPath(parsed.pathname);
      }
    } catch {
      /* malformed absolute URL — fall through and return as-is */
    }
    return raw;
  }

  if (raw.startsWith("//")) return location.protocol + raw;

  if (raw.startsWith("/")) {
    if (isUploadPath(raw)) return BASE + normalizeUploadPath(raw);
    return BASE + raw;
  }

  if (raw.startsWith("uploads/")) return BASE + normalizeUploadPath(raw);

  return raw;
};

export const CODING_PROFILE_BASE_URLS = {
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/in/",
  leetcode: "https://leetcode.com/u/",
  gfg: "https://auth.geeksforgeeks.org/user/",
  codeforces: "https://codeforces.com/profile/",
  codechef: "https://www.codechef.com/users/",
  hackerrank: "https://www.hackerrank.com/",
  codingninjas: "https://www.codingninjas.com/studio/profile/",
};

export const getProfileLink = (value, platform) => {
  if (!value) return null;
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  // Already a full domain/path (e.g. "github.com/user", "www.example.dev") -> add protocol
  if (
    v.startsWith("www.") ||
    /^[a-z0-9-]+(\.[a-z0-9-]+)+([/:].*)?$/i.test(v)
  ) {
    return "https://" + v;
  }
  if (platform === "portfolio") return "https://" + v;
  const base = CODING_PROFILE_BASE_URLS[platform];
  if (!base) return v;
  return base + v.replace(/^@/, "");
};

