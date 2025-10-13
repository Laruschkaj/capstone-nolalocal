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

    // If image is being updated and old image exists, delete old image from Cloudinary
    if (imageUrl && event.imageUrl && imageUrl !== event.imageUrl) {
      await deleteCloudinaryImage(event.imageUrl);
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date: date ? new Date(date.includes('T') ? date : date + 'T00:00:00') : event.date,
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

// Helper function to delete image from Cloudinary
async function deleteCloudinaryImage(imageUrl: string): Promise<void> {
  try {
    // Check if it's a Cloudinary URL and from our folders
    if (!imageUrl.includes('cloudinary.com') || !imageUrl.includes('nolalocal/')) {
      return; // Not our image, skip deletion
    }

    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/dbmkqehtm/image/upload/v1234567890/nolalocal/user-events/abc123.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return;
    
    // Get everything after 'upload/v{version}/'
    const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');

    // Only delete if it's from our nolalocal folders
    if (!publicId.startsWith('nolalocal/')) {
      return;
    }

    // Call Cloudinary API to delete
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials missing');
      return;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const crypto = require('crypto');
    
    // Create signature
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (result.result === 'ok') {
      console.log('✅ Cloudinary image deleted:', publicId);
    } else {
      console.log('⚠️ Cloudinary deletion result:', result);
    }
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error);
    // Don't throw error - continue with event deletion even if image deletion fails
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

    // Delete image from Cloudinary if exists
    if (event.imageUrl) {
      await deleteCloudinaryImage(event.imageUrl);
    }

    // Delete event from database
    await Event.findByIdAndDelete(id);

    return successResponse(null, 'Event deleted successfully');
  } catch (error: any) {
    console.error('Delete event error:', error);
    return errorResponse('Server error deleting event', 500);
  }
}