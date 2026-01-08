import { Product } from "@/lib/models";
import clientPromise from "@/lib/mongodb";
import CategoryFilter from "@/components/CategoryFilter";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";

async function getProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise();
    const db = client.db("ripple_mart");
    // Only fetch active products (isActive !== false)
    const products = await db.collection("products").find({ 
      isActive: { $ne: false } 
    }).toArray();

    return products.map((product) => {
      // Prioritize the primary image field - never use images[0] as fallback
      // The image field should only come from product.image or product.imageUrl
      const primaryImage = product.image || product.imageUrl || '/placeholder-product.jpg';
      
      return {
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: primaryImage, // Always use the primary image field, never images[0]
        imageUrl: product.imageUrl || product.image || primaryImage,
        images: product.images, // Keep images array separate - it's for additional images only
        category: product.category,
        stock: product.stock,
        isActive: product.isActive !== false,
        merchantWalletAddress: product.merchantWalletAddress,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    }) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getCategories(): Promise<string[]> {
  try {
    const client = await clientPromise();
    const db = client.db("ripple_mart");
    const categories = await db.collection("products").distinct("category");
    return categories.filter((cat): cat is string => cat != null && cat !== "");
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-blue-50/50 to-blue-50/60 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <HeroSection />

        {/* Category Filter */}
        <CategoryFilter categories={categories} />

        {/* Products Grid */}
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
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </div>
  );
}
