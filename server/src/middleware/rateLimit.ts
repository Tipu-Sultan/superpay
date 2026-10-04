import rateLimit from 'express-rate-limit';

function limiter(windowMs: number, limit: number, message: string) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message } });
    },
  });
}

export const apiLimiter = limiter(15 * 60_000, 600, 'Too many requests. Please slow down.');
export const sessionLimiter = limiter(15 * 60_000, 30, 'Too many sign-in attempts. Try again in a few minutes.');
export const paymentLimiter = limiter(60_000, 30, 'Too many payment attempts. Wait a minute and try again.');
