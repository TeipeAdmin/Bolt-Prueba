import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Eye, Archive, AlertCircle, Search, Package, CheckCircle, XCircle, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage, saveToStorage, availablePlans } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ProductForm } from '../../components/restaurant/ProductForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const MenuManagement: React.FC = () => {
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; productId: string; productName: string }>({
    show: false,
    productId: '',
    productName: ''
  });

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

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

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
  };

  const openDeleteConfirm = (product: Product) => {
    setDeleteConfirm({
      show: true,
      productId: product.id,
      productName: product.name
    });
  };

  const moveProductUp = (productId: string) => {
    const allProducts = loadFromStorage('products') || [];
    const restaurantProducts = allProducts
      .filter((p: Product) => p.restaurant_id === restaurant?.id)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const currentIndex = restaurantProducts.findIndex((p: Product) => p.id === productId);
    if (currentIndex <= 0) return;

    // Swap products in the array
    [restaurantProducts[currentIndex], restaurantProducts[currentIndex - 1]] =
    [restaurantProducts[currentIndex - 1], restaurantProducts[currentIndex]];

    // Re-assign order_index sequentially
    restaurantProducts.forEach((product, index) => {
      product.order_index = index;
      product.updated_at = new Date().toISOString();
    });

    // Update all products
    const productMap = new Map(restaurantProducts.map(p => [p.id, p]));
    const updatedProducts = allProducts.map((p: Product) => {
      if (productMap.has(p.id)) {
        return productMap.get(p.id)!;
      }
      return p;
    });

    saveToStorage('products', updatedProducts);
    loadMenuData();

    showToast(
      'success',
      'Orden Actualizado',
      'La posición del producto ha sido actualizada.',
      2000
    );
  };

  const moveProductDown = (productId: string) => {
    const allProducts = loadFromStorage('products') || [];
    const restaurantProducts = allProducts
      .filter((p: Product) => p.restaurant_id === restaurant?.id)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const currentIndex = restaurantProducts.findIndex((p: Product) => p.id === productId);
    if (currentIndex >= restaurantProducts.length - 1) return;

    // Swap products in the array
    [restaurantProducts[currentIndex], restaurantProducts[currentIndex + 1]] =
    [restaurantProducts[currentIndex + 1], restaurantProducts[currentIndex]];

    // Re-assign order_index sequentially
    restaurantProducts.forEach((product, index) => {
      product.order_index = index;
      product.updated_at = new Date().toISOString();
    });

    // Update all products
    const productMap = new Map(restaurantProducts.map(p => [p.id, p]));
    const updatedProducts = allProducts.map((p: Product) => {
      if (productMap.has(p.id)) {
        return productMap.get(p.id)!;
      }
      return p;
    });

    saveToStorage('products', updatedProducts);
    loadMenuData();

    showToast(
      'success',
      'Orden Actualizado',
      'La posición del producto ha sido actualizada.',
      2000
    );
  };

  const handleDuplicateProduct = (productId: string) => {
    if (!restaurant) return;

    // Check product limit
    if (currentSubscription) {
      const currentPlan = availablePlans.find(p => p.id === currentSubscription.plan_type);
      if (currentPlan && currentPlan.features.max_products !== -1) {
        if (products.length >= currentPlan.features.max_products) {
          showToast(
            'error',
            'Límite de productos alcanzado',
            `Tu plan actual solo permite ${currentPlan.features.max_products} productos. Actualiza tu plan para agregar más.`,
            5000
          );
          return;
        }
      }
    }

    const allProducts = loadFromStorage('products') || [];
    const productToDuplicate = allProducts.find((p: Product) => p.id === productId);

    if (!productToDuplicate) return;

    const newProduct: Product = {
      ...productToDuplicate,
      id: `product-${Date.now()}`,
      name: `${productToDuplicate.name} (Copia)`,
      order_index: products.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedProducts = [...allProducts, newProduct];
    saveToStorage('products', updatedProducts);
    loadMenuData();

    showToast(
      'success',
      'Producto Duplicado',
      `Se ha creado una copia de "${productToDuplicate.name}".`,
      4000
    );
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'out_of_stock').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Archivados</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'archived').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
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
            className={`px-4 py-2 rounded-lg transition-all font-medium ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({products.filter(p =>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {categoryProductCount}
                </span>
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
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden group">
              {/* Product Image */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <span className="text-sm">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.status)}
                </div>
                {product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg">
                    +{product.images.length - 1}
                  </div>
                )}
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
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${Math.min(...product.variations.map(v => v.price)).toFixed(2)}
                        </span>
                        {product.variations.length > 1 && (
                          <span className="text-sm font-normal text-gray-600">
                            - ${Math.max(...product.variations.map(v => v.price)).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.variations.some(v => v.compare_at_price && v.compare_at_price > v.price) && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            ${Math.min(...product.variations.filter(v => v.compare_at_price).map(v => v.compare_at_price!)).toFixed(2)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            OFERTA
                          </span>
                        </div>
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
                      icon={ArrowUp}
                      onClick={() => moveProductUp(product.id)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Mover arriba"
                      disabled={filteredProducts[0]?.id === product.id}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ArrowDown}
                      onClick={() => moveProductDown(product.id)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Mover abajo"
                      disabled={filteredProducts[filteredProducts.length - 1]?.id === product.id}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditProduct(product)}
                      title="Editar producto"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                      onClick={() => handleDuplicateProduct(product.id)}
                      className="text-purple-600 hover:text-purple-700"
                      title="Duplicar producto"
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
                      onClick={() => openDeleteConfirm(product)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, productId: '', productName: '' })}
        onConfirm={() => handleDeleteProduct(deleteConfirm.productId)}
        title="¿Eliminar producto?"
        message="Esta acción eliminará permanentemente el producto de tu menú. Los clientes ya no podrán verlo ni pedirlo."
        confirmText="Eliminar producto"
        cancelText="Cancelar"
        variant="danger"
        itemName={deleteConfirm.productName}
      />
    </div>
  );
};