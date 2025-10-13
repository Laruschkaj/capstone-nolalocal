import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { token, password } = body;

    console.log('Received token:', token);

    if (!token || !password) {
      return errorResponse('Token and password are required');
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters');
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    console.log('User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('Token in DB:', user.resetPasswordToken);
      console.log('Token expiry:', user.resetPasswordExpiry);
      console.log('Current time:', new Date());
    }

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Update password (will be hashed by User model pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    console.log('✅ Password reset successfully');

    return successResponse(
      null,
      'Password has been reset successfully'
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return errorResponse('Server error resetting password', 500);
  }
}