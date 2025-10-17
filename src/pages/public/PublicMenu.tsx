import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Heart, Star } from 'lucide-react';
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

      const restaurants = loadFromStorage('restaurants', []);
      const restaurantData = restaurants.find((r: Restaurant) => r.slug === slug || r.id === slug || r.domain === slug);

      if (!restaurantData) {
        setError(`Restaurante no encontrado: ${slug}`);
        setLoading(false);
        return;
      }

      const subscriptions = loadFromStorage('subscriptions', []);
      const subscription = subscriptions.find((s: Subscription) => s.restaurant_id === restaurantData.id);

      if (!subscription || subscription.status !== 'active') {
        setError('Este restaurante no está disponible en este momento. Suscripción inactiva o vencida.');
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      const allCategories = loadFromStorage('categories', []);
      const allProducts = loadFromStorage('products', []);

      const restaurantCategories = allCategories.filter((cat: Category) =>
        cat.restaurant_id === restaurantData.id && cat.active
      );

      const restaurantProducts = allProducts.filter((prod: Product) =>
        prod.restaurant_id === restaurantData.id && prod.status === 'active'
      );

      setCategories(restaurantCategories);
      setProducts(restaurantProducts);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el menú');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadMenuData();
    } else {
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

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 3);
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
        </div>
      </div>
    );
  }

  const theme = restaurant.settings.theme;
  const primaryColor = theme.primary_color || '#FFC700';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const accentColor = theme.accent_color || '#FFC700';
  const textColor = theme.text_color || '#1f2937';

  return (
    <div
      className="min-h-screen bg-gray-50 relative overflow-hidden"
      style={{
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--primary-font': theme.primary_font || 'Inter',
        '--secondary-font': theme.secondary_font || 'Poppins',
      } as React.CSSProperties}
    >
      {/* DECORATIVE ORGANIC SHAPES */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-90 -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: primaryColor, filter: 'blur(100px)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-90 translate-x-1/2 translate-y-1/2"
        style={{ backgroundColor: primaryColor, filter: 'blur(100px)' }}
      />

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:outline-none bg-gray-50"
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                />
              </div>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 text-center">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-16 mx-auto"
                />
              ) : (
                <div
                  className="text-3xl font-bold"
                  style={{
                    color: primaryColor,
                    fontFamily: theme.secondary_font || 'Poppins'
                  }}
                >
                  {restaurant.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-1 justify-end max-w-xs">
              <button className="p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors relative">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="p-3 rounded-lg border border-gray-200 hover:opacity-90 transition-colors relative"
                style={{
                  backgroundColor: 'white',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURED SECTION */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="text-center mb-8">
            <p
              className="text-sm mb-2 opacity-70"
              style={{
                color: textColor,
                fontFamily: theme.primary_font || 'Inter'
              }}
            >
              Te presentamos nuestros
            </p>
            <h2
              className="text-5xl font-bold mb-2"
              style={{
                color: textColor,
                fontFamily: theme.secondary_font || 'Poppins'
              }}
            >
              destacados
            </h2>
            <div className="flex items-center justify-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: accentColor }} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`cursor-pointer transition-transform hover:scale-105 ${
                  index === 1 ? 'scale-110 z-10' : ''
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className={`w-64 h-64 object-cover rounded-full shadow-2xl ${
                      index === 1 ? 'w-80 h-80' : ''
                    }`}
                  />
                  {index === 1 && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-6 py-3">
                      <p
                        className="font-bold text-center whitespace-nowrap"
                        style={{
                          color: textColor,
                          fontFamily: theme.secondary_font || 'Poppins'
                        }}
                      >
                        <span style={{ color: accentColor }}>Letal</span> {product.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES TABS */}
      <div className="sticky top-[88px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
              style={{
                backgroundColor: selectedCategory === 'all' ? primaryColor : 'white',
                color: selectedCategory === 'all' ? '#000' : textColor,
                border: `2px solid ${selectedCategory === 'all' ? primaryColor : '#e5e7eb'}`,
                borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                fontFamily: theme.primary_font || 'Inter'
              }}
            >
              Hamburguesas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
                style={{
                  backgroundColor: selectedCategory === category.id ? primaryColor : 'white',
                  color: selectedCategory === category.id ? '#000' : textColor,
                  border: `2px solid ${selectedCategory === category.id ? primaryColor : '#e5e7eb'}`,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  fontFamily: theme.primary_font || 'Inter'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const minPrice = product.variations.length > 0
                ? Math.min(...product.variations.map(v => v.price))
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex items-center gap-4 p-4"
                  onClick={() => setSelectedProduct(product)}
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                >
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold mb-1 truncate"
                      style={{
                        fontSize: '18px',
                        fontFamily: theme.secondary_font || 'Poppins',
                        color: textColor
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-2 line-clamp-2"
                      style={{ fontFamily: theme.primary_font || 'Inter' }}
                    >
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold text-lg"
                        style={{
                          color: accentColor,
                          fontFamily: theme.secondary_font || 'Poppins'
                        }}
                      >
                        ${minPrice.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
