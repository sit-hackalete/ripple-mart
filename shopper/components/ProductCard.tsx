'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/models';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageSrc = product.image || product.imageUrl || '/placeholder-product.jpg';

  return (
    <Link href={`/products/${product._id}`}>
      <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-200/60 dark:border-gray-700/50 dark:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-gray-900/30 hover:-translate-y-0.5">
        {/* Image Container - 3/4 height */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/80 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl relative flex items-center justify-center">
          <div className="w-[90%] h-[90%] relative">
            <Image
              src={imageSrc}
              alt={product.name}
              width={400}
              height={300}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 rounded-lg"
              unoptimized
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Content - Flex to fill remaining space */}
        <div className="flex flex-col flex-1 p-4 space-y-2">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          {/* Description - More subtle */}
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>

          {/* Price and Stock - Push to bottom */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {product.price} XRP
              </span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              product.stock > 0
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
            }`}>
              {product.stock > 0 ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

