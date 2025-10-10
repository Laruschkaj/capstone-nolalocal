import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event } from '@/models';
import { verifyToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const event = await Event.findById(id)
      .populate('category', 'name slug color')
      .populate('creator', 'username email')
      .populate('likes', 'username');

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    return successResponse({ event });
  } catch (error: any) {
    console.error('Get event error:', error);
    return errorResponse('Server error fetching event', 500);
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
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

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Check if user is the creator
    if (event.creator?.toString() !== payload.userId) {
      return errorResponse('Not authorized to update this event', 403);
    }

    const body = await request.json();
    const { title, description, date, time, location, category, imageUrl } = body;

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date: date ? new Date(date) : event.date,
        time,
        location,
        category,
        imageUrl,
      },
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug color')
      .populate('creator', 'username email');

    return successResponse({ event: updatedEvent }, 'Event updated successfully');
  } catch (error: any) {
    console.error('Update event error:', error);
    return errorResponse('Server error updating event', 500);
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
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

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Check if user is the creator
    if (event.creator?.toString() !== payload.userId) {
      return errorResponse('Not authorized to delete this event', 403);
    }

    await Event.findByIdAndDelete(id);

    return successResponse(null, 'Event deleted successfully');
  } catch (error: any) {
    console.error('Delete event error:', error);
    return errorResponse('Server error deleting event', 500);
  }
}