import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  X,
  Clock,
  MapPin,
  Phone,
  Globe,
  Facebook,
  Instagram,
  ChevronRight,
  Star,
  Gift,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { ProductDetail } from '../../components/public/ProductDetail';
import { CartSidebar } from '../../components/public/CartSidebar';
import { CheckoutModal } from '../../components/public/CheckoutModal';
import { formatCurrency } from '../../utils/currencyUtils';

interface PublicMenuMinimalProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  theme: any;
}

export const PublicMenuMinimal: React.FC<PublicMenuMinimalProps> = ({
  restaurant,
  categories,
  products,
  theme,
}) => {
  const { items: cartItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = theme.primary_color || '#000000';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const menuBackgroundColor = theme.menu_background_color || '#ffffff';
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

  const hasPromo =
    restaurant.settings.promo?.enabled &&
    restaurant.settings.promo?.vertical_promo_image;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory;
      if (!matchesCategory) return false;
      if (searchTerm === '') return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description &&
          product.description.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const getFeaturedProducts = () => {
    if (!restaurant?.settings.promo?.featured_product_ids?.length) {
      return products.filter((p) => p.is_featured).slice(0, 4);
    }
    const featuredIds = restaurant.settings.promo.featured_product_ids;
    return products.filter((p) => featuredIds.includes(p.id)).slice(0, 4);
  };

  const featuredProducts = getFeaturedProducts();
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${menuBackgroundColor} 0%, ${cardBackgroundColor} 100%)`,
        fontFamily: theme.secondary_font || 'Inter',
      }}
    >
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.55);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header con Glassmorfismo */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-effect shadow-xl' : ''
        }`}
        style={{
          backgroundColor: scrolled
            ? 'rgba(255, 255, 255, 0.05)'
            : 'transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-12 md:h-14"
              />
            ) : (
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{
                  color: primaryTextColor,
                  fontFamily: theme.primary_font || 'Inter',
                }}
              >
                {restaurant.name}
              </h1>
            )}

            <div className="flex items-center gap-2">
              {hasPromo && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="glass-card p-3 rounded-full hover:scale-110 transition-transform"
                  style={{ color: primaryColor }}
                >
                  <Gift className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="glass-card relative p-3 rounded-full hover:scale-110 transition-transform"
                style={{ color: primaryColor }}
              >
                <ShoppingCart className="w-5 h-5" />
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

          {/* Search Bar con Glassmorfismo */}
          <div className="glass-card rounded-full overflow-hidden">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: secondaryTextColor }}
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none text-sm md:text-base"
                style={{
                  color: primaryTextColor,
                  fontFamily: theme.secondary_font || 'Inter',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Featured Products Carousel con Glassmorfismo */}
      {!searchTerm && featuredProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Star
              className="w-7 h-7 fill-current"
              style={{ color: primaryColor }}
            />
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                color: primaryTextColor,
                fontFamily: theme.primary_font || 'Inter',
              }}
            >
              Destacados
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;

              return (
                <div
                  key={product.id}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.images[0] && (
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3
                      className="font-semibold mb-1 line-clamp-1"
                      style={{
                        color: primaryTextColor,
                        fontFamily: theme.primary_font || 'Inter',
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-sm font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(
                        minPrice,
                        restaurant.settings.currency || 'USD'
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categorías con Glassmorfismo */}
      <div className="sticky top-[140px] z-40 mb-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="glass-card rounded-full p-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all' ? 'shadow-lg' : 'opacity-70'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === 'all' ? primaryColor : 'transparent',
                  color:
                    selectedCategory === 'all'
                      ? '#ffffff'
                      : primaryTextColor,
                }}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'shadow-lg'
                      : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === category.id
                        ? primaryColor
                        : 'transparent',
                    color:
                      selectedCategory === category.id
                        ? '#ffffff'
                        : primaryTextColor,
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos con Glassmorfismo */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-16 relative z-10">
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p
                className="text-lg"
                style={{ color: secondaryTextColor }}
              >
                No se encontraron productos
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;

              return (
                <div
                  key={product.id}
                  className="glass-card rounded-2xl p-5 cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-start gap-5">
                    {product.images[0] && (
                      <div className="relative overflow-hidden rounded-xl flex-shrink-0 shadow-md">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-28 h-28 md:w-32 md:h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-base md:text-lg font-semibold mb-2"
                        style={{
                          color: primaryTextColor,
                          fontFamily: theme.primary_font || 'Inter',
                        }}
                      >
                        {product.name}
                      </h3>
                      {product.description && (
                        <p
                          className="text-sm mb-3 line-clamp-2"
                          style={{ color: secondaryTextColor }}
                        >
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-lg md:text-xl font-bold"
                          style={{ color: primaryColor }}
                        >
                          {formatCurrency(
                            minPrice,
                            restaurant.settings.currency || 'USD'
                          )}
                        </span>
                        <ChevronRight
                          className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all"
                          style={{ color: primaryColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer con Glassmorfismo */}
      <footer className="glass-effect mt-12 border-t" style={{ borderColor: primaryTextColor + '20' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2" style={{ color: primaryTextColor }}>
              <MapPin className="w-4 h-4" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-4">
              {restaurant.settings.social_media?.website && (
                <a
                  href={restaurant.settings.social_media.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-2 rounded-full hover:scale-110 transition-transform"
                  style={{ color: primaryTextColor }}
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {restaurant.settings.social_media?.facebook && (
                <a
                  href={restaurant.settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-2 rounded-full hover:scale-110 transition-transform"
                  style={{ color: primaryTextColor }}
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {restaurant.settings.social_media?.instagram && (
                <a
                  href={restaurant.settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-2 rounded-full hover:scale-110 transition-transform"
                  style={{ color: primaryTextColor }}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* PROMOTIONAL MODAL */}
      {showPromoModal && hasPromo && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] glass-card rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 glass-card rounded-full p-2 hover:scale-110 transition-transform z-10"
            >
              <X className="w-6 h-6" style={{ color: primaryTextColor }} />
            </button>
            <img
              src={restaurant.settings.promo.vertical_promo_image}
              alt="Promoción"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          restaurant={restaurant}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        restaurant={restaurant}
      />
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        restaurant={restaurant}
      />
    </div>
  );
};
