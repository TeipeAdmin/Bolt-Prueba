import React, { useState } from 'react';
import { X, MapPin, Store, Home, CheckCircle, Clock, Phone } from 'lucide-react';
import { Restaurant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { loadFromStorage, saveToStorage } from '../../data/mockData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

type DeliveryMode = 'pickup' | 'dine-in' | 'delivery';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, restaurant }) => {
  const { items, getTotal, clearCart } = useCart();
  const [step, setStep] = useState<'delivery' | 'info' | 'confirm' | 'success'>('delivery');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '+57',
    email: '',
    address: '',
    city: '',
    notes: ''
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const theme = restaurant.settings.theme;
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';

  const handleDeliverySelect = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    setStep('info');
  };

  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Por favor completa tu nombre y teléfono');
      return false;
    }

    if (deliveryMode === 'delivery' && (!customerInfo.address || !customerInfo.city)) {
      alert('Por favor completa la dirección de entrega');
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;
    setStep('confirm');
  };

  const handleConfirmOrder = async () => {
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrder = {
      id: `ord-${Date.now()}`,
      restaurant_id: restaurant.id,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_email: customerInfo.email,
      delivery_mode: deliveryMode,
      delivery_address: deliveryMode === 'delivery' ? `${customerInfo.address}, ${customerInfo.city}` : null,
      items: items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        variation_id: item.variation.id,
        variation_name: item.variation.name,
        quantity: item.quantity,
        price: item.variation.price,
        special_notes: item.special_notes,
        selected_ingredients: item.selected_ingredients
      })),
      notes: customerInfo.notes,
      total: getTotal(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const orders = loadFromStorage('orders', []);
    orders.push(newOrder);
    saveToStorage('orders', orders);

    setOrderNumber(newOrder.id);
    clearCart();
    setLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    setStep('delivery');
    setDeliveryMode('pickup');
    setCustomerInfo({
      name: '',
      phone: '+57',
      email: '',
      address: '',
      city: '',
      notes: ''
    });
    setOrderNumber('');
    onClose();
  };

  const getDeliveryModeLabel = () => {
    switch (deliveryMode) {
      case 'pickup':
        return 'Retiro en Tienda';
      case 'dine-in':
        return 'Consumir en Restaurante';
      case 'delivery':
        return 'Entrega a Domicilio';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.25rem',
          backgroundColor: cardBackgroundColor
        }}
      >
        <div className="p-6">
          {step !== 'success' && (
            <div className="flex justify-between items-start mb-6">
              <h2
                className="font-bold"
                style={{
                  fontSize: 'var(--font-size-title)',
                  fontFamily: 'var(--secondary-font)',
                  color: primaryTextColor
                }}
              >
                Finalizar Pedido
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* STEP 1: DELIVERY MODE */}
          {step === 'delivery' && (
            <div>
              <p className="mb-6" style={{ fontSize: 'var(--font-size-normal)', color: secondaryTextColor }}>
                Selecciona cómo deseas recibir tu pedido
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleDeliverySelect('pickup')}
                  className="w-full p-6 border-2 rounded-lg text-left hover:border-current transition-all"
                  style={{
                    borderColor: 'var(--secondary-color)',
                    borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold mb-1"
                        style={{ fontSize: 'var(--font-size-subtitle)' }}
                      >
                        Retiro en Tienda
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-small)', color: secondaryTextColor }}>
                        Recoge tu pedido en {restaurant.name}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeliverySelect('dine-in')}
                  className="w-full p-6 border-2 rounded-lg text-left hover:border-current transition-all"
                  style={{
                    borderColor: 'var(--secondary-color)',
                    borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold mb-1"
                        style={{ fontSize: 'var(--font-size-subtitle)' }}
                      >
                        Consumir en Restaurante
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-small)', color: secondaryTextColor }}>
                        Disfruta tu pedido en nuestras instalaciones
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeliverySelect('delivery')}
                  className="w-full p-6 border-2 rounded-lg text-left hover:border-current transition-all"
                  style={{
                    borderColor: 'var(--secondary-color)',
                    borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold mb-1"
                        style={{ fontSize: 'var(--font-size-subtitle)' }}
                      >
                        Entrega a Domicilio
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-small)', color: secondaryTextColor }}>
                        Te llevamos tu pedido a donde estés
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMER INFO */}
          {step === 'info' && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-3"
                style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {deliveryMode === 'pickup' && <Store className="w-5 h-5 text-white" />}
                  {deliveryMode === 'dine-in' && <MapPin className="w-5 h-5 text-white" />}
                  {deliveryMode === 'delivery' && <Home className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="text-sm" style={{ color: secondaryTextColor }}>Modalidad seleccionada</p>
                  <p className="font-semibold" style={{ fontSize: 'var(--font-size-normal)' }}>
                    {getDeliveryModeLabel()}
                  </p>
                </div>
                <button
                  onClick={() => setStep('delivery')}
                  className="ml-auto text-sm underline"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Cambiar
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2" style={{ fontSize: 'var(--font-size-normal)' }}>
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                    }}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ fontSize: 'var(--font-size-normal)' }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                    }}
                    placeholder="+57 300 123 4567"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2" style={{ fontSize: 'var(--font-size-normal)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                    }}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                {deliveryMode === 'delivery' && (
                  <>
                    <div>
                      <label className="block font-medium mb-2" style={{ fontSize: 'var(--font-size-normal)' }}>
                        Dirección *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          fontSize: 'var(--font-size-normal)',
                          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                        }}
                        placeholder="Calle 123 #45-67"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2" style={{ fontSize: 'var(--font-size-normal)' }}>
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          fontSize: 'var(--font-size-normal)',
                          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                        }}
                        placeholder="Bogotá"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-medium mb-2" style={{ fontSize: 'var(--font-size-normal)' }}>
                    Notas adicionales
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                    }}
                    placeholder="Indicaciones especiales, referencias, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('delivery')}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors"
                  style={{
                    borderColor: 'var(--primary-color)',
                    color: 'var(--primary-color)',
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                >
                  Atrás
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <h3 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-subtitle)' }}>
                  Resumen del Pedido
                </h3>

                <div className="space-y-3 mb-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg"
                      style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm" style={{ color: secondaryTextColor }}>{item.variation.name} x {item.quantity}</p>
                        {item.special_notes && (
                          <p className="text-xs text-gray-500 italic mt-1">Nota: {item.special_notes}</p>
                        )}
                      </div>
                      <p className="font-semibold" style={{ color: 'var(--accent-color)' }}>
                        ${(item.variation.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span style={{ color: 'var(--accent-color)' }}>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg"
                style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
              >
                <h4 className="font-semibold mb-3" style={{ fontSize: 'var(--font-size-normal)' }}>
                  Información de Entrega
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Modalidad:</strong> {getDeliveryModeLabel()}</p>
                  <p><strong>Nombre:</strong> {customerInfo.name}</p>
                  <p><strong>Teléfono:</strong> {customerInfo.phone}</p>
                  {customerInfo.email && <p><strong>Email:</strong> {customerInfo.email}</p>}
                  {deliveryMode === 'delivery' && (
                    <p><strong>Dirección:</strong> {customerInfo.address}, {customerInfo.city}</p>
                  )}
                  {customerInfo.notes && <p><strong>Notas:</strong> {customerInfo.notes}</p>}
                </div>
                <button
                  onClick={() => setStep('info')}
                  className="mt-3 text-sm underline"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Editar información
                </button>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full px-6 py-4 text-white font-bold rounded-lg transition-all text-lg disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                {loading ? 'Procesando...' : `Confirmar Pedido - $${getTotal().toFixed(2)}`}
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: 'var(--font-size-title)',
                  fontFamily: 'var(--secondary-font)'
                }}
              >
                ¡Pedido Confirmado!
              </h2>

              <p className="text-gray-600 mb-4" style={{ fontSize: 'var(--font-size-normal)' }}>
                Tu pedido ha sido recibido exitosamente
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6"
                style={{ borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem' }}
              >
                <p className="text-sm mb-2" style={{ color: secondaryTextColor }}>Número de pedido</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                  #{orderNumber}
                </p>
              </div>

              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg"
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
                >
                  <Clock className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <p className="font-medium">Estado: Recibido</p>
                    <p className="text-sm" style={{ color: secondaryTextColor }}>Tu pedido está siendo preparado</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                  style={{ borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem' }}
                >
                  <Phone className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Contacto</p>
                    <p className="text-sm text-gray-600">
                      Te contactaremos al {customerInfo.phone}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-6 py-3 text-white font-semibold rounded-lg"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
