import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';
import { rateLimit } from '@/middleware/rateLimiter';

// Rate limiter: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await loginLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.isVerified) {
      return errorResponse('Please verify your email before logging in', 401);
    }

    // Generate token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return successResponse({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('Server error during login', 500);
  }
}