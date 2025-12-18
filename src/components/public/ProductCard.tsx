import React from 'react';
import { Store, MapPin, Clock, Flame } from 'lucide-react';
import { Product, Restaurant, Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currencyUtils';

interface ProductCardProps {
  product: Product & { categories?: Category[] };
  restaurant: Restaurant;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, restaurant, onClick }) => {
  const { language } = useLanguage();

  const minPrice = Math.min(...product.variations.map(v => v.price));
  const maxPrice = Math.max(...product.variations.map(v => v.price));
  const hasMultiplePrices = minPrice !== maxPrice;

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';

  const spiceLevelColors = ['text-gray-300', 'text-yellow-400', 'text-orange-500', 'text-red-600'];
  const spiceLevel = product.spice_level || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />

        {product.is_featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            Destacado
          </div>
        )}

        {spiceLevel > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
            {[...Array(3)].map((_, i) => (
              <Flame
                key={i}
                className={`w-3 h-3 ${i < spiceLevel ? spiceLevelColors[spiceLevel] : 'text-gray-300'}`}
                fill="currentColor"
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center gap-1 text-white text-xs">
            <Store className="w-3 h-3" />
            <span className="font-medium truncate">{restaurant.name}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.categories.slice(0, 3).map(category => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </span>
            ))}
            {product.categories.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                +{product.categories.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {hasMultiplePrices && <span className="text-sm font-normal text-gray-500">Desde </span>}
              {formatCurrency(minPrice, restaurant.settings?.currency || 'COP', language)}
            </p>
          </div>

          {product.preparation_time && (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{product.preparation_time}</span>
            </div>
          )}
        </div>

        {product.dietary_restrictions && product.dietary_restrictions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {product.dietary_restrictions.map((restriction, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                >
                  {restriction}
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.address && (
          <div className="mt-3 flex items-start gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};
