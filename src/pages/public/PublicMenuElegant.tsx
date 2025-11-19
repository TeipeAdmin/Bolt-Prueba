import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Gift,
  Star,
  X,
  Clock,
  MapPin,
  Phone,
  Globe,
  Facebook,
  Instagram,
  Sparkles,
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
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const primaryColor = theme.primary_color || '#000000';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const menuBackgroundColor = theme.menu_background_color || '#ffffff';
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

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
      className="min-h-screen"
      style={{
        backgroundColor: menuBackgroundColor,
        fontFamily: theme.secondary_font || 'Playfair Display',
      }}
    >
      {/* Header Elegante con Espaciado Generoso */}
      <header
        className="border-b"
        style={{
          backgroundColor: menuBackgroundColor,
          borderColor: primaryTextColor + '15',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-6">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-20 mx-auto mb-4"
              />
            ) : (
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  color: primaryTextColor,
                  fontFamily: theme.primary_font || 'Playfair Display',
                }}
              >
                {restaurant.name}
              </h1>
            )}
            {restaurant.description && (
              <p
                className="text-sm max-w-md mx-auto"
                style={{ color: secondaryTextColor }}
              >
                {restaurant.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: secondaryTextColor }}
              />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: primaryTextColor + '20',
                  color: primaryTextColor,
                }}
              />
            </div>
            {hasPromo && (
              <button
                onClick={() => setShowPromoModal(true)}
                className="p-3 rounded-full border transition-all hover:shadow-md"
                style={{
                  backgroundColor: cardBackgroundColor,
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                <Gift className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-full border transition-all hover:shadow-md"
              style={{
                backgroundColor: cardBackgroundColor,
                borderColor: primaryColor,
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

      {/* Featured Products Section */}
      {!searchTerm && featuredProducts.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
              <h2
                className="text-2xl font-bold"
                style={{
                  color: primaryTextColor,
                  fontFamily: theme.primary_font || 'Playfair Display',
                }}
              >
                Nuestras Especialidades
              </h2>
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-current"
                  style={{ color: primaryColor }}
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
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
                  {product.images[0] && (
                    <div className="relative overflow-hidden rounded-lg mb-4 aspect-square">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3
                    className="text-lg font-semibold mb-1 text-center"
                    style={{
                      color: primaryTextColor,
                      fontFamily: theme.primary_font || 'Playfair Display',
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="text-sm mb-2 text-center line-clamp-2"
                    style={{ color: secondaryTextColor }}
                  >
                    {product.description}
                  </p>
                  <p
                    className="text-center font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {formatCurrency(
                      minPrice,
                      restaurant.settings.currency || 'USD'
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      <div
        className="border-y"
        style={{
          backgroundColor: cardBackgroundColor,
          borderColor: primaryTextColor + '15',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center gap-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm font-medium pb-1 border-b-2 transition-colors whitespace-nowrap"
              style={{
                color: selectedCategory === 'all' ? primaryColor : secondaryTextColor,
                borderColor: selectedCategory === 'all' ? primaryColor : 'transparent',
                fontFamily: theme.primary_font || 'Playfair Display',
              }}
            >
              Todo el Menú
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="text-sm font-medium pb-1 border-b-2 transition-colors whitespace-nowrap"
                style={{
                  color: selectedCategory === category.id ? primaryColor : secondaryTextColor,
                  borderColor: selectedCategory === category.id ? primaryColor : 'transparent',
                  fontFamily: theme.primary_font || 'Playfair Display',
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid - Diseño elegante con cards */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {filteredProducts.map((product) => {
            const minPrice =
              product.variations.length > 0
                ? Math.min(...product.variations.map((v) => v.price))
                : 0;

            return (
              <div
                key={product.id}
                className="cursor-pointer group rounded-lg overflow-hidden transition-all hover:shadow-xl"
                onClick={() => setSelectedProduct(product)}
                style={{
                  backgroundColor: cardBackgroundColor,
                  border: `1px solid ${primaryTextColor}15`,
                }}
              >
                {product.images[0] && (
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className="text-xl font-semibold flex-1"
                      style={{
                        color: primaryTextColor,
                        fontFamily: theme.primary_font || 'Playfair Display',
                      }}
                    >
                      {product.name}
                    </h3>
                    <span
                      className="text-lg font-bold ml-4"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(
                        minPrice,
                        restaurant.settings.currency || 'USD'
                      )}
                    </span>
                  </div>
                  {product.description && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: secondaryTextColor }}
                    >
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Elegante */}
      <footer
        className="border-t mt-12"
        style={{
          backgroundColor: cardBackgroundColor,
          borderColor: primaryTextColor + '15',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-6">
            <h3
              className="text-lg font-semibold mb-2"
              style={{
                color: primaryTextColor,
                fontFamily: theme.primary_font || 'Playfair Display',
              }}
            >
              {restaurant.name}
            </h3>
            <div
              className="flex items-center justify-center gap-2 text-sm mb-4"
              style={{ color: secondaryTextColor }}
            >
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
                className="p-2 rounded-full transition-colors"
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
                className="p-2 rounded-full transition-colors"
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
                className="p-2 rounded-full transition-colors"
                style={{ color: primaryTextColor }}
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
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
