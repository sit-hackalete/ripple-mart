'use client';

import { Suspense, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/models";
import { useSearchParams } from "next/navigation";

interface ProductGridProps {
  products: Product[];
}

function ProductGridContent({ products }: ProductGridProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No products found in this category.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Try selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 h-80" />
        ))}
      </div>
    }>
      <ProductGridContent products={products} />
    </Suspense>
  );
}

