import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken } from '@/lib/helpers/jwt';
import { generateVerificationToken, generateTokenExpiry } from '@/lib/helpers/tokens';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';
import { sendWelcomeEmail, sendVerifyEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, email, password } = body;

    // Validation
    if (!username || !email || !password) {
      return errorResponse('All fields are required');
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse('Email already registered');
      }
      return errorResponse('Username already taken');
    }

    // Generate verification token
    const verifyToken = generateVerificationToken();
    const verifyTokenExpiry = generateTokenExpiry(24); // 24 hours

    // Create user
    const user = await User.create({
      username,
      email,
      password, // Will be hashed automatically by the User model
      verifyToken,
      verifyTokenExpiry,
    });

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    /// Send verification email only
    try {
     await sendVerifyEmail(user.email, user.username, verifyToken);
     console.log('✅ Verification email sent');
    } catch (error) {
     console.error('❌ Email error:', error);
    }

    return successResponse(
  {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
    message: 'Account created! Please check your email to verify your account.',
    // Don't send token until verified
  },
  'User registered successfully. Please verify your email.',
  201
  );
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse('Server error during signup', 500);
  }
}