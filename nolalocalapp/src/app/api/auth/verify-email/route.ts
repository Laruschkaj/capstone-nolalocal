import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return errorResponse('Verification token is required');
    }

    // Find user with this token
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return errorResponse('Invalid or expired verification token', 400);
    }

    // Update user
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    // Send welcome email AFTER successful verification
    try {
      await sendWelcomeEmail(user.email, user.username);
      console.log('✅ Welcome email sent after verification');
    } catch (error) {
      console.error('❌ Welcome email failed:', error);
      // Don't fail verification if welcome email fails
    }

    return successResponse(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
      'Email verified successfully! Welcome to NolaLocal!'
    );
  } catch (error: any) {
    console.error('Verification error:', error);
    return errorResponse('Server error during verification', 500);
  }
}