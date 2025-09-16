import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Product, ProductVariation, Restaurant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getThemeColors } from '../../utils/themeUtils';
import { getCurrencySymbol } from '../../utils/currencyUtils';

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

  const themeColors = getThemeColors(restaurant?.settings?.theme);
  const currencySymbol = getCurrencySymbol(restaurant?.settings?.currency || 'USD');

  return (
    <div className="max-w-2xl mx-auto modal-content" style={{ 
      backgroundColor: themeColors.background, 
      color: themeColors.text 
    }}>
      <style>{`
        .modal-content {
          background-color: ${themeColors.background} !important;
          color: ${themeColors.text} !important;
        }
        
        .variation-btn {
          border: 1px solid #e5e7eb;
          background-color: ${themeColors.background};
          color: ${themeColors.text};
          transition: all 0.3s ease;
        }
        
        .variation-btn.selected {
          border-color: ${themeColors.primary};
          background-color: ${themeColors.primary};
          color: white;
        }
        
        .variation-btn:hover:not(.selected) {
          border-color: ${themeColors.primary};
          background-color: ${themeColors.primary};
          color: white;
        }
        
        .quantity-btn {
          border: 1px solid #e5e7eb;
          background-color: ${themeColors.background};
          color: ${themeColors.text};
          transition: all 0.3s ease;
        }
        
        .quantity-btn:hover {
          background-color: ${themeColors.primary};
          color: white;
          border-color: ${themeColors.primary};
        }
        
        .add-to-cart-btn {
          background-color: ${themeColors.primary};
          color: white;
          border: none;
          transition: all 0.3s ease;
        }
        
        .add-to-cart-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .price-text {
          color: ${themeColors.primary} !important;
        }
        
        textarea, input[type="checkbox"] {
          border-color: #e5e7eb;
          background-color: ${themeColors.background};
          color: ${themeColors.text};
        }
        
        textarea:focus {
          border-color: ${themeColors.primary};
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
      `}</style>
      
      <div className="product-detail-modal">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Image */}
        {product.images.length > 0 && (
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        <p className="mb-6" style={{ color: themeColors.text }}>{product.description}</p>

        {/* Dietary Restrictions and Spice Level */}
        <div className="flex flex-wrap gap-2 mb-6">
          {product.dietary_restrictions.map(restriction => (
            <Badge key={restriction} variant="success">
              {restriction}
            </Badge>
          ))}
          {product.spice_level > 0 && (
            <Badge variant="warning">
              🌶️ Picante {product.spice_level}
            </Badge>
          )}
        </div>

        {/* Variations */}
        {product.variations.length > 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.text }}>Tamaño / Variación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variations.map(variation => (
                <button
                  key={variation.id}
                  onClick={() => setSelectedVariation(variation)}
                  className={`variation-btn p-3 rounded-lg text-left ${
                    selectedVariation.id === variation.id ? 'selected' : ''
                  }`}
                >
                  <div className="font-medium">{variation.name}</div>
                  <div className="price-text font-bold">{currencySymbol}{variation.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {product.ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.text }}>Ingredientes</h3>
            <div className="space-y-2">
              {product.ingredients.map(ingredient => (
                <label key={ingredient.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIngredients.includes(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      disabled={!ingredient.optional}
                      className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={ingredient.optional ? '' : 'text-gray-500'}>
                      {ingredient.name}
                      {!ingredient.optional && ' (incluido)'}
                    </span>
                  </div>
                  {ingredient.optional && ingredient.extra_cost && (
                    <span className="text-sm font-medium price-text">
                      +{currencySymbol}{ingredient.extra_cost.toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Special Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
            Notas especiales (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Alguna indicación especial para la cocina..."
          />
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: themeColors.text }}>Cantidad:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="quantity-btn w-8 h-8 rounded-full flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold w-8 text-center" style={{ color: themeColors.text }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="quantity-btn w-8 h-8 rounded-full flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn flex-1 max-w-xs px-6 py-3 rounded-lg font-medium"
          >
            Agregar al carrito - {currencySymbol}{calculatePrice().toFixed(2)}
          </button>
        </div>

        {/* Preparation Time */}
        {product.preparation_time && (
          <p className="text-sm text-center mt-4" style={{ color: themeColors.text, opacity: 0.7 }}>
            ⏱️ Tiempo estimado: {product.preparation_time}
          </p>
        )}
      </div>
    </div>
  );
};