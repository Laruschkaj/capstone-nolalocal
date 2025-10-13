import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateVerificationToken, generateTokenExpiry } from '@/lib/helpers/tokens';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit } from '@/middleware/rateLimiter';

// Rate limiter: 3 password reset requests per hour per IP
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await resetLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required');
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(
        null,
        'If an account exists with that email, a reset link has been sent.'
      );
    }

    const resetToken = generateVerificationToken();
    const resetTokenExpiry = generateTokenExpiry(1); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.username, resetToken);
      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('❌ Password reset email failed:', error);
    }

    return successResponse(
      null,
      'If an account exists with that email, a reset link has been sent.'
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return errorResponse('Server error processing request', 500);
  }
}