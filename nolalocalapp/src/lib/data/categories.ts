export const categories = [
  { name: 'Music', slug: 'music', color: '#FF6B6B', icon: '🎵' },
  { name: 'Arts & Culture', slug: 'arts-culture', color: '#4ECDC4', icon: '🎨' },
  { name: 'Architecture', slug: 'architecture', color: '#95E1D3', icon: '🏛️' },
  { name: 'Theater', slug: 'theater', color: '#9B59B6', icon: '🎭' },
  { name: 'Comedy', slug: 'comedy', color: '#FFE66D', icon: '😂' },
  { name: 'Sports', slug: 'sports', color: '#FF6B9D', icon: '⚽' },
  { name: 'Food & Drink', slug: 'food-drink', color: '#FFA07A', icon: '🍽️' },
  { name: 'Business', slug: 'business', color: '#6C5CE7', icon: '💼' },
  { name: 'Tech', slug: 'tech', color: '#0984E3', icon: '💻' },
  { name: 'Family & Kids', slug: 'family-kids', color: '#74B9FF', icon: '👨‍👩‍👧' },
  { name: 'Community', slug: 'community', color: '#55EFC4', icon: '🤝' },
  { name: 'Fashion', slug: 'fashion', color: '#FD79A8', icon: '👗' },
  { name: 'Health & Wellness', slug: 'health-wellness', color: '#81ECEC', icon: '🧘' },
  { name: 'Nightlife', slug: 'nightlife', color: '#A29BFE', icon: '🌙' },
  { name: 'Festivals', slug: 'festivals', color: '#FFEAA7', icon: '🎉' },
  { name: 'Education', slug: 'education', color: '#DFE6E9', icon: '📚' },
  { name: 'General', slug: 'general', color: '#B2BEC3', icon: '📌' },
];

export function getCategoryBySlug(slug: string) {
  return categories.find(cat => cat.slug === slug);
}

export function getCategoryColor(categoryName: string) {
  const category = categories.find(
    cat => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.color || '#B2BEC3';
}