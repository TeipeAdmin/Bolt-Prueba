import React, { useState } from 'react';
import { Minus, Plus, X, Clock } from 'lucide-react';
import { Product, ProductVariation, Restaurant } from '../../types';
import { useCart } from '../../contexts/CartContext';

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
  const [notes, setNotes] = useState('');

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
    addItem(product, selectedVariation, quantity, notes);
    onClose();
  };

  const theme = restaurant.settings.theme;
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.25rem',
          backgroundColor: cardBackgroundColor
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2
              className="font-bold"
              style={{
                fontSize: 'var(--font-size-title)',
                fontFamily: 'var(--secondary-font)',
                color: primaryTextColor
              }}
            >
              {product.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {product.images.length > 0 && (
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <p
            className="mb-6"
            style={{
              fontSize: 'var(--font-size-normal)',
              color: secondaryTextColor
            }}
          >
            {product.description}
          </p>

          {product.variations.length > 1 && (
            <div className="mb-6">
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: 'var(--font-size-subtitle)',
                  color: primaryTextColor
                }}
              >
                Selecciona tu opción
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variations.map(variation => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation)}
                    className="p-4 rounded-lg text-left transition-all border-2"
                    style={{
                      borderColor: selectedVariation.id === variation.id ? 'var(--primary-color)' : '#e5e7eb',
                      backgroundColor: selectedVariation.id === variation.id ? 'var(--primary-color)' : 'white',
                      color: selectedVariation.id === variation.id ? 'white' : 'var(--text-color)',
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                    }}
                  >
                    <div className="font-medium" style={{ fontSize: 'var(--font-size-normal)' }}>
                      {variation.name}
                    </div>
                    <div className="font-bold mt-1" style={{ fontSize: 'var(--font-size-subtitle)' }}>
                      ${variation.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.ingredients.length > 0 && (
            <div className="mb-6">
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: 'var(--font-size-subtitle)',
                  color: primaryTextColor
                }}
              >
                Ingredientes
              </h3>
              <div className="space-y-3">
                {product.ingredients.map(ingredient => (
                  <label
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                      opacity: ingredient.optional ? 1 : 0.6
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ingredient.id)}
                        onChange={() => toggleIngredient(ingredient.id)}
                        disabled={!ingredient.optional}
                        className="w-5 h-5 rounded"
                        style={{ accentColor: 'var(--primary-color)' }}
                      />
                      <span style={{ fontSize: 'var(--font-size-normal)' }}>
                        {ingredient.name}
                        {!ingredient.optional && ' (incluido)'}
                      </span>
                    </div>
                    {ingredient.optional && ingredient.extra_cost && (
                      <span
                        className="font-medium"
                        style={{
                          fontSize: 'var(--font-size-small)',
                          color: 'var(--accent-color)'
                        }}
                      >
                        +${ingredient.extra_cost.toFixed(2)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label
              className="block font-medium mb-2"
              style={{
                fontSize: 'var(--font-size-normal)',
                color: primaryTextColor
              }}
            >
              Notas especiales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{
                fontSize: 'var(--font-size-normal)',
                borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
              }}
              placeholder="Ej: Sin cebolla, bien cocido..."
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg"
            style={{
              borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem',
              backgroundColor: theme.secondary_color || '#f3f4f6'
            }}
          >
            <div className="flex items-center gap-4">
              <span className="font-medium" style={{ fontSize: 'var(--font-size-normal)' }}>
                Cantidad:
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{
                    borderColor: 'var(--primary-color)',
                    color: 'var(--primary-color)'
                  }}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span
                  className="text-xl font-bold w-8 text-center"
                  style={{ fontSize: 'var(--font-size-subtitle)' }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{
                    borderColor: 'var(--primary-color)',
                    color: 'var(--primary-color)'
                  }}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 max-w-xs px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              style={{
                backgroundColor: 'var(--primary-color)',
                fontSize: 'var(--font-size-normal)',
                borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
              }}
            >
              Agregar ${calculatePrice().toFixed(2)}
            </button>
          </div>

          {product.preparation_time && (
            <div className="flex items-center justify-center gap-2 mt-4" style={{ color: secondaryTextColor }}>
              <Clock className="w-4 h-4" />
              <span style={{ fontSize: 'var(--font-size-small)' }}>
                Tiempo de preparación: {product.preparation_time} min
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
