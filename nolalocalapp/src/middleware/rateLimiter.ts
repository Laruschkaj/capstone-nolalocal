import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production for multiple servers)
const requests = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest) => {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const now = Date.now();
    const key = `${ip}:${request.nextUrl.pathname}`;

    // Get or create request record
    let record = requests.get(key);

    // If no record or window expired, create new one
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      requests.set(key, record);
      return null; // Allow request
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > options.maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many requests. Please try again in ${resetIn} seconds.` 
        },
        { status: 429 }
      );
    }

    return null; // Allow request
  };
}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requests.entries()) {
    if (now > record.resetTime) {
      requests.delete(key);
    }
  }
}, 60 * 60 * 1000);