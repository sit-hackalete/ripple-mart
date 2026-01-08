import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { name, description, price, images, imageUrl, category, stock, isActive } = data;

    // Try to get database, but return error if not available
    let db;
    try {
      db = await getDatabase();
    } catch {
      console.log('Database not available, cannot update product');
      return NextResponse.json(
        { error: 'Database is not configured. Please set up MongoDB to update products.' },
        { status: 503 }
      );
    }

    const productsCollection = db.collection('products');

    const updateData: {
      updatedAt: Date;
      name?: string;
      description?: string;
      price?: number;
      images?: string[];
      imageUrl?: string;
      category?: string;
      stock?: number;
      isActive?: boolean;
    } = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (images !== undefined) updateData.images = images;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct = await productsCollection.findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to get database, but return error if not available
    let db;
    try {
      db = await getDatabase();
    } catch {
      console.log('Database not available, cannot delete product');
      return NextResponse.json(
        { error: 'Database is not configured. Please set up MongoDB to delete products.' },
        { status: 503 }
      );
    }

    const productsCollection = db.collection('products');

    // Soft delete by setting isActive to false
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

