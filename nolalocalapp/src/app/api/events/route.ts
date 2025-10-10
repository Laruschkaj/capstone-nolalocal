import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event } from '@/models';
import { verifyToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'upcoming';
    const search = searchParams.get('search');

    // Build query
    let query: any = { status };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('category', 'name slug color')
      .populate('creator', 'username')
      .sort({ date: 1 })
      .limit(100);

    return successResponse({ events, count: events.length });
  } catch (error: any) {
    console.error('Get events error:', error);
    return errorResponse('Server error fetching events', 500);
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const body = await request.json();
    const { title, description, date, time, location, category, imageUrl } = body;

    // Validation
    if (!title || !description || !date || !location || !category) {
      return errorResponse('Missing required fields');
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      time,
      location,
      category,
      imageUrl,
      creator: payload.userId,
      source: 'user',
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('category', 'name slug color')
      .populate('creator', 'username email');

    return successResponse(
      { event: populatedEvent },
      'Event created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create event error:', error);
    return errorResponse('Server error creating event', 500);
  }
}