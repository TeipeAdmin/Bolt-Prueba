import React, { useState } from 'react';
import { X, MapPin, User, Phone, MessageSquare } from 'lucide-react';
import { Restaurant, Order, Customer } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  tableNumber?: string | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  tableNumber,
}) => {
  const { items, getTotal, clearCart } = useCart();
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'table'>(
    'pickup'
  );
  const [selectedTable, setSelectedTable] = useState<string>(tableNumber || '');
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phone: '',
    email: '',
    address: '',
    delivery_instructions: '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  const deliveryCost = orderType === 'delivery' && restaurant.settings?.delivery?.zones?.length > 0
    ? restaurant.settings.delivery.delivery_cost || 0
    : 0;

  const total = getTotal() + deliveryCost;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customer.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!customer.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^[\d+\-\s()]+$/.test(customer.phone.trim())) {
      newErrors.phone = 'El teléfono solo puede contener números y caracteres de formato';
    }

    if (orderType === 'delivery') {
      if (!customer.address?.trim()) {
        newErrors.address = 'La dirección es obligatoria para delivery';
      }
    }

    if (orderType === 'table') {
      if (!selectedTable.trim()) {
        newErrors.table = 'Selecciona un número de mesa';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateOrderNumber = () => {
    const orders = loadFromStorage('orders') || [];
    const restaurantOrders = orders.filter((order: any) => order.restaurant_id === restaurant.id);
    
    // Find the highest order number for this restaurant (format: #RES-XXXX)
    let maxNumber = 1000;
    restaurantOrders.forEach((order: any) => {
      // Extract number from format #RES-XXXX
      const match = order.order_number.match(/#RES-(\d+)/);
      if (match) {
        const orderNum = parseInt(match[1]);
        if (!isNaN(orderNum) && orderNum > maxNumber) {
          maxNumber = orderNum;
        }
      }
    });
    
    return `#RES-${maxNumber + 1}`;
  };

  const generateWhatsAppMessage = (order: Order) => {
    const restaurantName = restaurant.name;
    const orderNumber = order.order_number;
    const orderDate = new Date(order.created_at).toLocaleString();
    
    let message = `*NUEVO PEDIDO - ${restaurantName}*\n`;
    message += `*Fecha:* ${orderDate}\n`;
    message += `*Pedido:* ${orderNumber}\n\n`;
    
    message += `*CLIENTE:*\n`;
    message += `- *Nombre:* ${order.customer.name}\n`;
    message += `- *Telefono:* ${order.customer.phone}\n`;
    if (order.customer.email) {
      message += `- *Email:* ${order.customer.email}\n`;
    }
    message += `\n`;
    
    message += `*TIPO DE ENTREGA:* ${order.order_type === 'delivery' ? 'Delivery' : 'Recoger en restaurante'}\n`;
    if (order.order_type === 'delivery' && order.delivery_address) {
      message += `*Direccion:* ${order.delivery_address}\n`;
      if (order.customer.delivery_instructions) {
        message += `*Referencias:* ${order.customer.delivery_instructions}\n`;
      }
    } else if (order.order_type === 'table' && order.table_number) {
      message += `*Mesa:* ${order.table_number}\n`;
    }
    message += `\n`;
    
    message += `*PRODUCTOS:*\n`;
    order.items.forEach((item, index) => {
      const itemTotal = (item.variation.price * item.quantity).toFixed(2);
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   - *Tamano:* ${item.variation.name}\n`;
      message += `   - *Cantidad:* ${item.quantity}\n`;
      message += `   - *Precio:* $${itemTotal}\n`;
      if (item.special_notes) {
        message += `   - *Nota:* ${item.special_notes}\n`;
      }
      message += `\n`;
    });
    
    message += `*RESUMEN DEL PEDIDO:*\n`;
    message += `- *Subtotal:* $${order.subtotal.toFixed(2)}\n`;
    if (order.delivery_cost && order.delivery_cost > 0) {
      message += `- *Delivery:* $${order.delivery_cost.toFixed(2)}\n`;
    }
    message += `- *TOTAL:* $${order.total.toFixed(2)}\n\n`;
    
    message += `*Tiempo estimado:* ${restaurant.settings?.delivery?.estimated_time || '30-45 minutos'}\n\n`;
    message += `*Gracias por tu pedido!*`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      // Create order
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        restaurant_id: restaurant.id,
        order_number: generateOrderNumber(),
        customer,
        items,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? customer.address : undefined,
        table_number: orderType === 'table' ? selectedTable : undefined,
        delivery_cost: deliveryCost,
        subtotal: getTotal(),
        total,
        status: 'pending',
        estimated_time: restaurant.settings.delivery.estimated_time,
        special_instructions: specialInstructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to storage
      const orders = loadFromStorage('orders') || [];
      saveToStorage('orders', [...orders, newOrder]);

      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(newOrder);
      const whatsappNumber = restaurant.settings?.notifications?.whatsapp;
      
      if (whatsappNumber) {
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
      }

      // Clear cart and show confirmation
      clearCart();
      setOrderConfirmed(newOrder);
      
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ general: 'Error al procesar el pedido. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrderConfirmed(null);
    setCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      delivery_instructions: '',
    });
    setSelectedTable(tableNumber || '');
    setSpecialInstructions('');
    setErrors({});
    onClose();
  };

  if (orderConfirmed) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md" title="¡Pedido Confirmado!">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Tu pedido ha sido enviado!
          </h3>
          <p className="text-gray-600 mb-4">
            Número de pedido: <strong>{orderConfirmed.order_number}</strong>
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Hemos enviado tu pedido por WhatsApp al restaurante. 
            Te contactarán pronto para confirmar.
          </p>
          <Button onClick={handleClose} className="w-full">
            Continuar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Finalizar Pedido">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Type */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipo de Pedido</h3>
          <div className={`grid gap-4 ${restaurant.settings?.table_orders?.enabled ? (restaurant.settings?.delivery?.enabled ? 'grid-cols-3' : 'grid-cols-2') : (restaurant.settings?.delivery?.enabled ? 'grid-cols-2' : 'grid-cols-1')}`}>
            <button
              type="button"
              onClick={() => setOrderType('pickup')}
              className={`p-4 border rounded-lg text-center transition-colors ${
                orderType === 'pickup'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Recoger</div>
              <div className="text-sm text-gray-600">En el restaurante</div>
            </button>
            
            {restaurant.settings?.table_orders?.enabled && (
              <button
                type="button"
                onClick={() => setOrderType('table')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  orderType === 'table'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Pedido en Mesa</div>
                <div className="text-sm text-gray-600">Pedido en mesa</div>
              </button>
            )}
            
            {restaurant.settings?.delivery?.enabled && (
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  orderType === 'delivery'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                } ${getTotal() < restaurant.settings.delivery.min_order_amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={getTotal() < restaurant.settings.delivery.min_order_amount}
              >
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Delivery</div>
                <div className="text-sm text-gray-600">
                  ${deliveryCost.toFixed(2)} • {restaurant.settings.delivery.estimated_time}
                </div>
                {getTotal() < restaurant.settings?.delivery?.min_order_amount && (
                  <div className="text-xs text-red-600 mt-1">
                    Mínimo: ${restaurant.settings?.delivery?.min_order_amount.toFixed(2)}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo*"
              value={customer.name}
              onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              placeholder="Tu nombre"
            />
            <Input
              label="Teléfono*"
              value={customer.phone}
             onChange={(e) => {
               const value = e.target.value.replace(/[^0-9+\-\s()]/g, ''); // Only allow numbers and phone formatting characters
               setCustomer(prev => ({ ...prev, phone: value }));
             }}
              error={errors.phone}
              placeholder="+1 (555) 123-4567"
             helperText="Solo números y caracteres de formato (+, -, espacios, paréntesis)"
            />
          </div>
          <Input
            label="Email (opcional)"
            type="email"
            value={customer.email || ''}
            onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
            placeholder="tu@email.com"
            className="mt-4"
          />
        </div>

        {/* Table Selection */}
        {orderType === 'table' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Seleccionar Mesa</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {Array.from({ length: restaurant.settings?.table_orders?.table_numbers || 10 }, (_, i) => i + 1).map(tableNum => (
                <button
                  key={tableNum}
                  type="button"
                  onClick={() => setSelectedTable(tableNum.toString())}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedTable === tableNum.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Mesa {tableNum}</div>
                </button>
              ))}
            </div>
            {errors.table && (
              <p className="mt-2 text-sm text-red-600">{errors.table}</p>
            )}
          </div>
        )}

        {/* Delivery Address */}
        {orderType === 'delivery' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dirección de Entrega</h3>
            <Input
              label="Dirección Completa*"
              value={customer.address || ''}
              onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
              error={errors.address}
              placeholder="Calle, número, colonia, ciudad"
              className="mb-4"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencias y puntos de ubicación
              </label>
              <textarea
                value={customer.delivery_instructions || ''}
                onChange={(e) => setCustomer(prev => ({ ...prev, delivery_instructions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Casa blanca con portón negro, frente al parque..."
              />
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instrucciones Especiales
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Alguna indicación especial para tu pedido..."
          />
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.product.name} ({item.variation.name}) x{item.quantity}</span>
                <span>${(item.variation.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              {deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>${deliveryCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={submitting}
            className="flex-1"
            disabled={items.length === 0}
          >
            Confirmar Pedido
          </Button>
        </div>
      </form>
    </Modal>
  );
};