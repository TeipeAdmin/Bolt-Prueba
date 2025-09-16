import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Archive, AlertCircle, Search } from 'lucide-react';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage, saveToStorage, availablePlans } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ProductForm } from '../../components/restaurant/ProductForm';

export const PublicMenu: React.FC = () => {
  const { restaurant } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleActivateProduct = (productId: string) => {
    const allProducts = loadFromStorage('products') || [];
    const updatedProducts = allProducts.map((p: Product) =>
      p.id === productId 
        ? { ...p, status: 'active' as const, updated_at: new Date().toISOString() }
        : p
    );
    saveToStorage('products', updatedProducts);
    loadMenuData();
    
    showToast(
      'success',
      'Producto Activado',
      'El producto ha sido activado y ahora aparece en tu menú público.',
      4000
    );
  };

  useEffect(() => {
    if (restaurant) {
      loadMenuData();
      loadSubscription();
    }
  }, [restaurant]);

  const loadSubscription = () => {
    const subscriptions = loadFromStorage('subscriptions', []);
    const subscription = subscriptions.find((sub: Subscription) => 
      sub.restaurant_id === restaurant?.id && sub.status === 'active'
    );
    setCurrentSubscription(subscription || null);
  };

  const loadMenuData = () => {
    if (!restaurant) return;

    const allCategories = loadFromStorage('categories') || [];
    const allProducts = loadFromStorage('products') || [];

    const restaurantCategories = allCategories.filter((cat: Category) => 
      cat.restaurant_id === restaurant.id && cat.active
    );
    
    const restaurantProducts = allProducts.filter((prod: Product) => 
      prod.restaurant_id === restaurant.id
    );

    setCategories(restaurantCategories);
    setProducts(restaurantProducts);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'draft':
        return <Badge variant="info">{t('draft')}</Badge>;
      case 'out_of_stock':
        return <Badge variant="warning">{t('outOfStock')}</Badge>;
      case 'archived':
        return <Badge variant="gray">{t('archived')}</Badge>;
      default:
        return <Badge variant="gray">Unknown</Badge>;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const handleSaveProduct = (productData: any) => {
    if (!restaurant) return;

    // Check product limit
    if (!editingProduct && currentSubscription) {
      const currentPlan = availablePlans.find(p => p.id === currentSubscription.plan_type);
      if (currentPlan && currentPlan.features.max_products !== -1) {
        if (products.length >= currentPlan.features.max_products) {
          showToast(
            'warning',
            t('productLimitReached'),
            `${t('upTo')} ${currentPlan.features.max_products} ${t('addMoreProducts')} ${currentPlan.name}. ${t('upgradeSubscription')} ${t('addMoreProducts')}`,
            8000
          );
          return;
        }
      }
    }

    const allProducts = loadFromStorage('products') || [];
    
    if (editingProduct) {
      // Update existing product
      const updatedProducts = allProducts.map((p: Product) =>
        p.id === editingProduct.id 
          ? { ...p, ...productData, updated_at: new Date().toISOString() }
          : p
      );
      saveToStorage('products', updatedProducts);
    } else {
      // Create new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        restaurant_id: restaurant.id,
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveToStorage('products', [...allProducts, newProduct]);
    }

    loadMenuData();
    setShowProductModal(false);
    setEditingProduct(null);
    
    showToast(
      'success',
      editingProduct ? t('productUpdated') : t('productCreated'),
      editingProduct 
        ? 'The product has been updated successfully.'
        : 'The new product has been added to your menu.',
      4000
    );
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm(`${t('confirmDelete')} this product? ${t('actionCannotBeUndone')}`)) {
      const allProducts = loadFromStorage('products') || [];
      const updatedProducts = allProducts.filter((p: Product) => p.id !== productId);
      saveToStorage('products', updatedProducts);
      loadMenuData();
      
      showToast(
        'info',
        t('productDeleted'),
        'The product has been removed from your menu.',
        4000
      );
    }
  };

  const handleArchiveProduct = (productId: string) => {
    const allProducts = loadFromStorage('products') || [];
    const updatedProducts = allProducts.map((p: Product) =>
      p.id === productId 
        ? { ...p, status: 'archived' as const, updated_at: new Date().toISOString() }
        : p
    );
    saveToStorage('products', updatedProducts);
    loadMenuData();
    
    showToast(
      'info',
      t('productArchived'),
      'The product has been archived and no longer appears in your public menu.',
      4000
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('productManagement')}</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingProduct(null);
            setShowProductModal(true);
          }}
        >
          {t('newProduct')}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('search')} products by name, description, or SKU...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All categories ({products.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length})
          </button>
          {categories.map(category => {
            const categoryProductCount = products.filter(p => {
              const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
              return p.category_id === category.id && matchesSearch;
            }).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({categoryProductCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No products found' : t('noProductsInCategory')}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try different search terms or clear the search.' : t('createFirstProduct')}
          </p>
          {!searchTerm && (
            <Button
              icon={Plus}
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
            >
              {t('create')} {t('newProduct')}
            </Button>
          )}
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Product Image */}
              <div className="aspect-video bg-gray-200 relative">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Eye className="w-8 h-8" />
                    <span className="ml-2">No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.status)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getCategoryName(product.category_id)}
                  </p>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price Range */}
                <div className="mb-4">
                  {product.variations.length > 0 && (
                    <div className="text-lg font-bold text-gray-900">
                      ${Math.min(...product.variations.map(v => v.price)).toFixed(2)}
                      {product.variations.length > 1 && (
                        <span className="text-sm font-normal text-gray-600">
                          {' '}- ${Math.max(...product.variations.map(v => v.price)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditProduct(product)}
                    />
                    {product.status !== 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleActivateProduct(product.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Activar producto"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Archive}
                      onClick={() => handleArchiveProduct(product.id)}
                      className="text-orange-600 hover:text-orange-700"
                      title="Archivar producto"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar producto"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.sku}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `${t('edit')} ${t('newProduct')}` : t('newProduct')}
        size="xl"
      >
        <ProductForm
          categories={categories}
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};