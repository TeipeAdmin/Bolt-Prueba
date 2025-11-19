import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  X,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Star,
  Gift,
  ArrowRight,
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
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = theme.primary_color || '#2D3436';
  const secondaryColor = theme.secondary_color || '#DFE6E9';
  const menuBackgroundColor = theme.menu_background_color || '#F8F9FA';
  const cardBackgroundColor = theme.card_background_color || '#FFFFFF';
  const primaryTextColor = theme.primary_text_color || '#2D3436';
  const secondaryTextColor = theme.secondary_text_color || '#636E72';

  const hasPromo =
    restaurant.settings.promo?.enabled &&
    restaurant.settings.promo?.vertical_promo_image;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
      return products.filter((p) => p.is_featured).slice(0, 3);
    }
    const featuredIds = restaurant.settings.promo.featured_product_ids;
    return products.filter((p) => featuredIds.includes(p.id)).slice(0, 3);
  };

  const featuredProducts = getFeaturedProducts();
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: menuBackgroundColor,
        fontFamily: theme.secondary_font || 'Inter',
      }}
    >
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .glass-header {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .product-image-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .product-image-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.05) 100%);
          z-index: 1;
          pointer-events: none;
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: ${primaryColor};
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>

      {/* Header minimalista con glassmorfismo */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-header shadow-lg' : ''
        }`}
        style={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          {/* Logo y Título */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-12 md:h-16"
                />
              ) : (
                <h1
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                  style={{
                    color: primaryTextColor,
                    fontFamily: theme.primary_font || 'Inter',
                  }}
                >
                  {restaurant.name}
                </h1>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3">
              {hasPromo && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="glass-card p-3 rounded-2xl hover:scale-110 transition-transform"
                  style={{ color: primaryColor }}
                >
                  <Gift className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="glass-card relative p-3 rounded-2xl hover:scale-110 transition-transform"
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

          {/* Barra de búsqueda */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="relative">
              <Search
                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: secondaryTextColor }}
              />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-transparent focus:outline-none text-base"
                style={{
                  color: primaryTextColor,
                  fontFamily: theme.secondary_font || 'Inter',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Categorías */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`glass-card px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor:
                selectedCategory === 'all'
                  ? primaryColor
                  : 'rgba(255, 255, 255, 0.75)',
              color: selectedCategory === 'all' ? '#fff' : primaryTextColor,
              ringColor: primaryColor,
            }}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`glass-card px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category.id
                    ? primaryColor
                    : 'rgba(255, 255, 255, 0.75)',
                color:
                  selectedCategory === category.id ? '#fff' : primaryTextColor,
                ringColor: primaryColor,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Productos destacados */}
      {!searchTerm && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-8 animate-fade-in">
          <div className="mb-8">
            <h2
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                color: primaryTextColor,
                fontFamily: theme.primary_font || 'Inter',
              }}
            >
              Platos Destacados
            </h2>
            <p className="text-base" style={{ color: secondaryTextColor }}>
              Lo mejor de nuestra cocina
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;

              return (
                <div
                  key={product.id}
                  className="glass-card rounded-3xl p-6 cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.images[0] && (
                    <div className="product-image-wrapper mb-6 relative aspect-square">
                      <div className="featured-badge">Destacado</div>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      color: primaryTextColor,
                      fontFamily: theme.primary_font || 'Inter',
                    }}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p
                      className="text-sm mb-4 line-clamp-2 leading-relaxed"
                      style={{ color: secondaryTextColor }}
                    >
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(
                        minPrice,
                        restaurant.settings.currency || 'USD'
                      )}
                    </span>
                    <ArrowRight
                      className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      style={{ color: primaryColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lista de productos */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: secondaryTextColor }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProducts.map((product, index) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;

              return (
                <div
                  key={product.id}
                  className="glass-card rounded-3xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {product.images[0] && (
                      <div className="md:w-48 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <h3
                        className="text-xl md:text-2xl font-bold mb-2"
                        style={{
                          color: primaryTextColor,
                          fontFamily: theme.primary_font || 'Inter',
                        }}
                      >
                        {product.name}
                      </h3>
                      {product.description && (
                        <p
                          className="text-sm mb-4 line-clamp-2 leading-relaxed"
                          style={{ color: secondaryTextColor }}
                        >
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: primaryColor }}
                        >
                          {formatCurrency(
                            minPrice,
                            restaurant.settings.currency || 'USD'
                          )}
                        </span>
                        <ArrowRight
                          className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          style={{ color: primaryColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-header border-t py-8" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm" style={{ color: primaryTextColor }}>
              <MapPin className="w-4 h-4" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-3">
              {restaurant.settings.social_media?.website && (
                <a
                  href={restaurant.settings.social_media.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-3 rounded-xl hover:scale-110 transition-transform"
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
                  className="glass-card p-3 rounded-xl hover:scale-110 transition-transform"
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
                  className="glass-card p-3 rounded-xl hover:scale-110 transition-transform"
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
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4"
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
