'use client';

import { useWallet } from '@/lib/wallet-context';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/models';

export default function ProductsPage() {
  const { isConnected, walletAddress } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    if (isConnected && walletAddress) {
      void fetchProducts();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletAddress]);

  const fetchProducts = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/products?walletAddress=${walletAddress}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingProduct ? {} : { merchantWalletAddress: walletAddress }),
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          category: '',
          stock: '',
        });
        fetchProducts();
      } else {
        // Show user-friendly error message
        alert(data.error || 'Failed to save product. Please try again.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please make sure the database is configured.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      stock: product.stock.toString(),
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete product. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please make sure the database is configured.');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !product.isActive,
        }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!isConnected || !walletAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your Crossmark wallet to manage products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your product listings
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              imageUrl: '',
              category: '',
              stock: '',
            });
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No products yet. Add your first product to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className={`bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden ${
                !product.isActive ? 'opacity-60' : ''
              }`}
            >
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      product.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {product.price.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">RL-USD</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stock: {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => product._id && handleDelete(product._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (RL-USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {editingProduct ? 'Update' : 'Create'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

