import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Clock, CheckCircle, XCircle, Truck, User, Phone, MapPin, Trash2 } from 'lucide-react';
import { Order, Product } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const OrdersManagement: React.FC = () => {
  const { restaurant } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (restaurant) {
      loadOrders();
    }
  }, [restaurant]);

  const loadOrders = () => {
    if (!restaurant) return;

    const allOrders = loadFromStorage('orders') || [];
    const restaurantOrders = allOrders.filter((order: Order) => 
      order.restaurant_id === restaurant.id
    );

    // Sort by creation date (newest first)
    restaurantOrders.sort((a: Order, b: Order) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setOrders(restaurantOrders);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const allOrders = loadFromStorage('orders') || [];
    const updatedOrders = allOrders.map((order: Order) =>
      order.id === orderId 
        ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
        : order
    );

    saveToStorage('orders', updatedOrders);
    loadOrders();
    
    showToast(
      'success',
      'Estado Actualizado',
      `El pedido ha sido marcado como ${getStatusText(newStatus)}.`,
      4000
    );
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
      const allOrders = loadFromStorage('orders') || [];
      const updatedOrders = allOrders.filter((order: Order) => order.id !== orderId);
      
      saveToStorage('orders', updatedOrders);
      loadOrders();
      
      showToast(
        'info',
        'Pedido Eliminado',
        'El pedido ha sido eliminado exitosamente.',
        4000
      );
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: 'pendiente',
      confirmed: 'confirmado',
      preparing: 'en preparación',
      ready: 'listo',
      delivered: 'entregado',
      cancelled: 'cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{t('pending')}</Badge>;
      case 'confirmed':
        return <Badge variant="info">{t('confirmed')}</Badge>;
      case 'preparing':
        return <Badge variant="info">{t('preparing')}</Badge>;
      case 'ready':
        return <Badge variant="success">{t('ready')}</Badge>;
      case 'delivered':
        return <Badge variant="success">{t('delivered')}</Badge>;
      case 'cancelled':
        return <Badge variant="error">{t('cancelled')}</Badge>;
      default:
        return <Badge variant="gray">Unknown</Badge>;
    }
  };

  const getOrderTypeIcon = (orderType: Order['order_type']) => {
    switch (orderType) {
      case 'delivery':
        return <Truck className="w-4 h-4" />;
      case 'pickup':
        return <User className="w-4 h-4" />;
      case 'table':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const canAdvanceStatus = (status: Order['status']) => {
    return getNextStatus(status) !== null;
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('orderManagement')}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('inPreparation')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmados</option>
            <option value="preparing">En Preparación</option>
            <option value="ready">Listos</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? 'No hay pedidos aún' : 'No hay pedidos con este filtro'}
          </h3>
          <p className="text-gray-600">
            {orders.length === 0 
              ? 'Los pedidos aparecerán aquí una vez que los clientes empiecen a ordenar.'
              : 'Intenta con un filtro diferente.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orderNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('total')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {order.customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getOrderTypeIcon(order.order_type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {order.order_type === 'table' ? `Mesa ${order.table_number}` : 
                           order.order_type === 'delivery' ? 'Delivery' : 'Recoger'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          title="Ver detalles"
                        />
                        
                        {canAdvanceStatus(order.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                            className="text-green-600 hover:text-green-700"
                            title={t('nextStep')}
                          />
                        )}
                        
                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={XCircle}
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-700"
                            title="Cancelar pedido"
                          />
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar pedido"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOrder(null);
        }}
        title={`Detalles del Pedido ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('customerInfo')}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nombre</p>
                    <p className="text-sm text-gray-900">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Teléfono</p>
                    <p className="text-sm text-gray-900">{selectedOrder.customer.phone}</p>
                  </div>
                  {selectedOrder.customer.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">{selectedOrder.customer.email}</p>
                    </div>
                  )}
                  {selectedOrder.order_type === 'delivery' && selectedOrder.delivery_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {t('deliveryAddress')}
                      </p>
                      <p className="text-sm text-gray-900">{selectedOrder.delivery_address}</p>
                      {selectedOrder.customer.delivery_instructions && (
                        <p className="text-xs text-gray-600 mt-1">
                          {t('references')}: {selectedOrder.customer.delivery_instructions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('products')}</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">{item.variation.name}</p>
                      {item.special_notes && (
                        <p className="text-xs text-gray-500 italic">Nota: {item.special_notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {item.quantity} x ${item.variation.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(item.variation.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('orderSummary')}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.delivery_cost && selectedOrder.delivery_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>${selectedOrder.delivery_cost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.special_instructions && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('specialInstructions')}</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-900">{selectedOrder.special_instructions}</p>
                </div>
              </div>
            )}

            {/* Order Status and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Estado actual:</p>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex gap-3">
                {canAdvanceStatus(selectedOrder.status) && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                      setShowModal(false);
                    }}
                    icon={CheckCircle}
                  >
                    {t('nextStep')}
                  </Button>
                )}
                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'cancelled');
                      setShowModal(false);
                    }}
                    icon={XCircle}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};