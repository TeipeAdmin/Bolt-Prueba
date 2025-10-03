import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Clock, MapPin, Phone, Mail, Instagram, Facebook, ChevronRight, Plus, Minus, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { ProductDetail } from '../../components/public/ProductDetail';
import { CartSidebar } from '../../components/public/CartSidebar';
import { CheckoutModal } from '../../components/public/CheckoutModal';

export const PublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items: cartItems } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenuData = () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading menu data for slug:', slug);

      const restaurants = loadFromStorage('restaurants', []);
      console.log('All restaurants:', restaurants);

      const restaurantData = restaurants.find((r: Restaurant) => r.slug === slug || r.id === slug || r.domain === slug);

      if (!restaurantData) {
        console.error('Restaurant not found. Slug:', slug, 'Available restaurants:', restaurants.map(r => ({ id: r.id, slug: r.slug })));
        setError(`Restaurante no encontrado: ${slug}`);
        setLoading(false);
        return;
      }

      // Check subscription status
      const subscriptions = loadFromStorage('subscriptions', []);
      const subscription = subscriptions.find((s: Subscription) => s.restaurant_id === restaurantData.id);

      if (!subscription || subscription.status !== 'active') {
        console.error('Restaurant subscription is not active');
        setError('Este restaurante no está disponible en este momento. Suscripción inactiva o vencida.');
        setLoading(false);
        return;
      }

      console.log('Restaurant found and active:', restaurantData);
      setRestaurant(restaurantData);

      const allCategories = loadFromStorage('categories', []);
      const allProducts = loadFromStorage('products', []);

      const restaurantCategories = allCategories.filter((cat: Category) =>
        cat.restaurant_id === restaurantData.id && cat.active
      );

      const restaurantProducts = allProducts.filter((prod: Product) =>
        prod.restaurant_id === restaurantData.id && prod.status === 'active'
      );

      console.log('Categories:', restaurantCategories);
      console.log('Products:', restaurantProducts);

      setCategories(restaurantCategories);
      setProducts(restaurantProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error loading menu data:', err);
      setError('Error al cargar el menú');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PublicMenu mounted with slug:', slug);
    if (slug) {
      loadMenuData();
    } else {
      console.log('No slug provided');
      setError('No se proporcionó un identificador de restaurante');
      setLoading(false);
    }
  }, [slug]);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const isRestaurantOpen = () => {
    if (!restaurant) return false;
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof restaurant.settings.business_hours;
    const todayHours = restaurant.settings.business_hours[dayName];
    return todayHours?.is_open || false;
  };

  const getTodayHours = () => {
    if (!restaurant) return null;
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof restaurant.settings.business_hours;
    return restaurant.settings.business_hours[dayName];
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurante no encontrado</h2>
          <p className="text-gray-600 mb-4">{error || 'El menú que buscas no está disponible.'}</p>
          <p className="text-sm text-gray-500">Slug buscado: {slug}</p>
        </div>
      </div>
    );
  }

  const theme = restaurant.settings.theme;
  const layoutType = restaurant.settings.ui_settings.layout_type;
  const todayHours = getTodayHours();

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        '--primary-color': theme.primary_color,
        '--secondary-color': theme.secondary_color,
        '--accent-color': theme.accent_color,
        '--text-color': theme.text_color,
        '--primary-font': theme.primary_font,
        '--secondary-font': theme.secondary_font,
        '--font-size-title': theme.font_sizes.title,
        '--font-size-subtitle': theme.font_sizes.subtitle,
        '--font-size-normal': theme.font_sizes.normal,
        '--font-size-small': theme.font_sizes.small,
        '--font-weight-light': theme.font_weights.light,
        '--font-weight-regular': theme.font_weights.regular,
        '--font-weight-medium': theme.font_weights.medium,
        '--font-weight-bold': theme.font_weights.bold,
      } as React.CSSProperties}
    >
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="font-bold text-gray-900"
                style={{
                  fontSize: 'var(--font-size-title)',
                  fontFamily: 'var(--secondary-font)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {todayHours && (
                    <span>
                      {todayHours.is_open ? `${todayHours.open} - ${todayHours.close}` : 'Cerrado'}
                    </span>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isRestaurantOpen()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isRestaurantOpen() ? 'Abierto' : 'Cerrado'}
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {restaurant.social_media?.instagram && (
                <a
                  href={restaurant.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {restaurant.social_media?.facebook && (
                <a
                  href={restaurant.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
              style={{
                borderColor: 'var(--secondary-color)',
                fontSize: 'var(--font-size-normal)'
              }}
            />
          </div>
        </div>
      </header>

      {/* PROMOTIONAL SECTION */}
      {restaurant.settings.promo?.enabled && (
        <div className="relative bg-gradient-to-r from-orange-500 to-red-600 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-white">
                <div
                  className="font-bold mb-2"
                  style={{
                    fontSize: 'calc(var(--font-size-title) * 1.5)',
                    fontFamily: 'var(--secondary-font)'
                  }}
                >
                  {restaurant.settings.promo.promo_text || '60% Off'}
                </div>
                <p
                  className="mb-6 opacity-90"
                  style={{ fontSize: 'var(--font-size-subtitle)' }}
                >
                  ¡Ofertas especiales por tiempo limitado!
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  style={{
                    fontSize: 'var(--font-size-normal)',
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                >
                  {restaurant.settings.promo.cta_text || 'Ordenar Ahora'}
                </button>
              </div>
              {restaurant.settings.promo.banner_image && (
                <div className="flex-1">
                  <img
                    src={restaurant.settings.promo.banner_image}
                    alt="Promoción"
                    className="w-full h-64 object-cover rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES NAVIGATION */}
      <div className="bg-white border-b sticky top-[120px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-lg whitespace-nowrap transition-all font-medium"
              style={{
                backgroundColor: selectedCategory === 'all' ? 'var(--primary-color)' : 'var(--secondary-color)',
                color: selectedCategory === 'all' ? 'white' : 'var(--text-color)',
                fontSize: 'var(--font-size-normal)',
                borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
              }}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-4 py-2 rounded-lg whitespace-nowrap transition-all font-medium"
                style={{
                  backgroundColor: selectedCategory === category.id ? 'var(--primary-color)' : 'var(--secondary-color)',
                  color: selectedCategory === category.id ? 'white' : 'var(--text-color)',
                  fontSize: 'var(--font-size-normal)',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600" style={{ fontSize: 'var(--font-size-normal)' }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className={`
            ${layoutType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
            ${layoutType === 'list' ? 'space-y-4' : ''}
            ${layoutType === 'editorial' ? 'space-y-8' : ''}
          `}>
            {filteredProducts.map((product) => {
              const minPrice = product.variations.length > 0
                ? Math.min(...product.variations.map(v => v.price))
                : 0;

              if (layoutType === 'list') {
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex"
                    onClick={() => setSelectedProduct(product)}
                    style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-32 h-32 object-cover"
                      />
                    )}
                    <div className="flex-1 p-4">
                      <h3
                        className="font-semibold mb-1"
                        style={{
                          fontSize: 'var(--font-size-subtitle)',
                          fontFamily: 'var(--secondary-font)',
                          color: 'var(--text-color)'
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-gray-600 text-sm mb-2 line-clamp-2"
                        style={{ fontSize: 'var(--font-size-small)' }}
                      >
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-bold"
                          style={{
                            fontSize: 'var(--font-size-subtitle)',
                            color: 'var(--accent-color)'
                          }}
                        >
                          ${minPrice.toFixed(2)}
                        </span>
                        {product.preparation_time && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span style={{ fontSize: 'var(--font-size-small)' }}>
                              {product.preparation_time} min
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              if (layoutType === 'editorial') {
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{ borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.25rem' }}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-96 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3
                        className="font-bold mb-2"
                        style={{
                          fontSize: 'calc(var(--font-size-title) * 0.8)',
                          fontFamily: 'var(--secondary-font)',
                          color: 'var(--text-color)'
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-gray-600 mb-4"
                        style={{ fontSize: 'var(--font-size-normal)' }}
                      >
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-bold"
                          style={{
                            fontSize: 'var(--font-size-title)',
                            color: 'var(--accent-color)'
                          }}
                        >
                          ${minPrice.toFixed(2)}
                        </span>
                        {product.preparation_time && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span style={{ fontSize: 'var(--font-size-normal)' }}>
                              {product.preparation_time} min
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid layout (default)
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => setSelectedProduct(product)}
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        fontSize: 'var(--font-size-subtitle)',
                        fontFamily: 'var(--secondary-font)',
                        color: 'var(--text-color)'
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-3 line-clamp-2"
                      style={{ fontSize: 'var(--font-size-small)' }}
                    >
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold"
                        style={{
                          fontSize: 'var(--font-size-subtitle)',
                          color: 'var(--accent-color)'
                        }}
                      >
                        ${minPrice.toFixed(2)}
                      </span>
                      {product.preparation_time && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span style={{ fontSize: 'var(--font-size-small)' }}>
                            {product.preparation_time} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FLOATING CART BUTTON */}
      {cartItemsCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 shadow-2xl rounded-full p-4 text-white flex items-center gap-2 hover:scale-110 transition-transform z-50"
          style={{
            backgroundColor: 'var(--primary-color)',
            borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem'
          }}
        >
          <ShoppingCart className="w-6 h-6" />
          <span
            className="bg-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm"
            style={{ color: 'var(--primary-color)' }}
          >
            {cartItemsCount}
          </span>
        </button>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          restaurant={restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* CART SIDEBAR */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        restaurant={restaurant}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        restaurant={restaurant}
      />
    </div>
  );
};
