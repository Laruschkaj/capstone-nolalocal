import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken } from '@/lib/helpers/jwt';
import { comparePassword } from '@/lib/helpers/password';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if email is verified (optional - you can allow unverified login)
    //if (!user.isVerified) {
     // return errorResponse(
     //   'Please verify your email before logging in',
     //   403
    //  );
   // }

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return successResponse(
      {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
        },
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('Server error during login', 500);
  }
}