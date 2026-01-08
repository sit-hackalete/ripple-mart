/**
 * Seed script to add sample products to MongoDB
 * Run with: npx tsx scripts/seed-products.ts
 * 
 * Make sure to set MONGODB_URI in your environment variables
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ripple_mart';

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Perfect for music lovers and professionals.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
    ],
    category: 'Electronics',
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Smart Watch Pro',
    description: 'Feature-packed smartwatch with health tracking, GPS, and 7-day battery life. Water-resistant up to 50m.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    ],
    category: 'Electronics',
    stock: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt. Available in multiple colors. Made with eco-friendly materials.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    ],
    category: 'Clothing',
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Laptop Stand Aluminum',
    description: 'Ergonomic aluminum laptop stand. Adjustable height and angle for better posture. Fits laptops up to 17 inches.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    ],
    category: 'Accessories',
    stock: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    ],
    category: 'Electronics',
    stock: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    ],
    category: 'Lifestyle',
    stock: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedProducts() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('ripple_mart');
    const collection = db.collection('products');

    // Clear existing products (optional - remove if you want to keep existing)
    // await collection.deleteMany({});

    // Insert sample products
    const result = await collection.insertMany(sampleProducts);
    console.log(`Successfully inserted ${result.insertedCount} products`);

    console.log('Sample products:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price} RLUSD`);
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedProducts();

