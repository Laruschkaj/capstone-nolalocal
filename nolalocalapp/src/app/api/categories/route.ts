import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Category } from '@/models';
import { successResponse, errorResponse } from '@/lib/helpers/apiResponse';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find().sort({ name: 1 });

    return successResponse({ categories, count: categories.length });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return errorResponse('Server error fetching categories', 500);
  }
}

// POST /api/categories - Create category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, slug, color } = body;

    // Validation
    if (!name || !slug || !color) {
      return errorResponse('Name, slug, and color are required');
    }

    // Check if category exists
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return errorResponse('Category with this name or slug already exists');
    }

    const category = await Category.create({ name, slug, color });

    return successResponse({ category }, 'Category created successfully', 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    return errorResponse('Server error creating category', 500);
  }
}