import React, { useState } from 'react';
import { X, MapPin, Store, Home, CheckCircle, Clock, Phone, AlertCircle } from 'lucide-react';
import { Restaurant } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/currencyUtils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

type DeliveryMode = 'pickup' | 'dine-in' | 'delivery';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, restaurant }) => {
  const { items, getTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const currency = restaurant?.settings?.currency || 'USD';
  const [step, setStep] = useState<'delivery' | 'info' | 'confirm' | 'success'>('delivery');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
    tableNumber: ''
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phone: '',
    email: ''
  });

  if (!isOpen) return null;

  const theme = restaurant.settings.theme;
  const cardBackgroundColor = theme.card_background_color || '#f9fafb';
  const primaryTextColor = theme.primary_text_color || '#111827';
  const secondaryTextColor = theme.secondary_text_color || '#6b7280';
  const primaryColor = theme?.primary_color || '#FFC700';
  const secondaryColor = theme.secondary_color || '#f3f4f6';

  const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    const parts = cleaned.match(/^\+(\d{1,3})(\d*)$/);
    if (parts) {
      const countryCode = parts[1];
      const number = parts[2];

      if (number) {
        return `+${countryCode} ${number}`;
      }
      return `+${countryCode}`;
    }

    return cleaned;
  };

  const validateName = (name: string): string => {
    if (!name || name.trim().length === 0) return '';
    if (name.trim().length < 2) return 'Mínimo 2 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) return 'Solo letras permitidas';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone || phone.trim().length === 0) return '';
    const phoneRegex = /^\+\d{1,3}\s?\d{7,14}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ' '))) {
      return 'Formato: +57 3001234567';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email || email.trim().length === 0) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Email inválido';
    return '';
  };

  const handleNameChange = (value: string) => {
    setCustomerInfo({ ...customerInfo, name: value });
    setValidationErrors({ ...validationErrors, name: validateName(value) });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setCustomerInfo({ ...customerInfo, phone: formatted });
    setValidationErrors({ ...validationErrors, phone: validatePhone(formatted) });
  };

  const handleEmailChange = (value: string) => {
    setCustomerInfo({ ...customerInfo, email: value });
    setValidationErrors({ ...validationErrors, email: validateEmail(value) });
  };

  const calculateDeliveryCost = (total: number): number => {
    if (!restaurant.settings?.delivery?.pricing_tiers) return 0;

    const tiers = restaurant.settings.delivery.pricing_tiers;
    for (const tier of tiers) {
      if (total >= tier.min_order_amount && (tier.max_order_amount === 0 || total <= tier.max_order_amount)) {
        return tier.cost;
      }
    }
    return 0;
  };

  const handleDeliverySelect = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    if (mode === 'delivery') {
      const cost = calculateDeliveryCost(getTotal());
      setDeliveryCost(cost);
    } else {
      setDeliveryCost(0);
    }
    setStep('info');
  };

  const validateForm = () => {
    const nameError = validateName(customerInfo.name);
    const phoneError = validatePhone(customerInfo.phone);
    const emailError = validateEmail(customerInfo.email);

    setValidationErrors({
      name: nameError,
      phone: phoneError,
      email: emailError
    });

    if (!customerInfo.name || customerInfo.name.trim().length < 2) {
      showToast('warning', 'Nombre inválido', 'Por favor ingresa un nombre válido (mínimo 2 caracteres)');
      return false;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(customerInfo.name.trim())) {
      showToast('warning', 'Nombre inválido', 'El nombre solo debe contener letras');
      return false;
    }

    if (!customerInfo.phone || customerInfo.phone.trim().length === 0) {
      showToast('warning', 'Teléfono requerido', 'Por favor ingresa tu número de teléfono');
      return false;
    }

    const phoneRegex = /^\+\d{1,3}\s?\d{7,14}$/;
    if (!phoneRegex.test(customerInfo.phone.replace(/\s+/g, ' '))) {
      showToast('warning', 'Teléfono inválido', 'Por favor ingresa un teléfono válido con código de país (Ej: +57 3001234567)');
      return false;
    }

    if (customerInfo.email && customerInfo.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerInfo.email.trim())) {
        showToast('warning', 'Email inválido', 'Por favor ingresa un email válido');
        return false;
      }
    }

    if (deliveryMode === 'delivery' && (!customerInfo.address || !customerInfo.city)) {
      showToast('warning', 'Dirección incompleta', 'Por favor completa la dirección de entrega');
      return false;
    }

    if (deliveryMode === 'dine-in' && !customerInfo.tableNumber) {
      showToast('warning', 'Número de mesa requerido', 'Por favor ingresa el número de mesa');
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;
    setStep('confirm');
  };

  const sendWhatsAppMessage = (order: any) => {
    const phone = restaurant.phone?.replace(/[^0-9]/g, '') || '';
    if (!phone) {
      console.warn('No restaurant phone number configured');
      return;
    }

    const deliveryModeText = deliveryMode === 'pickup' ? 'Retiro en Tienda' :
                            deliveryMode === 'dine-in' ? 'Consumir en Restaurante' :
                            'Entrega a Domicilio';

    let message = `*NUEVO PEDIDO - ${restaurant.name}*\n\n`;
    message += `*Pedido:* #${order.id}\n`;
    message += `*Fecha:* ${new Date().toLocaleString()}\n`;
    message += `*Modalidad:* ${deliveryModeText}\n\n`;

    message += `*DATOS DEL CLIENTE*\n`;
    message += `Nombre: ${customerInfo.name}\n`;
    message += `Teléfono: ${customerInfo.phone}\n`;
    if (customerInfo.email) message += `Email: ${customerInfo.email}\n`;

    if (deliveryMode === 'delivery') {
      message += `Dirección: ${customerInfo.address}, ${customerInfo.city}\n`;
    } else if (deliveryMode === 'dine-in') {
      message += `Mesa: ${customerInfo.tableNumber}\n`;
    }
    message += `\n`;

    message += `*PRODUCTOS*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   ${item.variation.name} x${item.quantity}\n`;
      message += `   ${formatCurrency(item.variation.price * item.quantity, currency)}\n`;
      if (item.special_notes) {
        message += `   📝 Nota: ${item.special_notes}\n`;
      }
    });
    message += `\n`;

    message += `*TOTAL*\n`;
    message += `Subtotal: ${formatCurrency(getTotal(), currency)}\n`;
    if (deliveryMode === 'delivery' && deliveryCost > 0) {
      message += `Envío: ${formatCurrency(deliveryCost, currency)}\n`;
    }
    message += `*Total: ${formatCurrency(order.total, currency)}*\n`;

    if (customerInfo.notes) {
      message += `\n📌 *Notas adicionales:*\n${customerInfo.notes}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
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
      table_number: deliveryMode === 'dine-in' ? customerInfo.tableNumber : undefined,
      delivery_cost: deliveryMode === 'delivery' ? deliveryCost : 0,
      total: getTotal() + (deliveryMode === 'delivery' ? deliveryCost : 0),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const orders = loadFromStorage('orders', []);
    orders.push(newOrder);
    saveToStorage('orders', orders);

    sendWhatsAppMessage(newOrder);

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
      notes: '',
      tableNumber: ''
    });
    setOrderNumber('');
    setDeliveryCost(0);
    setValidationErrors({
      name: '',
      phone: '',
      email: ''
    });
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
        className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: theme.button_style === 'rounded' ? '1rem' : '0.25rem',
          backgroundColor: cardBackgroundColor,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="p-6">
          {step !== 'success' && (
          <div className="relative flex items-center justify-center">
            <h2
              className="font-bold text-center"
              style={{
                fontSize: '22px',
                fontFamily: 'var(--secondary-font)',
                color: primaryTextColor
              }}
            >
              Finalizar Pedido
            </h2>
            <button
              onClick={handleClose}
              className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors"
              style={{ color: primaryTextColor }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          )}

          {/* STEP 1: DELIVERY MODE */}
          {step === 'delivery' && (
            <div>
            <p
              className="text-center mb-4"
              style={{
                fontSize: 'var(--font-size-normal)',
                color: secondaryTextColor
              }}
            >
              Selecciona cómo deseas recibir tu pedido
            </p>
            <div
              className="mb-6 p-4 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: `${primaryColor}15`,
                border: `1px solid ${primaryColor}30`,
                borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
              }}
            >
              <Clock className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: primaryTextColor }}>
                  Tiempo de preparación estimado
                </p>
                <p className="text-sm" style={{ color: secondaryTextColor }}>
                  {restaurant.settings.preparation_time || '30-45 minutos'}
                </p>
              </div>
            </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleDeliverySelect('pickup')}
                  className="w-full p-6 border-2 rounded-lg text-left hover:border-current transition-all"
                  style={{
                    borderColor: primaryColor,
                    borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      <Store className="w-6 h-6" style={{ color: secondaryTextColor }}  />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-semibold mb-1"
                        style={{
                          fontSize: 'var(--font-size-subtitle)',
                          color: primaryTextColor
                        }}
                      >
                        Retiro en Tienda
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-small)', color: secondaryTextColor }}>
                        Recoge tu pedido en {restaurant.name}
                      </p>
                    </div>
                  </div>
                </button>

                {restaurant.settings?.table_orders?.enabled && (
                  <button
                    onClick={() => handleDeliverySelect('dine-in')}
                    className="w-full p-6 border-2 rounded-lg text-left hover:border-current transition-all"
                    style={{
                      borderColor: primaryColor,
                      borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        <MapPin className="w-6 h-6" style={{ color: secondaryTextColor }} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                            style={{
                              fontSize: 'var(--font-size-subtitle)',
                              color: primaryTextColor
                            }}
                        >
                          Consumir en Restaurante
                        </h3>
                        <p style={{ fontSize: 'var(--font-size-small)', color: secondaryTextColor }}>
                          Disfruta tu pedido en nuestras instalaciones
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {restaurant.settings?.delivery?.enabled && (
                  <button
                    onClick={() => handleDeliverySelect('delivery')}
                    className="w-full p-6 border-2 rounded-lg text-left hover:border-current transition-all"
                    style={{
                      borderColor: primaryColor,
                      borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        <Home className="w-6 h-6" style={{ color: secondaryTextColor }}  />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                            style={{
                              fontSize: 'var(--font-size-subtitle)',
                              color: primaryTextColor
                            }}
                        >
                          Entrega a Domicilio
                        </h3>
                        <p style={{ fontSize: 'var(--font-size-small)', color: secondaryTextColor }}>
                          Te llevamos tu pedido a donde estés
                        </p>
                        {restaurant.settings?.delivery?.pricing_tiers && restaurant.settings.delivery.pricing_tiers.length > 0 && (
                          <p style={{ fontSize: 'var(--font-size-small)', color: primaryColor, marginTop: '0.25rem' }}>
                            Costo: {formatCurrency(calculateDeliveryCost(getTotal()), currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMER INFO */}
          {step === 'info' && (
            <div>
              <div
                className="mb-4 p-4 mt-6 rounded-lg flex items-center gap-3"
                style={{
                  border: `2px solid ${primaryColor}`,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {deliveryMode === 'pickup' && <Store className="w-6 h-6" style={{ color: secondaryTextColor }}  />}
                  {deliveryMode === 'dine-in' && <MapPin className="w-6 h-6" style={{ color: secondaryTextColor }}  />}
                  {deliveryMode === 'delivery' && <Home className="w-6 h-6" style={{ color: secondaryTextColor }}  />}
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
                  <label
                    className="block font-medium mb-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      color: primaryTextColor
                    }}
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderColor: validationErrors.name ? '#ef4444' : primaryColor,
                      backgroundColor: 'transparent',
                      color: primaryTextColor,
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                      caretColor: primaryColor
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = validationErrors.name ? '#ef4444' : primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${validationErrors.name ? '#ef4444' : primaryColor}80`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = validationErrors.name ? '#ef4444' : primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${validationErrors.name ? '#ef4444' : primaryColor}40`;
                    }}
                    placeholder="Juan Pérez"
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-2"
                      style={{
                      fontSize: 'var(--font-size-normal)',
                      color: primaryTextColor
                    }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderColor: validationErrors.phone ? '#ef4444' : primaryColor,
                      backgroundColor: 'transparent',
                      color: primaryTextColor,
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                      caretColor: primaryColor
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = validationErrors.phone ? '#ef4444' : primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${validationErrors.phone ? '#ef4444' : primaryColor}80`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = validationErrors.phone ? '#ef4444' : primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${validationErrors.phone ? '#ef4444' : primaryColor}40`;
                    }}
                    placeholder="+57 3001234567"
                    required
                  />
                  {validationErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      color: primaryTextColor
                    }}
                    >
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderColor: validationErrors.email ? '#ef4444' : primaryColor,
                      backgroundColor: 'transparent',
                      color: primaryTextColor,
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                      caretColor: primaryColor
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = validationErrors.email ? '#ef4444' : primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${validationErrors.email ? '#ef4444' : primaryColor}80`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = validationErrors.email ? '#ef4444' : primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${validationErrors.email ? '#ef4444' : primaryColor}40`;
                    }}
                    placeholder="correo@ejemplo.com"
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {deliveryMode === 'dine-in' && (
                  <div>
                    <label className="block font-medium mb-2"
                      style={{
                        fontSize: 'var(--font-size-normal)',
                        color: primaryTextColor
                      }}
                      >
                      Número de Mesa *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.tableNumber}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        fontSize: 'var(--font-size-normal)',
                        borderColor: primaryColor,
                        backgroundColor: 'transparent',
                        color: primaryTextColor,
                        borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                        caretColor: primaryColor
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 1px ${primaryColor}80`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 1px ${primaryColor}40`;
                      }}
                      placeholder="Ej: 5"
                      required
                    />
                  </div>
                )}

                {deliveryMode === 'delivery' && (
                  <>
                    <div>
                      <label className="block font-medium mb-2" 
                        style={{
                          fontSize: 'var(--font-size-normal)',
                          color: primaryTextColor
                        }}
                        >
                        Dirección *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          fontSize: 'var(--font-size-normal)',
                          borderColor: primaryColor,
                          backgroundColor: 'transparent',
                          color: primaryTextColor,
                          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                          caretColor: primaryColor
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 1px ${primaryColor}80`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 1px ${primaryColor}40`;
                        }}
                        placeholder="Calle 123 #45-67"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2" 
                        style={{
                          fontSize: 'var(--font-size-normal)',
                          color: primaryTextColor
                        }}
                        >
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          fontSize: 'var(--font-size-normal)',
                          borderColor: primaryColor,
                          backgroundColor: 'transparent',
                          color: primaryTextColor,
                          borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                          caretColor: primaryColor
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 1px ${primaryColor}80`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 1px ${primaryColor}40`;
                        }}
                        placeholder="Bogotá"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-medium mb-2" 
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      color: primaryTextColor
                    }}
                    >
                    Notas adicionales
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      fontSize: 'var(--font-size-normal)',
                      borderColor: primaryColor,
                      backgroundColor: 'transparent',
                      color: primaryTextColor,
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                      caretColor: primaryColor
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${primaryColor}80`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = primaryColor;
                      e.target.style.boxShadow = `0 0 0 1px ${primaryColor}40`;
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
                    color: secondaryTextColor,
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
                            <div
                className="mb-4 p-4 mt-6 rounded-lg flex items-center gap-3"
                style={{
                  border: `2px solid ${primaryColor}`,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {deliveryMode === 'pickup' && <Store className="w-6 h-6" style={{ color: secondaryTextColor }}  />}
                  {deliveryMode === 'dine-in' && <MapPin className="w-6 h-6" style={{ color: secondaryTextColor }}  />}
                  {deliveryMode === 'delivery' && <Home className="w-6 h-6" style={{ color: secondaryTextColor }}  />}
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
              <div
                className="mb-4 p-4 rounded-lg flex items-start gap-3"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  border: `1px solid ${primaryColor}30`,
                  borderRadius: theme.button_style === 'rounded' ? '0.75rem' : '0.25rem'
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: primaryTextColor }}>
                    Revisa tu pedido
                  </p>
                  <p className="text-xs" style={{ color: secondaryTextColor }}>
                    Verifica que toda la información sea correcta antes de confirmar
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3
                  className="font-semibold mb-4"
                  style={{
                    fontSize: 'var(--font-size-subtitle)',
                    color: primaryTextColor
                  }}
                >
                  Resumen del Pedido
                </h3>

                <div className="space-y-3 mb-4">
                  {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-3 rounded-lg"
                    style={{
                      borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                      border: `1px solid ${primaryColor}`,
                      backgroundColor: 'transparent'
                    }}
                  >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm" style={{ color: secondaryTextColor }}>{item.variation.name} x {item.quantity}</p>
                        {item.special_notes && (
                          <p className="text-xs text-gray-500 italic mt-1">Nota: {item.special_notes}</p>
                        )}
                      </div>
                      <p className="font-semibold" style={{ color: 'var(--accent-color)' }}>
                        {formatCurrency(item.variation.price * item.quantity, currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2" style={{ borderColor: primaryColor }}>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(getTotal(), currency)}</span>
                  </div>
                  {deliveryMode === 'delivery' && deliveryCost > 0 && (
                    <div className="flex justify-between">
                      <span>Costo de Envío:</span>
                      <span>{formatCurrency(deliveryCost, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t pt-2" style={{ borderColor: primaryColor }}>
                    <span>Total:</span>
                    <span style={{ color: 'var(--accent-color)' }}>{formatCurrency(getTotal() + (deliveryMode === 'delivery' ? deliveryCost : 0), currency)}</span>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem',
                  border: `1px solid ${primaryColor}`,
                  backgroundColor: 'transparent'
                }}
              >
                <h4
                  className="font-semibold mb-3"
                  style={{
                    fontSize: 'var(--font-size-normal)',
                    color: primaryTextColor
                  }}
                >
                  Información de Entrega
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Modalidad:</strong> {getDeliveryModeLabel()}</p>
                  <p><strong>Nombre:</strong> {customerInfo.name}</p>
                  <p><strong>Teléfono:</strong> {customerInfo.phone}</p>
                  {customerInfo.email && <p><strong>Email:</strong> {customerInfo.email}</p>}
                  {deliveryMode === 'dine-in' && customerInfo.tableNumber && (
                    <p><strong>Mesa:</strong> {customerInfo.tableNumber}</p>
                  )}
                  {deliveryMode === 'delivery' && (
                    <p><strong>Dirección:</strong> {customerInfo.address}, {customerInfo.city}</p>
                  )}
                  {customerInfo.notes && <p><strong>Notas:</strong> {customerInfo.notes}</p>}
                </div>
              </div>
                 <button
                  onClick={() => setStep('info')}
                  className="mb-6 mt-3 text-sm underline"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Editar información
                </button>

              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full px-6 py-4 text-white font-bold rounded-lg transition-all text-lg disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: secondaryTextColor,
                  borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                }}
              >
                {loading ? 'Procesando...' : `Confirmar Pedido - ${formatCurrency(getTotal() + (deliveryMode === 'delivery' ? deliveryCost : 0), currency)}`}
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
              <CheckCircle className="w-12 h-12" style={{ color: primaryColor }} />
              </div>

              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: 'var(--font-size-title)',
                  fontFamily: 'var(--secondary-font)',
                  color: primaryTextColor
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
                <div
                  className="flex items-center gap-3 p-4 rounded-lg"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    border: `1px solid ${primaryColor}30`,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Clock className="w-5 h-5" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: primaryTextColor }}>Estado: Recibido</p>
                    <p className="text-sm" style={{ color: secondaryTextColor }}>Tu pedido está siendo preparado</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-4 rounded-lg"
                  style={{
                    backgroundColor: `${secondaryColor}`,
                    border: `1px solid ${primaryColor}20`,
                    borderRadius: theme.button_style === 'rounded' ? '0.5rem' : '0.25rem'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone className="w-5 h-5" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: primaryTextColor }}>Contacto</p>
                    <p className="text-sm" style={{ color: secondaryTextColor }}>
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
