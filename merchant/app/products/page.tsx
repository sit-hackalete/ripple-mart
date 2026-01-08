'use client';

import { useWallet } from '@/lib/wallet-context';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/models';
import ImageUpload from '@/components/ImageUpload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  X,
  ImageIcon
} from 'lucide-react';

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
    images: [] as string[],
    imageUrl: '', // Legacy field for backward compatibility
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
          images: [],
          imageUrl: '',
          category: '',
          stock: '',
        });
        fetchProducts();
      } else {
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
      images: product.images || [],
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

  // Show loading screen while products are loading
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            {/* Animated gradient circle */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Loading Products
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mb-6">
              Please wait while we establish your connection...
            </p>
            {/* Animated dots */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show connect wallet message if not connected
  if (!isConnected || !walletAddress) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Package className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Product Management
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Connect your wallet to manage your product listings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Products
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your store inventory
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              images: [],
              imageUrl: '',
              category: '',
              stock: '',
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-full transition-all font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-[#007AFF]"></div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-16 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600" strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No products yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            Start building your catalog by adding your first product
          </p>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                images: [],
                imageUrl: '',
                category: '',
                stock: '',
              });
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-full transition-all font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all ${
                !product.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {(product.images && product.images.length > 0) || product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images?.[0] || product.imageUrl || ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" strokeWidth={2} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 flex-1">
                    {product.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                      product.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-[#007AFF]">
                        {product.price.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">RLUSD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Stock: {product.stock}
                    </p>
                    {product.category && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {product.category}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-xl transition-all text-sm font-semibold"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" strokeWidth={2} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all text-sm font-semibold"
                    title={product.isActive ? 'Deactivate product' : 'Activate product'}
                  >
                    {product.isActive ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                  <button
                    onClick={() => product._id && handleDelete(product._id)}
                    className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all text-sm font-semibold"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {editingProduct ? 'Update product information' : 'Fill in the details to create a new product'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Price (RLUSD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Product Images
                </label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                  maxImages={5}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#007AFF] hover:bg-[#0066DD] text-white rounded-xl transition-all font-semibold shadow-sm"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
