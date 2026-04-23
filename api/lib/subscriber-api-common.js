// Shared: CORS + optional Bearer (GET/POST on protected routes) — public one-email POST uses /api/subscribers
export const ALLOWED_ORIGINS = [
  'https://www.irie-development.com',
  'https://irie-development.com',
  'http://localhost:3000',
  'http://localhost:8080',
];

export function setCorsForSubscriberRoutes(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization, X-Requested-With'
  );
}

/**
 * If SUBSCRIBERS_API_KEY is set in Vercel, require Authorization: Bearer <key>.
 * If unset, allow (dev / backward compatible).
 */
export function guardSubscribersApi(req, res) {
  const key = (process.env.SUBSCRIBERS_API_KEY || '').trim();
  if (!key) {
    return true;
  }
  const auth = (req.headers.authorization || '').trim();
  if (auth === `Bearer ${key}`) {
    return true;
  }
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

/** CORS for public POST to append-only (legacy; use subscribers.js POST in same file). */
export function setCorsForPublicSubscribe(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization, X-Requested-With'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
