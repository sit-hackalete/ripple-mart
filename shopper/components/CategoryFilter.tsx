'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface CategoryFilterProps {
  categories: string[];
}

function CategoryFilterContent({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Derive selected category directly from searchParams instead of using state + effect
  const selectedCategory = searchParams.get('category') || 'All';

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Combine "All" with actual categories
  const allCategories = ['All', ...categories];

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  return (
    <Suspense fallback={
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="h-10 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    }>
      <CategoryFilterContent categories={categories} />
    </Suspense>
  );
}

