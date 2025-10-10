import { NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Category } from '@/models';
import { categories } from '@/lib/data/categories';
import { successResponse } from '@/lib/helpers/apiResponse';

export async function POST(request: NextRequest) {
  await dbConnect();

  const results = {
    created: [] as string[],
    existing: [] as string[],
  };

  for (const cat of categories) {
    const existing = await Category.findOne({ slug: cat.slug });
    
    if (!existing) {
      await Category.create({
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
      });
      results.created.push(cat.name);
    } else {
      results.existing.push(cat.name);
    }
  }

  return successResponse(
    results,
    `Seeded ${results.created.length} new categories. ${results.existing.length} already existed.`
  );
}