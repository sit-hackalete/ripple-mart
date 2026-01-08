'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product._id}`}>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={product.image || '/placeholder-product.jpg'}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              {product.price} RLUSD
            </span>
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

