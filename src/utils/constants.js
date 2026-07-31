export const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777/" //development
    : "/api/"; //production

export const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return BASE_URL.replace(/\/+$/, "") + url;
};

