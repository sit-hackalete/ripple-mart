import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/types';
import clientPromise, { isMongoConnected } from '@/lib/mongodb';

async function getProduct(id: string): Promise<Product | null> {
  // If MongoDB is not connected, return null (will show 404)
  if (!isMongoConnected() || !clientPromise) {
    return null;
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return null;
    }
    
    const db = client.db('ripple_mart');
    const { ObjectId } = await import('mongodb');
    
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return null;
    }

    return {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      images: product.images || [product.image],
      category: product.category,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
            <Image
              src={product.image || '/placeholder-product.jpg'}
              alt={product.name}
              width={800}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            {product.category && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Category: {product.category}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-blue-600">
              {product.price} RLUSD
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                product.stock > 0
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

