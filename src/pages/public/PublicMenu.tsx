import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Gift, Star, X, ChevronLeft, ChevronRight, Grid3x3, List, Clock, MapPin, Facebook, Instagram, Phone } from 'lucide-react';
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
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'editorial'>('list');
  const [showHoursModal, setShowHoursModal] = useState(false);

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
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;

      if (!matchesCategory) return false;

      if (searchTerm === '') return true;

      const searchLower = searchTerm.toLowerCase();
      return product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower));
    })
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const getFeaturedProducts = () => {
    if (!restaurant?.settings.promo?.featured_product_ids?.length) {
      return products.filter(p => p.is_featured).slice(0, 5);
    }

    const featuredIds = restaurant.settings.promo.featured_product_ids;
    return products
      .filter(p => featuredIds.includes(p.id))
      .slice(0, 5);
  };

  const featuredProducts = getFeaturedProducts();
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const nextSlide = () => {
    setFeaturedSlideIndex((prev) => (prev + 1) % Math.max(1, featuredProducts.length));
  };

  const prevSlide = () => {
    setFeaturedSlideIndex((prev) => (prev - 1 + featuredProducts.length) % Math.max(1, featuredProducts.length));
  };

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
  const menuBackgroundColor = theme.menu_background_color || '#ffffff';
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';
  const textColor = theme.primary_text_color || '#111827';
  const hasPromo = restaurant.settings.promo?.enabled && restaurant.settings.promo?.vertical_promo_image;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: menuBackgroundColor,
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--menu-bg-color': menuBackgroundColor,
        '--card-bg-color': cardBackgroundColor,
        '--primary-text-color': primaryTextColor,
        '--secondary-text-color': secondaryTextColor,
        '--text-color': textColor,
        '--primary-font': theme.primary_font || 'Inter',
        '--secondary-font': theme.secondary_font || 'Poppins',
      } as React.CSSProperties}
    >
      <style>{`
        p, span { color: ${primaryTextColor} !important; }
        h1, h2, h3, h4, h5, h6 { color: ${primaryTextColor} !important; }
        .secondary-text { color: ${secondaryTextColor} !important; }
      `}</style>
      {/* DECORATIVE ORGANIC SHAPES - MATCHING REFERENCE */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] opacity-80 pointer-events-none"
        style={{
          background: primaryColor,
          borderBottomRightRadius: '50% 40%',
          borderTopRightRadius: '0% 0%',
          transform: 'translate(-20%, -20%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-80 pointer-events-none"
        style={{
          background: primaryColor,
          borderTopLeftRadius: '60% 50%',
          borderBottomLeftRadius: '0% 0%',
          transform: 'translate(25%, 25%)',
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 relative bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
             <div className="flex-1 max-w-xs">
              <div className="relative">
                {/* Icono de lupa */}
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: primaryTextColor, stroke: primaryTextColor }}
                />
            
                {/* Input */}
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      setTimeout(() => {
                        document
                          .getElementById('products-section')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:outline-none transition-colors placeholder-opacity-70 custom-placeholder"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderColor: cardBackgroundColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius:
                      theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                    color: primaryTextColor,
                    caretColor: primaryTextColor,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = primaryTextColor)}
                  onBlur={(e) => (e.target.style.borderColor = cardBackgroundColor)}
                />
            
                {/* CSS dinámico para el placeholder */}
                <style>{`
                  .custom-placeholder::placeholder {
                    color: ${primaryTextColor} !important;
                    opacity: 0.7;
                  }
                `}</style>
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
              {hasPromo && (
<button
  onClick={() => setShowPromoModal(true)}
  className="p-3 rounded-lg border transition-colors relative hover:opacity-90"
  style={{
    backgroundColor: cardBackgroundColor,
    borderColor: cardBackgroundColor,
    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
  }}
>
  <Gift
    className="w-5 h-5"
    style={{
      color: textColor,
    }}
  />
  <span
    style={{
      position: 'absolute',
      top: '-4px',       // antes 6px → negativo para que quede encima del borde
      right: '-4px',     // antes 6px → negativo para que sobresalga del borde
      width: '15px',
      height: '15px',
      backgroundColor: secondaryColor,
      borderRadius: '50%',
      boxShadow: '0 0 0 2px white', // opcional: halo blanco para destacar
    }}
  />
</button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="p-3 rounded-lg border hover:opacity-90 transition-colors relative"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: cardBackgroundColor,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                }}
              >
                <ShoppingCart className="w-5 h-5" style={{ color: primaryTextColor, stroke: primaryTextColor }} />
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

      {/* FEATURED SECTION SLIDER */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 relative z-30">
          <div className="text-center mb-12">
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
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: primaryColor }} />
              ))}
            </div>
          </div>

          <div className="relative h-[450px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                {featuredProducts.map((product, index) => {
                  const offset = index - featuredSlideIndex;
                  const isCenter = offset === 0;
                  const isVisible = Math.abs(offset) <= 1;

                  if (!isVisible) return null;

                  return (
                    <div
                      key={product.id}
                      className="absolute cursor-pointer transition-all duration-700 ease-in-out"
                      style={{
                        transform: `translateX(${offset * 350}px) scale(${isCenter ? 1.2 : 0.75})`,
                        opacity: isCenter ? 1 : 0.4,
                        zIndex: isCenter ? 20 : 10 - Math.abs(offset),
                        pointerEvents: isCenter ? 'auto' : 'none',
                      }}
                      onClick={() => isCenter && setSelectedProduct(product)}
                    >
                      <div className="relative flex flex-col items-center">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-80 h-80 object-cover rounded-full shadow-2xl"
                        />
                        {isCenter && (
                          <div
                            className="mt-6 rounded-lg shadow-xl px-8 py-4 max-w-xs"
                            style={{
                              backgroundColor: cardBackgroundColor,
                            }}
                          >
                            <p
                              className="font-bold text-center text-lg"
                              style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
                              }}
                            >
                              {product.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {featuredProducts.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full p-3 shadow-lg transition-colors z-20 hover:opacity-90"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem',
                  }}
                >
                  <ChevronLeft className="w-6 h-6" style={{ color: textColor }} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full p-3 shadow-lg transition-colors z-20 hover:opacity-90"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem',
                  }}
                >
                  <ChevronRight className="w-6 h-6" style={{ color: textColor }} />
                </button>

                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedSlideIndex(index)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: index === featuredSlideIndex ? primaryColor : cardBackgroundColor,
                        width: index === featuredSlideIndex ? '24px' : '8px',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* CATEGORIES TABS - CENTERED */}
      <div className="relative z-20" >
        <div className="max-w-7xl mx-auto px-4 py-4 relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
              style={{
                backgroundColor: selectedCategory === 'all' ? primaryColor : 'transparent',
                color: selectedCategory === 'all' ? secondaryTextColor : textColor,
                border: `1px solid ${primaryColor}`,
                borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                fontFamily: theme.primary_font || 'Inter'
              }}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-6 py-2.5 whitespace-nowrap transition-all font-medium text-sm"
                style={{
                  backgroundColor: selectedCategory === category.id ? primaryColor : 'transparent',
                  color: selectedCategory === category.id ? secondaryTextColor : textColor,
                  border: `1px solid ${primaryColor}`,
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
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 relative z-10" id="products-section">
        {/* View Mode Selector */}
        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <List className="w-5 h-5" style={{ color: viewMode === 'list' ? primaryColor : textColor }} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <Grid3x3 className="w-5 h-5" style={{ color: viewMode === 'grid' ? primaryColor : textColor }} />
          </button>
          <button
            onClick={() => setViewMode('editorial')}
            className={`p-2 px-4 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'editorial' ? 'bg-white shadow-md' : 'bg-white/50'}`}
            style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
          >
            <span className="text-sm font-medium" style={{ color: viewMode === 'editorial' ? primaryColor : textColor }}>Editorial</span>
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'list' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' :
            'space-y-6'
          }>
            {filteredProducts.map((product) => {
              const minPrice = product.variations.length > 0
                ? Math.min(...product.variations.map(v => v.price))
                : 0;

              if (viewMode === 'editorial') {
                return (
                  <div
                    key={product.id}
                    className="rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                      backgroundColor: cardBackgroundColor
                    }}
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full md:w-64 h-64 object-cover rounded-lg flex-shrink-0"
                          style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-center">
                        <h3
                          className="font-bold mb-3 text-2xl"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            color: textColor
                          }}
                        >
                          {product.name}
                        </h3>
                        <p
                          className="mb-4 text-base leading-relaxed"
                          style={{
                            fontFamily: theme.primary_font || 'Inter',
                            color: secondaryTextColor
                          }}
                        >
                          {product.description}
                        </p>
                        <span
                          className="font-bold text-2xl"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
                          }}
                        >
                          Desde ${minPrice.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (viewMode === 'grid') {
                return (
                  <div
                    key={product.id}
                    className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                      backgroundColor: cardBackgroundColor
                    }}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3
                        className="font-bold mb-2 line-clamp-1"
                        style={{
                          fontSize: '16px',
                          fontFamily: theme.secondary_font || 'Poppins',
                          color: textColor
                        }}
                      >
                        {product.name}
                      </h3>
                        <span
                          className="font-bold text-lg"
                          style={{
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
                          }}
                        >
                          ${minPrice.toLocaleString('es-CO')}
                        </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={product.id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex items-center gap-4 p-4"
                  onClick={() => setSelectedProduct(product)}
                  style={{
                    borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
                    backgroundColor: cardBackgroundColor
                  }}
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
                            fontFamily: theme.secondary_font || 'Poppins',
                            cssText: `color: ${primaryColor} !important;`
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

      {/* PROMOTIONAL MODAL */}
      {showPromoModal && hasPromo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.5rem' }}
          >
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
              style={{ borderRadius: theme.button_style === 'rounded' ? '9999px' : '0.5rem' }}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <img
              src={restaurant.settings.promo.vertical_promo_image}
              alt="Promoción"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
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

      {/* HOURS MODAL */}
      {showHoursModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowHoursModal(false)}
        >
          <div
            className="relative max-w-md w-full rounded-lg overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: cardBackgroundColor,
              borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.5rem',
            }}
          >
            <button
              onClick={() => setShowHoursModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" style={{ color: primaryTextColor, stroke: primaryTextColor }} />
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ color: textColor, fontFamily: theme.secondary_font || 'Poppins' }}>
              Horarios de Atención
            </h3>
            <div className="space-y-3">
              {restaurant.settings.business_hours && Object.entries(restaurant.settings.business_hours).map(([day, hours]: [string, any]) => {
                const dayNames: Record<string, string> = {
                  monday: 'Lunes',
                  tuesday: 'Martes',
                  wednesday: 'Miércoles',
                  thursday: 'Jueves',
                  friday: 'Viernes',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                };
                return (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium" style={{ color: textColor, fontFamily: theme.primary_font || 'Inter' }}>
                      {dayNames[day]}
                    </span>
                    <span className="text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>
                      {hours.is_open ? `${hours.open} - ${hours.close}` : 'Cerrado'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OPEN/CLOSED STATUS BUTTON */}
      <button
        onClick={() => setShowHoursModal(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 shadow-lg px-4 py-3 z-40 transition-all hover:shadow-xl"
        style={{
          backgroundColor: cardBackgroundColor,
          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
          borderLeft: `4px solid ${(() => {
            const now = new Date();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = dayNames[now.getDay()];
            const hours = restaurant.settings.business_hours?.[currentDay];
            if (!hours?.is_open) return '#ef4444'; // rojo si está cerrado
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [openH, openM] = hours.open.split(':').map(Number);
            const [closeH, closeM] = hours.close.split(':').map(Number);
            const openTime = openH * 60 + openM;
            const closeTime = closeH * 60 + closeM;
            return currentTime >= openTime && currentTime <= closeTime ? '#10b981' : '#ef4444'; // verde si abierto
          })()}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: textColor }} />
          <div className="text-left">
            <p className="text-xs text-gray-600" style={{ fontFamily: theme.primary_font || 'Inter' }}>Estado</p>
            <p className="font-bold text-sm" style={{
              color: (() => {
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = dayNames[now.getDay()];
                const hours = restaurant.settings.business_hours?.[currentDay];
                if (!hours?.is_open) return '#ef4444';
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [openH, openM] = hours.open.split(':').map(Number);
                const [closeH, closeM] = hours.close.split(':').map(Number);
                const openTime = openH * 60 + openM;
                const closeTime = closeH * 60 + closeM;
                return currentTime >= openTime && currentTime <= closeTime ? '#10b981' : '#ef4444';
              })(),
              fontFamily: theme.secondary_font || 'Poppins'
            }}>
              {(() => {
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = dayNames[now.getDay()];
                const hours = restaurant.settings.business_hours?.[currentDay];
                if (!hours?.is_open) return 'Cerrado';
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [openH, openM] = hours.open.split(':').map(Number);
                const [closeH, closeM] = hours.close.split(':').map(Number);
                const openTime = openH * 60 + openM;
                const closeTime = closeH * 60 + closeM;
                return currentTime >= openTime && currentTime <= closeTime ? 'Abierto' : 'Cerrado';
              })()}
            </p>
          </div>
        </div>
      </button>

      {/* FLOATING FOOTER BAR */}
      <div
        className="fixed bottom-0 left-0 right-0 shadow-lg z-40"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" style={{ color: secondaryTextColor, stroke: secondaryTextColor }} />
                <span
                  className="font-medium"
                  style={{
                    fontFamily: theme.primary_font || 'Inter',
                    cssText: `color: ${secondaryTextColor} !important;`,
                  }}
                >
                {restaurant.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {restaurant.settings.social_media?.facebook && (
                <a
                  href={restaurant.settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Facebook className="w-5 h-5" style={{ color: primaryColor, stroke: secondaryTextColor }} />
                </a>
              )}
              {restaurant.settings.social_media?.instagram && (
                <a
                  href={restaurant.settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Instagram className="w-5 h-5" style={{ color: primaryColor, stroke: secondaryTextColor }} />
                </a>
              )}
              {restaurant.settings.social_media?.whatsapp && (
                <a
                  href={restaurant.settings.social_media.phone}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:opacity-90 transition-colors rounded-lg"
                  style={{
                    backgroundColor: cardBackgroundColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  }}
                >
                  <Phone className="w-5 h-5" style={{ color: primaryColor, stroke: secondaryTextColor }} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
