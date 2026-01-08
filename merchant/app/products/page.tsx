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
  ImageIcon,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

export default function ProductsPage() {
  const { isConnected, walletAddress } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [priceMode, setPriceMode] = useState<'RLUSD' | 'USD'>('USD');
  const [usdAmount, setUsdAmount] = useState('');
  const [xrpPrice, setXrpPrice] = useState<number | null>(null);
  const [loadingXrpPrice, setLoadingXrpPrice] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [] as string[],
    imageUrl: '', // Legacy field for backward compatibility
    category: '',
    stock: '',
  });

  // Filter products based on search and stock filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStock = stockFilter === 'all' ? true :
                        stockFilter === 'low' ? product.stock < 10 :
                        product.stock === 0;
    
    return matchesSearch && matchesStock;
  });

  useEffect(() => {
    if (isConnected && walletAddress) {
      void fetchProducts();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletAddress]);

  // Fetch XRP price when modal opens
  useEffect(() => {
    if (showAddModal) {
      fetchXrpPrice();
      // Refresh every 30 seconds while modal is open
      const interval = setInterval(fetchXrpPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [showAddModal]);

  const fetchXrpPrice = async () => {
    setLoadingXrpPrice(true);
    try {
      // Using CoinGecko API (free, no API key needed)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd'
      );
      const data = await response.json();
      if (data.ripple && data.ripple.usd) {
        setXrpPrice(data.ripple.usd);
      }
    } catch (error) {
      console.error('Error fetching XRP price:', error);
      // Fallback price if API fails
      setXrpPrice(0.50); // Approximate fallback
    } finally {
      setLoadingXrpPrice(false);
    }
  };

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
        setUsdAmount('');
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
    const priceStr = product.price.toString();
    setFormData({
      name: product.name,
      description: product.description,
      price: priceStr,
      images: product.images || [],
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      stock: product.stock.toString(),
    });
    setUsdAmount(priceStr); // RLUSD is 1:1 with USD
    setShowAddModal(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete?._id) return;

    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchProducts();
        setShowDeleteModal(false);
        setProductToDelete(null);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Products
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your inventory and product listings
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock (&lt;10)</option>
              <option value="out">Out of Stock</option>
            </select>

            {/* Add Product Button */}
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
                setUsdAmount('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Product
            </button>
          </div>
        </div>

        {/* Results Count */}
        {!loading && products.length > 0 && (
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-white">{filteredProducts.length}</span> of{' '}
            <span className="font-medium text-slate-900 dark:text-white">{products.length}</span> products
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 dark:border-slate-800 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Get started by adding your first product to your inventory
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
                setUsdAmount('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Your First Product
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products match your search</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStockFilter('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Image with Badge Overlay */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {(product.images && product.images.length > 0) || product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images?.[0] || product.imageUrl || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                        product.stock === 0
                          ? 'bg-red-500/90 text-white'
                          : product.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-500/90 text-white'
                      }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="text-base font-medium text-slate-900 dark:text-white line-clamp-2 mb-2 min-h-[48px]">
                    {product.name}
                  </h3>
                  
                  {/* Meta Row */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {product.category || 'General'}
                    </span>
                    <span className={`font-medium ${
                      product.stock === 0 ? 'text-red-600' :
                      product.stock < 10 ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-500">
                        {product.price.toFixed(2)}
                      </p>
                      <p className="text-xs font-medium text-slate-400">RLUSD</p>
                    </div>
                  </div>
                  
                  {/* Action Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all text-xs font-medium"
                      title="Edit product"
                    >
                      <Edit className="w-3.5 h-3.5" strokeWidth={2} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title={product.isActive ? 'Hide product' : 'Show product'}
                    >
                      {product.isActive ? (
                        <EyeOff className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:border-red-900 dark:hover:text-red-400 rounded-lg transition-all"
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
              
              {/* Price with Currency Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setPriceMode('USD')}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        priceMode === 'USD'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      USD
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceMode('RLUSD')}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        priceMode === 'RLUSD'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      RLUSD
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {priceMode === 'USD' ? '$' : 'Ⓡ'}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={priceMode === 'USD' ? usdAmount : formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (priceMode === 'USD') {
                        setUsdAmount(value);
                        // RLUSD is pegged 1:1 to USD
                        setFormData({ ...formData, price: value });
                      } else {
                        setFormData({ ...formData, price: value });
                        setUsdAmount(value);
                      }
                    }}
                    className="w-full pl-10 pr-20 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {priceMode === 'USD' ? 'USD' : 'RLUSD'}
                    </span>
                  </div>
                </div>
                
                {/* Live Conversion Display */}
                {formData.price && parseFloat(formData.price) > 0 && (
                  <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Conversion
                      </h4>
                      {loadingXrpPrice && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Updating...</span>
                      )}
                    </div>

                    {/* RLUSD Conversion */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Ⓡ</span>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">RLUSD (Stablecoin)</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {parseFloat(formData.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Rate</div>
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">1:1 USD</div>
                      </div>
                    </div>

                    {/* XRP Conversion */}
                    {xrpPrice && (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">✕</span>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">XRP</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {(parseFloat(formData.price) / xrpPrice).toFixed(4)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 dark:text-slate-400">1 XRP =</div>
                          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ${xrpPrice.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Text */}
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>
                        Prices are stored in RLUSD. XRP rate updates every 30 seconds from live market data.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-500" strokeWidth={2} />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Delete Product?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{productToDelete.name}"</span>? This action cannot be undone.
              </p>
              
              {/* Product Preview */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 text-left">
                {(productToDelete.images && productToDelete.images.length > 0) || productToDelete.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productToDelete.images?.[0] || productToDelete.imageUrl || ''}
                    alt={productToDelete.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-400" strokeWidth={2} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {productToDelete.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {productToDelete.price.toFixed(2)} RLUSD • {productToDelete.stock} in stock
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium text-sm shadow-sm"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
