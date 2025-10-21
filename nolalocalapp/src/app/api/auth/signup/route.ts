import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models';
import { generateVerificationToken, generateTokenExpiry } from '@/lib/helpers/tokens';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';
import { sendVerifyEmail } from '@/lib/email';
import { rateLimit } from '@/middleware/rateLimiter';

// Rate limiter: 5 signups per hour per IP
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await signupLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();

    const body = await request.json();
    const { username, email, password } = body;

    // Validation
    if (!username || !email || !password) {
      return errorResponse('All fields are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Please provide a valid email address');
    }

    // Username validation
    if (username.length < 3) {
      return errorResponse('Username must be at least 3 characters long');
    }

    if (username.length > 30) {
      return errorResponse('Username cannot exceed 30 characters');
    }

    // Password strength validation
    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return errorResponse('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return errorResponse('This email is already registered. Please sign in or use a different email.');
      }
      if (existingUser.username === username) {
        return errorResponse('This username is already taken. Please choose a different username.');
      }
    }

    // Generate verification token
    const verifyToken = generateVerificationToken();
    const verifyTokenExpiry = generateTokenExpiry(24); // 24 hours

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      verifyToken,
      verifyTokenExpiry,
    });

    console.log('✅ User created:', user.username);
    console.log('✅ Verification token:', verifyToken);

    // Send verification email
    try {
      console.log('📧 Sending verification email to:', user.email);
      await sendVerifyEmail(user.email, user.username, verifyToken);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail signup if email fails - user is still created
      console.log('⚠️ User created but verification email failed to send');
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
      },
      'User registered successfully. Please verify your email.',
      201
    );
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return errorResponse(messages[0] || 'Validation error');
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(`This ${field} is already registered. Please use a different ${field}.`);
    }

    return errorResponse('An error occurred during registration. Please try again.');
  }
}