import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event } from '@/models';
import { verifyToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// POST /api/events/[id]/like - Toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Get token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const event = await Event.findById(id);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const userId = payload.userId;
    const userIndex = event.likes.findIndex(
      (like) => like.toString() === userId
    );

    if (userIndex > -1) {
      // Unlike
      event.likes.splice(userIndex, 1);
      event.likesCount = Math.max(0, event.likesCount - 1);
      await event.save();

      return successResponse(
        { liked: false, likesCount: event.likesCount },
        'Event unliked'
      );
    } else {
      // Like
      event.likes.push(userId as any);
      event.likesCount += 1;
      await event.save();

      return successResponse(
        { liked: true, likesCount: event.likesCount },
        'Event liked'
      );
    }
  } catch (error: any) {
    console.error('Like/unlike error:', error);
    return errorResponse('Server error', 500);
  }
}