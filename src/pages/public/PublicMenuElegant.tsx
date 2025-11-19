import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Gift,
  Star,
  X,
  ChevronDown,
  MapPin,
  Globe,
  Facebook,
  Instagram,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant, Subscription } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { ProductDetail } from '../../components/public/ProductDetail';
import { CartSidebar } from '../../components/public/CartSidebar';
import { CheckoutModal } from '../../components/public/CheckoutModal';
import { formatCurrency } from '../../utils/currencyUtils';

interface PublicMenuElegantProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  theme: any;
}

export const PublicMenuElegant: React.FC<PublicMenuElegantProps> = ({
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

  const primaryColor = theme.primary_color || '#d4af37';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const menuBackgroundColor = theme.menu_background_color || '#1a1a1a';
  const cardBackgroundColor = theme.card_background_color || '#2a2a2a';
  const primaryTextColor = theme.primary_text_color || '#ffffff';
  const secondaryTextColor = theme.secondary_text_color || '#cccccc';

  const hasPromo =
    restaurant.settings.promo?.enabled &&
    restaurant.settings.promo?.vertical_promo_image;

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

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Agrupar productos por categoría
  const productsByCategory = categories.map((category) => ({
    category,
    products: filteredProducts.filter((p) => p.category_id === category.id),
  })).filter((group) => group.products.length > 0);

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: menuBackgroundColor,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        fontFamily: theme.secondary_font || 'Playfair Display',
      }}
    >
      <style>{`
        .elegant-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, ${primaryColor}, transparent);
          margin: 1rem 0;
        }

        .product-image-circle {
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          border: 3px solid ${primaryColor};
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .product-image-circle::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
          pointer-events: none;
        }

        .category-section {
          animation: fadeInUp 0.6s ease-out;
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

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Elegante */}
      <header className="relative z-50 py-8 border-b" style={{ borderColor: primaryColor + '30' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Logo y Título */}
          <div className="text-center mb-6">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-20 md:h-24 mx-auto mb-4"
              />
            ) : (
              <h1
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{
                  color: primaryTextColor,
                  fontFamily: theme.primary_font || 'Playfair Display',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {restaurant.name}
              </h1>
            )}
            <div className="elegant-divider max-w-xs mx-auto"></div>
            {restaurant.description && (
              <p
                className="text-sm md:text-base max-w-2xl mx-auto mt-3"
                style={{ color: secondaryTextColor }}
              >
                {restaurant.description}
              </p>
            )}
          </div>

          {/* Barra de búsqueda y acciones */}
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: secondaryTextColor }}
              />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-sm md:text-base focus:outline-none transition-all"
                style={{
                  backgroundColor: cardBackgroundColor,
                  border: `1px solid ${primaryColor}30`,
                  color: primaryTextColor,
                }}
              />
            </div>
            {hasPromo && (
              <button
                onClick={() => setShowPromoModal(true)}
                className="p-3 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: cardBackgroundColor,
                  border: `1px solid ${primaryColor}`,
                  color: primaryColor,
                }}
              >
                <Gift className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-lg transition-all hover:scale-110"
              style={{
                backgroundColor: cardBackgroundColor,
                border: `1px solid ${primaryColor}`,
                color: primaryColor,
              }}
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
      </header>

      {/* Categorías como tabs */}
      {!searchTerm && (
        <div className="sticky top-0 z-40 py-4" style={{ backgroundColor: menuBackgroundColor + 'f0', backdropFilter: 'blur(10px)' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === 'all' ? 'shadow-lg' : ''
                }`}
                style={{
                  backgroundColor: selectedCategory === 'all' ? primaryColor : 'transparent',
                  color: selectedCategory === 'all' ? '#000' : primaryTextColor,
                  border: `1px solid ${primaryColor}`,
                }}
              >
                Ver Todo
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category.id ? 'shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? primaryColor : 'transparent',
                    color: selectedCategory === category.id ? '#000' : primaryTextColor,
                    border: `1px solid ${primaryColor}`,
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenido del menú - Estilo Infografía */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {searchTerm ? (
          // Vista de búsqueda
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;

              return (
                <div
                  key={product.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="product-image-circle w-48 h-48 mx-auto mb-4">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: cardBackgroundColor }}
                      >
                        <span style={{ color: secondaryTextColor }}>Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: primaryTextColor,
                        fontFamily: theme.primary_font || 'Playfair Display',
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-sm mb-2 line-clamp-2"
                      style={{ color: secondaryTextColor }}
                    >
                      {product.description}
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(minPrice, restaurant.settings.currency || 'USD')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : selectedCategory === 'all' ? (
          // Vista por categorías - Estilo infografía
          <div className="space-y-16">
            {productsByCategory.map((group, groupIndex) => (
              <section key={group.category.id} className="category-section" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                {/* Título de categoría */}
                <div className="text-center mb-12">
                  <h2
                    className="text-3xl md:text-4xl font-bold mb-3"
                    style={{
                      color: primaryTextColor,
                      fontFamily: theme.primary_font || 'Playfair Display',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    {group.category.name}
                  </h2>
                  {group.category.description && (
                    <p className="text-base max-w-2xl mx-auto" style={{ color: secondaryTextColor }}>
                      {group.category.description}
                    </p>
                  )}
                  <div className="elegant-divider max-w-md mx-auto mt-4"></div>
                </div>

                {/* Grid de productos alternando posiciones */}
                <div className="space-y-12">
                  {group.products.map((product, productIndex) => {
                    const minPrice =
                      product.variations.length > 0
                        ? Math.min(...product.variations.map((v) => v.price))
                        : 0;
                    const isEven = productIndex % 2 === 0;

                    return (
                      <div
                        key={product.id}
                        className={`flex flex-col md:flex-row items-center gap-8 ${
                          isEven ? '' : 'md:flex-row-reverse'
                        } cursor-pointer group`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* Imagen circular */}
                        <div className="w-64 h-64 flex-shrink-0">
                          <div className="product-image-circle w-full h-full">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: cardBackgroundColor }}
                              >
                                <span style={{ color: secondaryTextColor }}>Sin imagen</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información del producto */}
                        <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
                          <h3
                            className="text-2xl md:text-3xl font-bold mb-3"
                            style={{
                              color: primaryTextColor,
                              fontFamily: theme.primary_font || 'Playfair Display',
                            }}
                          >
                            {product.name}
                          </h3>
                          <div className={`elegant-divider ${isEven ? 'md:mr-auto' : 'md:ml-auto'} mx-auto max-w-xs mb-4`}></div>
                          {product.description && (
                            <p
                              className="text-base mb-4 leading-relaxed"
                              style={{ color: secondaryTextColor }}
                            >
                              {product.description}
                            </p>
                          )}
                          <p
                            className="text-2xl font-bold"
                            style={{ color: primaryColor }}
                          >
                            {formatCurrency(minPrice, restaurant.settings.currency || 'USD')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          // Vista de categoría individual
          <div className="space-y-12">
            {filteredProducts.map((product, productIndex) => {
              const minPrice =
                product.variations.length > 0
                  ? Math.min(...product.variations.map((v) => v.price))
                  : 0;
              const isEven = productIndex % 2 === 0;

              return (
                <div
                  key={product.id}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? '' : 'md:flex-row-reverse'
                  } cursor-pointer group`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="w-64 h-64 flex-shrink-0">
                    <div className="product-image-circle w-full h-full">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: cardBackgroundColor }}
                        >
                          <span style={{ color: secondaryTextColor }}>Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
                    <h3
                      className="text-2xl md:text-3xl font-bold mb-3"
                      style={{
                        color: primaryTextColor,
                        fontFamily: theme.primary_font || 'Playfair Display',
                      }}
                    >
                      {product.name}
                    </h3>
                    <div className={`elegant-divider ${isEven ? 'md:mr-auto' : 'md:ml-auto'} mx-auto max-w-xs mb-4`}></div>
                    {product.description && (
                      <p
                        className="text-base mb-4 leading-relaxed"
                        style={{ color: secondaryTextColor }}
                      >
                        {product.description}
                      </p>
                    )}
                    <p
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(minPrice, restaurant.settings.currency || 'USD')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer elegante */}
      <footer className="border-t mt-16 py-8" style={{ borderColor: primaryColor + '30' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="elegant-divider max-w-md mx-auto mb-6"></div>
          <div className="text-center mb-6">
            <h3
              className="text-xl font-bold mb-2"
              style={{
                color: primaryTextColor,
                fontFamily: theme.primary_font || 'Playfair Display',
              }}
            >
              {restaurant.name}
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: secondaryTextColor }}>
              <MapPin className="w-4 h-4" />
              <span>{restaurant.address}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            {restaurant.settings.social_media?.website && (
              <a
                href={restaurant.settings.social_media.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: cardBackgroundColor,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {restaurant.settings.social_media?.facebook && (
              <a
                href={restaurant.settings.social_media.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: cardBackgroundColor,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {restaurant.settings.social_media?.instagram && (
              <a
                href={restaurant.settings.social_media.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: cardBackgroundColor,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* PROMOTIONAL MODAL */}
      {showPromoModal && hasPromo && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: cardBackgroundColor,
              border: `2px solid ${primaryColor}`,
            }}
          >
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 rounded-full p-2 z-10 transition-all hover:scale-110"
              style={{
                backgroundColor: cardBackgroundColor,
                color: primaryTextColor,
              }}
            >
              <X className="w-6 h-6" />
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
