import dbConnect from '@/lib/dbConnect';
import { Category } from '@/models';
import { categories } from '@/lib/data/categories';

export async function seedCategories() {
  await dbConnect();

  console.log('🌱 Seeding categories...');

  for (const cat of categories) {
    const existing = await Category.findOne({ slug: cat.slug });
    
    if (!existing) {
      await Category.create({
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
      });
      console.log(`✅ Created category: ${cat.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${cat.name}`);
    }
  }

  console.log('✨ Categories seeded successfully!');
}