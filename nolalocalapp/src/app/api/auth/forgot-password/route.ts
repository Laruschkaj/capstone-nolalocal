import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateVerificationToken, generateTokenExpiry } from '@/lib/helpers/tokens';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required');
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(
        null,
        'If an account exists with that email, a reset link has been sent.'
      );
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetTokenExpiry = generateTokenExpiry(1); // 1 hour

    console.log('Generated reset token:', resetToken);
    console.log('Token expiry:', resetTokenExpiry);

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    console.log('✅ Token saved to user:', user.email);

    // Verify it was saved
    const verifyUser = await User.findById(user._id);
    console.log('Verification - Token in DB:', verifyUser?.resetPasswordToken);

    // Send password reset email
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