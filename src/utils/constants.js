export const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777/" //development
    : "/api/"; //production

