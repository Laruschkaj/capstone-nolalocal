import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Event, User, Category } from '@/models';
import { verifyToken } from '@/lib/helpers/jwt';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// GET /api/admin/dashboard - Admin analytics
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

    // Verify admin
    const user = await User.findById(payload.userId);
    if (!user || !user.isAdmin) {
      return errorResponse('Admin access required', 403);
    }

    // Get statistics
    const [
      totalUsers,
      totalEvents,
      userEvents,
      externalEvents,
      totalCategories,
      recentEvents,
      allUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ source: 'user' }),
      Event.countDocuments({ source: { $ne: 'user' } }),
      Category.countDocuments(),
      Event.find()
        .populate('category', 'name color')
        .populate('creator', 'username')
        .sort({ createdAt: -1 })
        .limit(10),
      User.find().select('-password').sort({ createdAt: -1 }),
    ]);

    // Get events by category
    const eventsByCategory = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $project: {
          category: '$categoryInfo.name',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return successResponse({
      stats: {
        totalUsers,
        totalEvents,
        userEvents,
        externalEvents,
        totalCategories,
      },
      eventsByCategory,
      recentEvents,
      allUsers,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return errorResponse('Server error', 500);
  }
}