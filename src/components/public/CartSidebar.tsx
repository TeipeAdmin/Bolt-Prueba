import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/Button';
import { getThemeColors } from '../../utils/themeUtils';
import { Restaurant } from '../../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  restaurant: Restaurant;
  tableNumber?: string | null;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout, restaurant, tableNumber }) => {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCart();

  const themeColors = getThemeColors(restaurant?.settings?.theme);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .cart-sidebar {
          background-color: ${themeColors.cardBackground} !important;
          color: ${themeColors.primaryText} !important;
        }

        .cart-item {
          background-color: ${themeColors.background};
          color: ${themeColors.primaryText};
        }
        
        .cart-quantity-btn {
          border: 1px solid #e5e7eb;
          background-color: ${themeColors.cardBackground};
          color: ${themeColors.primaryText};
          transition: all 0.3s ease;
        }
        
        .cart-quantity-btn:hover {
          background-color: ${themeColors.primary};
          color: white;
          border-color: ${themeColors.primary};
        }
        
        .cart-checkout-btn {
          background-color: ${themeColors.primary};
          color: white;
          border: none;
          transition: all 0.3s ease;
        }
        
        .cart-checkout-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .cart-price-text {
          color: ${themeColors.primary} !important;
        }
        
        .cart-total-price {
          color: ${themeColors.primaryText} !important;
          font-weight: 700;
        }

        .cart-secondary-text {
          color: ${themeColors.secondaryText} !important;
        }
      `}</style>
      
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="cart-sidebar fixed right-0 top-0 h-full w-96 shadow-xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: themeColors.primaryText }} />
              <h2 className="text-lg font-semibold" style={{ color: themeColors.primaryText }}>
                {tableNumber ? `Mesa ${tableNumber} - ` : ''}Tu Pedido ({getItemCount()})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg" style={{ color: themeColors.primaryText, opacity: 0.7 }}>Tu carrito está vacío</p>
                <p className="text-sm mt-2" style={{ color: themeColors.secondaryText }}>
                  Agrega algunos productos para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variation.id}`} className="cart-item rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: themeColors.text }}>{item.product.name}</h3>
                        <p className="text-sm" style={{ color: themeColors.text, opacity: 0.7 }}>{item.variation.name}</p>
                        {/* Show selected optional ingredients */}
                        {item.selected_ingredients && item.product.ingredients && (
                          <div className="text-xs mt-1" style={{ color: themeColors.text, opacity: 0.6 }}>
                            {item.product.ingredients
                              .filter(ing => ing.optional && item.selected_ingredients.includes(ing.id))
                              .map(ing => (
                                <span key={ing.id} className="inline-block mr-2">
                                  +{ing.name} (+${(ing.extra_cost || 0).toFixed(2)})
                                </span>
                              ))
                            }
                          </div>
                        )}
                        {item.special_notes && (
                          <p className="text-xs mt-1 italic" style={{ color: themeColors.text, opacity: 0.6 }}>
                            Nota: {item.special_notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.variation.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variation.id, Math.max(0, item.quantity - 1))}
                          className="cart-quantity-btn w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center" style={{ color: themeColors.text }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variation.id, item.quantity + 1)}
                          className="cart-quantity-btn w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        {/* Calculate item total with extras */}
                        {(() => {
                          let extraCost = 0;
                          if (item.selected_ingredients && item.product.ingredients) {
                            extraCost = item.product.ingredients
                              .filter(ing => ing.optional && item.selected_ingredients.includes(ing.id))
                              .reduce((sum, ing) => sum + (ing.extra_cost || 0), 0);
                          }
                          const itemTotal = (item.variation.price + extraCost) * item.quantity;
                          return (
                            <>
                              <p className="cart-price-text font-bold text-lg">
                                ${itemTotal.toFixed(2)}
                              </p>
                              <p className="text-sm" style={{ color: themeColors.text, opacity: 0.6 }}>
                                ${(item.variation.price + extraCost).toFixed(2)} c/u
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold" style={{ color: themeColors.text }}>Total:</span>
                <span className="cart-total-price text-2xl">
                  ${getTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="cart-checkout-btn w-full py-3 text-lg font-semibold rounded-lg"
              >
                Proceder al Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};