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

    // Password strength validation
    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return errorResponse('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse('Email already registered');
      }
      if (existingUser.username === username) {
        return errorResponse('Username already taken');
      }
    }

    // Generate verification token
    const verifyToken = generateVerificationToken();
    const verifyTokenExpiry = generateTokenExpiry(24); // 24 hours

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      verifyToken,
      verifyTokenExpiry,
    });

    console.log('✅ Verification token:', verifyToken);

    // Send verification email
    try {
      console.log('📧 Attempting to send email to:', user.email);
      console.log('📧 Using SendGrid:', !!process.env.SENDGRID_API_KEY);
      console.log('📧 From email:', process.env.SENDGRID_FROM_EMAIL);
      
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
      },
      'User registered successfully. Please verify your email.',
      201
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse('Server error during registration', 500);
  }
}