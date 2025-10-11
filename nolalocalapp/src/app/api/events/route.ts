import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event } from '@/models';
import { verifyToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// GET /api/events - Get all events (with calendar support)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'upcoming';
    const search = searchParams.get('search');
    const month = searchParams.get('month'); // NEW: e.g., "10" for October
    const year = searchParams.get('year'); // NEW: e.g., "2025"
    const limit = searchParams.get('limit'); // NEW: for featured events

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

    // NEW: Filter by month and year for calendar
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const events = await Event.find(query)
      .populate('category', 'name slug color')
      .populate('creator', 'username')
      .sort({ date: 1 })
      .limit(limit ? parseInt(limit) : 100);

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

    if (!title || !description || !date || !location || !category) {
      return errorResponse('Missing required fields');
    }

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