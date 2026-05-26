import backendApp from "./index.js";

const API_PREFIX = "/api/backend";

export default function backendHandler(req, res) {
  const originalUrl = req.url || "/";

  if (originalUrl.startsWith(API_PREFIX)) {
    req.url = originalUrl.slice(API_PREFIX.length) || "/";
  }

  return backendApp(req, res);
}
