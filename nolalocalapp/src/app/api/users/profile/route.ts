import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event, User } from '@/models';
import { verifyToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// GET /api/users/profile - Get user's created and liked events
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const userId = payload.userId;

    // Get user info
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Get created events
    const createdEvents = await Event.find({ creator: userId })
      .populate('category', 'name slug color')
      .populate('creator', 'username isAdmin')
      .sort({ date: 1 });

    // Get liked events
    const likedEvents = await Event.find({ likes: userId })
      .populate('category', 'name slug color')
      .populate('creator', 'username isAdmin')
      .sort({ date: 1 });

    return successResponse({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      createdEvents,
      likedEvents,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return errorResponse('Server error', 500);
  }
}

// DELETE /api/users/profile - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const userId = payload.userId;

    // Delete user's events
    await Event.deleteMany({ creator: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    return successResponse(null, 'Account deleted successfully');
  } catch (error: any) {
    console.error('Delete account error:', error);
    return errorResponse('Server error', 500);
  }
}