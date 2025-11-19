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

  const primaryColor = theme.primary_color || '#000000';
  const secondaryColor = theme.secondary_color || '#f3f4f6';
  const menuBackgroundColor = theme.menu_background_color || '#ffffff';
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

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

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: menuBackgroundColor,
        fontFamily: theme.secondary_font || 'Inter',
      }}
    >
      {/* Header Simple y Fijo */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: menuBackgroundColor,
          borderColor: primaryTextColor + '20',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: secondaryTextColor }}
                />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border-0 focus:outline-none"
                  style={{
                    backgroundColor: 'transparent',
                    color: primaryTextColor,
                    fontFamily: theme.secondary_font || 'Inter',
                  }}
                />
              </div>
            </div>

            {restaurant.logo && (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-10"
              />
            )}

            <button
              onClick={() => setShowCart(true)}
              className="relative p-2"
              style={{ color: primaryTextColor }}
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

      {/* Categorías como menú horizontal simple */}
      <div
        className="sticky top-[73px] z-40 border-b"
        style={{
          backgroundColor: menuBackgroundColor,
          borderColor: primaryTextColor + '20',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 py-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className="whitespace-nowrap text-sm font-medium pb-1 border-b-2 transition-colors"
              style={{
                color: selectedCategory === 'all' ? primaryColor : secondaryTextColor,
                borderColor: selectedCategory === 'all' ? primaryColor : 'transparent',
              }}
            >
              Todo
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap text-sm font-medium pb-1 border-b-2 transition-colors"
                style={{
                  color: selectedCategory === category.id ? primaryColor : secondaryTextColor,
                  borderColor: selectedCategory === category.id ? primaryColor : 'transparent',
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de productos - diseño minimalista */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-1">
          {filteredProducts.map((product) => {
            const minPrice =
              product.variations.length > 0
                ? Math.min(...product.variations.map((v) => v.price))
                : 0;

            return (
              <div
                key={product.id}
                className="group cursor-pointer py-6 border-b transition-colors hover:bg-gray-50/50"
                onClick={() => setSelectedProduct(product)}
                style={{
                  borderColor: primaryTextColor + '10',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base font-medium mb-1"
                      style={{
                        color: primaryTextColor,
                        fontFamily: theme.primary_font || 'Inter',
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p
                        className="text-sm mb-2 line-clamp-2"
                        style={{ color: secondaryTextColor }}
                      >
                        {product.description}
                      </p>
                    )}
                    <span
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(
                        minPrice,
                        restaurant.settings.currency || 'USD'
                      )}
                    </span>
                  </div>
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover flex-shrink-0"
                      style={{ borderRadius: '4px' }}
                    />
                  )}
                  <ChevronRight
                    className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: secondaryTextColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer minimalista */}
      <footer
        className="border-t mt-12"
        style={{
          backgroundColor: menuBackgroundColor,
          borderColor: primaryTextColor + '20',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2" style={{ color: secondaryTextColor }}>
              <MapPin className="w-4 h-4" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-4">
              {restaurant.settings.social_media?.website && (
                <a
                  href={restaurant.settings.social_media.website}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  style={{ color: primaryTextColor }}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

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
