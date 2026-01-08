import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import UserWelcome from "@/components/UserWelcome";
import { Product } from "@/types";
import clientPromise, { isMongoConnected } from "@/lib/mongodb";

async function getProducts(): Promise<Product[]> {
  // If MongoDB is not connected, return empty array
  if (!isMongoConnected() || !clientPromise) {
    return [];
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return [];
    }

    const db = client.db("ripple_mart");
    const products = await db.collection("products").find({}).toArray();

    return products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      images: product.images,
      category: product.category,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Ripple Mart
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Shop with RLUSD - Your trusted e-commerce platform
        </p>
      </div>

      <UserWelcome />

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No products available at the moment.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Products will appear here once they are added to the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Suspense key={product._id} fallback={<div>Loading...</div>}>
              <ProductCard product={product} />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  );
}
