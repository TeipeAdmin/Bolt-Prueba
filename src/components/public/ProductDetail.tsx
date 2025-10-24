import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Product, ProductVariation, Restaurant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/currencyUtils';

interface ProductDetailProps {
  product: Product;
  restaurant: Restaurant;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, restaurant, onClose }) => {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(product.variations[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    product.ingredients.filter(ing => !ing.optional).map(ing => ing.id)
  );
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const calculatePrice = () => {
    const basePrice = selectedVariation.price;
    const extraCost = product.ingredients
      .filter(ing => ing.optional && selectedIngredients.includes(ing.id))
      .reduce((sum, ing) => sum + (ing.extra_cost || 0), 0);

    return (basePrice + extraCost) * quantity;
  };

  const handleAddToCart = () => {
    addItem(product, selectedVariation, quantity, '');
    onClose();
  };

  const theme = restaurant.settings.theme;
  const primaryColor = theme.primary_color || '#FFC700';
  const cardBackgroundColor = theme.card_background_color || '#ffffff';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: cardBackgroundColor,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" style={{ color: primaryTextColor }} />
        </button>

        {/* Product Image */}
        {product.images.length > 0 && (
          <div className="relative w-full" style={{ height: '280px' }}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>
          {/* Product Name */}
          <h2
            className="font-bold mb-3 text-center"
            style={{
              fontSize: '28px',
              color: primaryTextColor,
              fontFamily: theme.primary_font || 'Inter'
            }}
          >
            {product.name.split(' ').map((word, i) => (
              <span key={i}>
                {i === 0 ? <span style={{ color: primaryColor }}>{word}</span> : <span>{' ' + word}</span>}
              </span>
            ))}
          </h2>

          {/* Description */}
          <p
            className="text-center mb-6"
            style={{
              fontSize: '14px',
              color: secondaryTextColor,
              lineHeight: '1.6'
            }}
          >
            {product.description}
          </p>

          {/* Variations */}
          {product.variations.length > 0 && (
            <div className="mb-6">
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: '14px',
                  color: primaryTextColor
                }}
              >
                Selecciona una opción
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variations.map(variation => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation)}
                    className="p-4 rounded-lg text-left transition-all border-2"
                    style={{
                      borderColor: selectedVariation.id === variation.id ? primaryColor : '#e5e7eb',
                      backgroundColor: selectedVariation.id === variation.id ? primaryColor : 'transparent',
                      color: selectedVariation.id === variation.id ? '#ffffff' : primaryTextColor,
                      borderRadius: '8px'
                    }}
                  >
                    <div className="font-semibold" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {variation.name}
                    </div>
                    <div className="font-bold" style={{ fontSize: '16px' }}>
                      {formatCurrency(variation.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients.length > 0 && (
            <div className="mb-6">
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: '14px',
                  color: primaryTextColor
                }}
              >
                Ingredientes
              </h3>
              <div className="space-y-2">
                {product.ingredients.map(ingredient => (
                  <label
                    key={ingredient.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: '#e5e7eb',
                      borderRadius: '8px',
                      opacity: ingredient.optional ? 1 : 0.7
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIngredients.includes(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      disabled={!ingredient.optional}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '13px',
                        color: secondaryTextColor
                      }}
                    >
                      {ingredient.name} {!ingredient.optional && '(incluido)'}
                    </span>
                    {ingredient.optional && ingredient.extra_cost && ingredient.extra_cost > 0 && (
                      <span
                        className="font-medium"
                        style={{
                          fontSize: '13px',
                          color: primaryColor
                        }}
                      >
                        +{formatCurrency(ingredient.extra_cost)}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Add Ingredient Link */}
              <button
                className="mt-3 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                + Adicionar ingrediente
              </button>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <span
                className="font-medium"
                style={{
                  fontSize: '14px',
                  color: primaryTextColor
                }}
              >
                Cantidad:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className="font-bold w-8 text-center"
                  style={{
                    fontSize: '18px',
                    color: primaryTextColor
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 px-6 py-3 text-white font-bold rounded-lg transition-all hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              Agregar {formatCurrency(calculatePrice())}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
