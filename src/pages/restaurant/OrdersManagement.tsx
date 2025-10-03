import React, { useState, useEffect } from 'react';
import { Eye, CreditCard as Edit, Trash2, Clock, Phone, MapPin, User, Filter, Search, CheckCircle, XCircle, AlertCircle, Package, Plus, MessageSquare, Printer, DollarSign, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';
import { Order, Product, Category } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { OrderProductSelector } from '../../components/restaurant/OrderProductSelector';

export const OrdersManagement: React.FC = () => {
  const { restaurant } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState({
    customer: { name: '', phone: '', email: '', address: '', delivery_instructions: '' },
    order_type: 'pickup' as Order['order_type'],
    status: 'pending' as Order['status'],
    delivery_address: '',
    table_number: '',
    special_instructions: '',
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
    todayRevenue: 0,
    todayOrders: 0,
    averageOrderValue: 0,
    completionRate: 0
  });
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<Order['items']>([]);

  useEffect(() => {
    if (restaurant) {
      loadOrders();
      loadProductsAndCategories();
    }
  }, [restaurant]);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const loadOrders = () => {
    if (!restaurant) return;

    const allOrders = loadFromStorage('orders') || [];
    const restaurantOrders = allOrders.filter((order: Order) =>
      order &&
      order.restaurant_id === restaurant.id &&
      order.order_number &&
      order.status &&
      order.items
    );

    setOrders(restaurantOrders);
  };

  const loadProductsAndCategories = () => {
    if (!restaurant) return;

    const allProducts = loadFromStorage('products') || [];
    const allCategories = loadFromStorage('categories') || [];

    const restaurantCategories = allCategories.filter((cat: Category) =>
      cat.restaurant_id === restaurant.id && cat.active
    );

    const restaurantProducts = allProducts.filter((prod: Product) =>
      prod.restaurant_id === restaurant.id && prod.is_available
    );

    setCategories(restaurantCategories);
    setProducts(restaurantProducts);
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.created_at).toDateString() === today
    );
    
    const completedOrders = orders.filter(order => order.status === 'delivered');
    const todayRevenue = todayOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    
    const averageOrderValue = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => sum + order.total, 0) / completedOrders.length 
      : 0;
    
    const completionRate = orders.length > 0 
      ? (completedOrders.length / orders.length) * 100 
      : 0;

    setOrderStats({
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      todayRevenue,
      todayOrders: todayOrders.length,
      averageOrderValue,
      completionRate
    });
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
    
    const statusMessages = {
      confirmed: 'Pedido confirmado',
      preparing: 'Pedido en preparación',
      ready: 'Pedido listo para entrega',
      delivered: 'Pedido entregado',
      cancelled: 'Pedido cancelado'
    };
    
    showToast(
      'success',
      'Estado Actualizado',
      statusMessages[newStatus] || 'Estado del pedido actualizado',
      3000
    );
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

  const getNextStatusLabel = (currentStatus: Order['status']): string => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return '';
    
    const labels: Record<Order['status'], string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmar',
      preparing: 'Preparar',
      ready: 'Marcar Listo',
      delivered: 'Entregar',
      cancelled: 'Cancelado',
    };
    return labels[nextStatus];
  };

  const handleQuickStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
        : order
    );
    
    saveToStorage('orders', updatedOrders);
    loadOrders();
    
    showToast(
      'success',
      'Estado Actualizado',
      `El pedido ha sido marcado como ${getStatusBadge(newStatus).props.children}`,
      3000
    );
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

  const getOrderTypeBadge = (orderType: string, tableNumber?: string) => {
    switch (orderType) {
      case 'delivery':
        return <Badge variant="info">{t('delivery')}</Badge>;
      case 'pickup':
        return <Badge variant="gray">{t('pickup')}</Badge>;
      case 'table':
        return <Badge variant="warning">{t('mesa')} {tableNumber}</Badge>;
      default:
        return <Badge variant="gray">{orderType}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.phone || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.order_type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = orderDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = orderDate >= monthAgo;
          break;
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = orderDate >= start && orderDate <= end;
          }
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'total':
        comparison = a.total - b.total;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handleBulkAction = () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    const allOrders = loadFromStorage('orders') || [];
    const updatedOrders = allOrders.map((order: Order) =>
      selectedOrders.includes(order.id)
        ? { ...order, status: bulkAction as Order['status'], updated_at: new Date().toISOString() }
        : order
    );
    
    saveToStorage('orders', updatedOrders);
    loadOrders();
    setSelectedOrders([]);
    setBulkAction('');
    setShowBulkActions(false);
    
    showToast(
      'success',
      'Acción Masiva Completada',
      `${selectedOrders.length} pedidos actualizados`,
      3000
    );
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(order => order.id));
    }
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <html>
        <head>
          <title>Pedido ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items { margin-bottom: 20px; }
            .total { font-weight: bold; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${restaurant?.name}</h1>
            <h2>Pedido #${order.order_number}</h2>
          </div>
          
          <div class="order-info">
            <p><strong>Cliente:</strong> ${order.customer.name}</p>
            <p><strong>Teléfono:</strong> ${order.customer.phone}</p>
            <p><strong>Tipo:</strong> ${order.order_type}</p>
            ${order.delivery_address ? `<p><strong>Dirección:</strong> ${order.delivery_address}</p>` : ''}
            ${order.table_number ? `<p><strong>Mesa:</strong> ${order.table_number}</p>` : ''}
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          </div>
          
          <div class="items">
            <h3>Productos:</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                    {t('orderNumber')}
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.product.name}</td>
                    <td>${item.variation.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.variation.price * item.quantity).toFixed(2)}</td>
                  </tr>
                  ${item.special_notes ? `<tr><td colspan="4"><em>Nota: ${item.special_notes}</em></td></tr>` : ''}
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="total">
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            ${order.delivery_cost ? `<p>Delivery: $${order.delivery_cost.toFixed(2)}</p>` : ''}
            <p>Total: $${order.total.toFixed(2)}</p>
          </div>
          
          ${order.special_instructions ? `<p><strong>Instrucciones:</strong> ${order.special_instructions}</p>` : ''}
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateOrderNumber = () => {
    // Get all existing orders for this restaurant
    const allOrders = loadFromStorage('orders') || [];
    const restaurantOrders = allOrders.filter((order: Order) => 
      order.restaurant_id === restaurant.id
    );
    
    // Find the highest order number
    let maxNumber = 1000;
    restaurantOrders.forEach((order: Order) => {
      // Extract number from format #RES-XXXX
      const match = order.order_number.match(/#RES-(\d+)/);
      if (match) {
        const orderNum = parseInt(match[1]);
        if (!isNaN(orderNum) && orderNum > maxNumber) {
          maxNumber = orderNum;
        }
      }
    });
    
    // Return next consecutive number
    return `#RES-${maxNumber + 1}`;
  };

  const generateWhatsAppMessage = (order: Order) => {
    const restaurantName = restaurant?.name || 'Restaurante';
    const orderNumber = order.order_number;
    const orderDate = new Date(order.created_at).toLocaleString();
    
    let message = `*NUEVO PEDIDO - ${restaurantName}*\n`;
    message += `*Fecha:* ${orderDate}\n`;
    message += `*Pedido #:* ${orderNumber}\n\n`;
    
    message += `*CLIENTE:*\n`;
    message += `- *Nombre:* ${order.customer.name}\n`;
    message += `- *Telefono:* ${order.customer.phone}\n`;
    if (order.customer.email) {
      message += `- *Email:* ${order.customer.email}\n`;
    }
    message += `\n`;
    
    message += `*TIPO DE ENTREGA:* ${order.order_type === 'delivery' ? 'Delivery' : order.order_type === 'table' ? 'Mesa' : 'Recoger en restaurante'}\n`;
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
      message += `   - *Variacion:* ${item.variation.name}\n`;
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
    
    message += `*Tiempo estimado:* ${restaurant?.settings?.preparation_time || '30-45 minutos'}\n\n`;
    message += `*Gracias por tu pedido!*`;

    return encodeURIComponent(message);
  };

  const generateStatusUpdateMessage = (order: Order): string => {
    const restaurantName = restaurant?.name || 'Tu Restaurante';
    const orderNumber = order.order_number;

    const statusMessages: { [key in Order['status']]: string } = {
      'pending': 'está *PENDIENTE* de confirmación',
      'confirmed': 'ha sido *CONFIRMADO* y será procesado pronto',
      'preparing': 'está en *PREPARACIÓN*',
      'ready': 'está *LISTO* para entrega/recoger',
      'delivered': 'ha sido *ENTREGADO*',
      'cancelled': 'ha sido *CANCELADO*'
    };

    let message = `*ACTUALIZACIÓN DE PEDIDO - ${restaurantName}*\n\n`;
    message += `*Pedido #:* ${orderNumber}\n`;
    message += `*Estado:* Tu pedido ${statusMessages[order.status]}\n\n`;

    if (order.status === 'ready') {
      if (order.order_type === 'pickup') {
        message += `Tu pedido está listo para recoger. Te esperamos!\n\n`;
      } else if (order.order_type === 'delivery') {
        message += `Tu pedido está listo y será entregado pronto.\n\n`;
      }
    } else if (order.status === 'preparing') {
      message += `Estamos preparando tu pedido con mucho cuidado.\n`;
      message += `*Tiempo estimado:* ${order.estimated_time || '30-45 minutos'}\n\n`;
    }

    message += `*Gracias por tu preferencia!*`;

    return encodeURIComponent(message);
  };

  const sendWhatsAppMessage = (order: Order) => {
    let whatsappMessage: string;

    if (!order.whatsapp_sent) {
      whatsappMessage = generateWhatsAppMessage(order);

      const allOrders = loadFromStorage('orders') || [];
      const updatedOrders = allOrders.map((o: Order) =>
        o.id === order.id ? { ...o, whatsapp_sent: true } : o
      );
      saveToStorage('orders', updatedOrders);
      loadOrders();
    } else {
      whatsappMessage = generateStatusUpdateMessage(order);
    }

    const whatsappNumber = order.customer.phone.replace(/[^\d]/g, '');

    if (whatsappNumber) {
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const printTicket = (order: Order) => {
    if (!restaurant) return;

    const billing = restaurant.settings?.billing;
    const subtotal = order.subtotal;
    const iva = billing?.responsableIVA ? subtotal * 0.19 : 0;
    const propina = billing?.aplicaPropina ? subtotal * 0.10 : 0;
    const total = order.total;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket - ${order.order_number}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }

            html, body {
              width: 80mm;
              margin: 0;
              padding: 0;
              background: white;
            }

            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 10px;
              box-sizing: border-box;
            }

            .ticket-header {
              text-align: center;
              border-bottom: 2px dashed #333;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }

            .logo {
              max-width: 120px;
              max-height: 80px;
              margin: 0 auto 10px;
            }

            .restaurant-name {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 5px;
            }

            .info-line {
              font-size: 10px;
              margin: 2px 0;
            }

            .section {
              margin: 10px 0;
              padding: 5px 0;
            }

            .section-title {
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #333;
              margin-bottom: 5px;
            }

            .order-info {
              margin: 10px 0;
            }

            .order-info-line {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 11px;
            }

            .items-table {
              width: 100%;
              margin: 10px 0;
            }

            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 11px;
            }

            .item-name {
              flex: 1;
              padding-right: 10px;
            }

            .item-qty {
              width: 30px;
              text-align: center;
            }

            .item-price {
              width: 70px;
              text-align: right;
            }

            .item-total {
              width: 80px;
              text-align: right;
              font-weight: bold;
            }

            .totals {
              border-top: 1px solid #333;
              margin-top: 10px;
              padding-top: 5px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 11px;
            }

            .total-row.final {
              font-size: 14px;
              font-weight: bold;
              border-top: 2px solid #333;
              padding-top: 5px;
              margin-top: 5px;
            }

            .footer {
              text-align: center;
              border-top: 2px dashed #333;
              padding-top: 10px;
              margin-top: 10px;
              font-size: 10px;
            }

            .dian-info {
              font-size: 9px;
              text-align: center;
              margin: 5px 0;
            }

            .message {
              font-size: 11px;
              font-style: italic;
              margin: 10px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="ticket-header">
            ${billing?.mostrarLogoEnTicket && billing?.logoTicket ? `
              <img src="${billing.logoTicket}" alt="Logo" class="logo">
            ` : ''}

            <div class="restaurant-name">${billing?.nombreComercial || restaurant.name}</div>
            ${billing?.razonSocial ? `<div class="info-line">${billing.razonSocial}</div>` : ''}
            ${billing?.nit ? `<div class="info-line">NIT: ${billing.nit}</div>` : ''}
            ${billing?.direccion ? `<div class="info-line">${billing.direccion}</div>` : ''}
            ${billing?.ciudad && billing?.departamento ? `<div class="info-line">${billing.ciudad}, ${billing.departamento}</div>` : billing?.ciudad ? `<div class="info-line">${billing.ciudad}</div>` : ''}
            ${billing?.telefono ? `<div class="info-line">Tel: ${billing.telefono}</div>` : ''}
            ${billing?.correo ? `<div class="info-line">${billing.correo}</div>` : ''}

            ${billing?.tieneResolucionDIAN && billing?.numeroResolucionDIAN ? `
              <div class="dian-info">
                Resolución DIAN N° ${billing.numeroResolucionDIAN}<br>
                Fecha: ${billing.fechaResolucion ? new Date(billing.fechaResolucion).toLocaleDateString('es-CO') : ''}<br>
                Rango: ${billing.rangoNumeracionDesde || ''} - ${billing.rangoNumeracionHasta || ''}
              </div>
            ` : ''}

            ${billing?.regimenTributario ? `
              <div class="info-line">
                ${billing.regimenTributario === 'simple' ? 'Régimen Simple' :
                  billing.regimenTributario === 'comun' ? 'Régimen Común' :
                  'No responsable de IVA'}
              </div>
            ` : ''}
          </div>

          <div class="order-info">
            <div class="order-info-line">
              <span><strong>Pedido:</strong></span>
              <span>${order.order_number}</span>
            </div>
            <div class="order-info-line">
              <span><strong>Fecha:</strong></span>
              <span>${new Date(order.created_at).toLocaleString('es-CO')}</span>
            </div>
            <div class="order-info-line">
              <span><strong>Tipo:</strong></span>
              <span>${
                order.order_type === 'delivery' ? 'Domicilio' :
                order.order_type === 'pickup' ? 'Para llevar' :
                `Mesa ${order.table_number || ''}`
              }</span>
            </div>
            <div class="order-info-line">
              <span><strong>Cliente:</strong></span>
              <span>${order.customer.name}</span>
            </div>
            <div class="order-info-line">
              <span><strong>Teléfono:</strong></span>
              <span>${order.customer.phone}</span>
            </div>
            ${order.delivery_address ? `
              <div class="order-info-line">
                <span><strong>Dirección:</strong></span>
                <span>${order.delivery_address}</span>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Productos</div>
            <div class="items-table">
              ${order.items.map(item => `
                <div class="item-row">
                  <div class="item-name">
                    ${item.product.name}<br>
                    <small style="font-size: 9px; color: #666;">${item.variation.name}</small>
                    ${item.special_notes ? `<br><small style="font-size: 9px; color: #666;">Nota: ${item.special_notes}</small>` : ''}
                  </div>
                  <div class="item-qty">${item.quantity}</div>
                  <div class="item-price">$${item.unit_price.toFixed(2)}</div>
                  <div class="item-total">$${item.total_price.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
          </div>

          ${order.special_instructions ? `
            <div class="section">
              <div class="section-title">Instrucciones Especiales</div>
              <div style="font-size: 10px; margin-top: 5px;">${order.special_instructions}</div>
            </div>
          ` : ''}

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>

            ${order.delivery_cost && order.delivery_cost > 0 ? `
              <div class="total-row">
                <span>Domicilio:</span>
                <span>$${order.delivery_cost.toFixed(2)}</span>
              </div>
            ` : ''}

            ${billing?.responsableIVA ? `
              <div class="total-row">
                <span>IVA (19%):</span>
                <span>$${iva.toFixed(2)}</span>
              </div>
            ` : ''}

            ${billing?.aplicaPropina ? `
              <div class="total-row">
                <span>Propina sugerida (10%):</span>
                <span>$${propina.toFixed(2)}</span>
              </div>
            ` : ''}

            <div class="total-row final">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>

            ${billing?.aplicaPropina ? `
              <div class="total-row" style="font-size: 10px; color: #666; margin-top: 3px;">
                <span>Total con propina:</span>
                <span>$${(total + propina).toFixed(2)}</span>
              </div>
            ` : ''}
          </div>

          ${billing?.mensajeFinalTicket ? `
            <div class="message">
              ${billing.mensajeFinalTicket}
            </div>
          ` : ''}

          <div class="footer">
            <div>¡Gracias por su compra!</div>
            <div style="margin-top: 5px;">${new Date().toLocaleString('es-CO')}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(ticketHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderForm({
      customer: order.customer,
      order_type: order.order_type,
      status: order.status,
      delivery_address: order.delivery_address || '',
      table_number: order.table_number || '',
      special_instructions: order.special_instructions || '',
    });
    setOrderItems(order.items || []);
    setShowEditOrderModal(true);
  };

  const resetOrderForm = () => {
    setOrderForm({
      customer: { name: '', phone: '', email: '', address: '', delivery_instructions: '' },
      order_type: 'pickup',
      status: 'pending',
      delivery_address: '',
      table_number: '',
      special_instructions: '',
    });
    setOrderItems([]);
  };

  const addItemToOrder = (product: Product, variationId: string, quantity: number, specialNotes?: string) => {
    const variation = product.variations.find(v => v.id === variationId);
    if (!variation) return;

    const newItem: Order['items'][0] = {
      id: `item-${Date.now()}-${Math.random()}`,
      product_id: product.id,
      product: product,
      variation: variation,
      quantity: quantity,
      unit_price: variation.price,
      total_price: variation.price * quantity,
      selected_ingredients: [],
      special_notes: specialNotes || '',
    };

    setOrderItems(prev => [...prev, newItem]);
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity }
        : item
    ));
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;

    const allOrders = loadFromStorage('orders') || [];
    const updatedOrders = allOrders.filter((order: Order) => order.id !== orderToDelete.id);

    saveToStorage('orders', updatedOrders);
    loadOrders();
    setShowDeleteModal(false);
    setOrderToDelete(null);

    showToast(
      'success',
      'Pedido Eliminado',
      `El pedido ${orderToDelete.order_number} ha sido eliminado exitosamente.`,
      4000
    );
  };

  const handleUpdateOrder = () => {
    if (!editingOrder) return;

    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryCost = orderForm.order_type === 'delivery' ? (restaurant?.settings?.delivery?.zones[0]?.cost || 0) : 0;
    const total = subtotal + deliveryCost;

    const allOrders = loadFromStorage('orders') || [];
    const updatedOrder = {
      ...editingOrder,
      customer: orderForm.customer,
      items: orderItems,
      order_type: orderForm.order_type,
      status: orderForm.status,
      delivery_address: orderForm.delivery_address,
      table_number: orderForm.table_number,
      delivery_cost: deliveryCost,
      subtotal: subtotal,
      total: total,
      special_instructions: orderForm.special_instructions,
      updated_at: new Date().toISOString(),
    };

    const updatedOrders = allOrders.map((order: Order) =>
      order.id === editingOrder.id ? updatedOrder : order
    );

    saveToStorage('orders', updatedOrders);
    loadOrders();
    setShowEditOrderModal(false);
    setEditingOrder(null);
    resetOrderForm();

    showToast(
      'success',
      'Pedido Actualizado',
      'El pedido ha sido actualizado exitosamente.',
      4000
    );
  };

  const handleCreateOrder = () => {
    if (!restaurant) return;

    if (!orderForm.customer.name.trim() || !orderForm.customer.phone.trim()) {
      showToast('error', 'Error', 'Por favor completa el nombre y teléfono del cliente', 4000);
      return;
    }

    if (orderItems.length === 0) {
      showToast('error', 'Error', 'Por favor agrega al menos un producto al pedido', 4000);
      return;
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryCost = orderForm.order_type === 'delivery' ? (restaurant.settings?.delivery?.zones[0]?.cost || 0) : 0;
    const total = subtotal + deliveryCost;

    const allOrders = loadFromStorage('orders') || [];
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      restaurant_id: restaurant.id,
      order_number: generateOrderNumber(),
      customer: orderForm.customer,
      items: orderItems,
      order_type: orderForm.order_type,
      status: orderForm.status,
      delivery_address: orderForm.delivery_address,
      table_number: orderForm.table_number,
      delivery_cost: deliveryCost,
      subtotal: subtotal,
      total: total,
      estimated_time: restaurant.settings?.preparation_time || '30-45 minutos',
      special_instructions: orderForm.special_instructions,
      whatsapp_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveToStorage('orders', [...allOrders, newOrder]);
    loadOrders();
    setShowCreateOrderModal(false);
    resetOrderForm();

    showToast(
      'success',
      'Pedido Creado',
      'El pedido ha sido creado exitosamente.',
      4000
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('orderManagement')}</h1>
        <div className="flex items-center gap-3">
          <Button
            icon={Plus}
            onClick={() => setShowCreateOrderModal(true)}
          >
            Crear Pedido
          </Button>
          {selectedOrders.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              Acciones Masivas ({selectedOrders.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={Filter}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900 mb-1">Pedidos Hoy</p>
              <p className="text-3xl font-bold text-blue-900">{orderStats.todayOrders}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-blue-200">
            <span className="text-xs text-blue-700 font-medium">Ventas del día</span>
            <span className="text-sm font-bold text-green-700">
              ${orderStats.todayRevenue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-amber-900 mb-1">En Proceso</p>
              <p className="text-3xl font-bold text-amber-900">
                {orderStats.pending + orderStats.confirmed + orderStats.preparing + orderStats.ready}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-amber-200">
            <span className="text-xs text-amber-700 font-medium">Pendiente</span>
            <span className="text-sm font-bold text-amber-800">{orderStats.pending}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-900 mb-1">Completados</p>
              <p className="text-3xl font-bold text-green-900">{orderStats.delivered}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-green-200">
            <span className="text-xs text-green-700 font-medium">Tasa de éxito</span>
            <span className="text-sm font-bold text-green-800">
              {orderStats.completionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-900 mb-1">Ticket Promedio</p>
              <p className="text-3xl font-bold text-purple-900">
                ${orderStats.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-purple-200">
            <span className="text-xs text-purple-700 font-medium">Cancelados</span>
            <span className="text-sm font-bold text-red-700">{orderStats.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-800">
              {selectedOrders.length} pedidos seleccionados
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-blue-300 rounded px-3 py-1 text-sm"
            >
              <option value="">Seleccionar acción...</option>
              <option value="confirmed">Confirmar</option>
              <option value="preparing">Marcar en preparación</option>
              <option value="ready">Marcar como listo</option>
              <option value="delivered">Marcar como entregado</option>
              <option value="cancelled">Cancelar</option>
            </select>
            <Button
              size="sm"
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Aplicar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedOrders([]);
                setShowBulkActions(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="preparing">En preparación</option>
                <option value="ready">Listos</option>
                <option value="delivered">Entregados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="pickup">Recoger</option>
                <option value="delivery">Delivery</option>
                <option value="table">Mesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="custom">Rango personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'total')}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Fecha</option>
                  <option value="status">Estado</option>
                  <option value="total">Total</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de pedido, cliente o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? 'No hay pedidos registrados' : 'No se encontraron pedidos'}
          </h3>
          <p className="text-gray-600">
            {orders.length === 0 
              ? 'Los pedidos aparecerán aquí una vez que los clientes empiecen a ordenar.'
              : 'Intenta ajustar los filtros de búsqueda.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                        onChange={selectAllOrders}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('orderNumber')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('customer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('orderType')}
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
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.estimated_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {order.customer?.phone || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOrderTypeBadge(order.order_type, order.table_number)}
                        {order.delivery_address && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.delivery_address.substring(0, 30)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} productos
                        </div>
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
                          />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditOrder(order)}
                            className="text-blue-600 hover:text-blue-700"
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar pedido"
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Printer}
                            onClick={() => printTicket(order)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Imprimir ticket"
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={MessageSquare}
                            onClick={() => sendWhatsAppMessage(order)}
                            className="text-green-600 hover:text-green-700"
                            title="Enviar por WhatsApp"
                          />

                          {getNextStatus(order.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickStatusUpdate(order.id, getNextStatus(order.status)!)}
                              className="text-blue-600 hover:text-blue-700 text-xs px-2"
                              title={`Cambiar a: ${getNextStatusLabel(order.status)}`}
                            >
                              {getNextStatusLabel(order.status)}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, sortedOrders.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{sortedOrders.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-l-md"
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "primary" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                          className="px-3 py-2"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-r-md"
                    >
                      Siguiente
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOrder(null);
        }}
        title={selectedOrder ? `Pedido #${selectedOrder.order_number}` : ''}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedOrder.customer.phone}</p>
                </div>
                {selectedOrder.customer.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.customer.email}</p>
                  </div>
                )}
                {selectedOrder.delivery_address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Dirección de entrega</p>
                    <p className="font-medium">{selectedOrder.delivery_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Detalles del Pedido</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <div className="mt-1">
                    {getOrderTypeBadge(selectedOrder.order_type, selectedOrder.table_number)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Productos</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.variation.name}</p>
                      {item.special_notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          <em>Nota: {item.special_notes}</em>
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">
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

            {/* Order Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.delivery_cost && selectedOrder.delivery_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>${selectedOrder.delivery_cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.special_instructions && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Instrucciones Especiales</h3>
                <p className="text-gray-700">{selectedOrder.special_instructions}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => printTicket(selectedOrder)}
                variant="outline"
                className="flex-1"
              >
                Imprimir
              </Button>
              <Button
                onClick={() => sendWhatsAppMessage(selectedOrder)}
                variant="outline"
                className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
              >
                WhatsApp
              </Button>
              {getNextStatus(selectedOrder.status) && (
                <Button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                    setShowModal(false);
                  }}
                  className="flex-1"
                >
                  {getNextStatusLabel(selectedOrder.status)}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateOrderModal}
        onClose={() => {
          setShowCreateOrderModal(false);
          resetOrderForm();
        }}
        title="Crear Nuevo Pedido"
        size="lg"
      >
        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                value={orderForm.customer.name}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, name: e.target.value }
                }))}
                placeholder="Nombre del cliente"
              />
              <Input
                label="Teléfono *"
                value={orderForm.customer.phone}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, phone: e.target.value }
                }))}
                placeholder="Número de teléfono"
              />
              <Input
                label="Email"
                type="email"
                value={orderForm.customer.email}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, email: e.target.value }
                }))}
                placeholder="Email del cliente"
              />
            </div>
          </div>

          {/* Order Type */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Tipo de Pedido</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="orderType"
                  value="pickup"
                  checked={orderForm.order_type === 'pickup'}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, order_type: e.target.value as Order['order_type'] }))}
                  className="mr-2"
                />
                <span>Recoger</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="orderType"
                  value="delivery"
                  checked={orderForm.order_type === 'delivery'}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, order_type: e.target.value as Order['order_type'] }))}
                  className="mr-2"
                />
                <span>Delivery</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="orderType"
                  value="table"
                  checked={orderForm.order_type === 'table'}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, order_type: e.target.value as Order['order_type'] }))}
                  className="mr-2"
                />
                <span>Mesa</span>
              </label>
            </div>
          </div>

          {/* Conditional Fields */}
          {orderForm.order_type === 'delivery' && (
            <div className="space-y-4">
              <Input
                label="Dirección de Entrega"
                value={orderForm.delivery_address}
                onChange={(e) => setOrderForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                placeholder="Dirección completa de entrega"
              />
              <Input
                label="Referencias de Entrega"
                value={orderForm.customer.delivery_instructions}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, delivery_instructions: e.target.value }
                }))}
                placeholder="Referencias para encontrar la dirección"
              />
            </div>
          )}

          {orderForm.order_type === 'table' && (
            <Input
              label="Número de Mesa"
              value={orderForm.table_number}
              onChange={(e) => setOrderForm(prev => ({ ...prev, table_number: e.target.value }))}
              placeholder="Número de mesa"
            />
          )}

          {/* Products Selection */}
          <OrderProductSelector
            products={products}
            orderItems={orderItems}
            onAddItem={addItemToOrder}
            onRemoveItem={removeItemFromOrder}
            onUpdateQuantity={updateItemQuantity}
            onShowToast={showToast}
          />

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones Especiales</label>
            <textarea
              value={orderForm.special_instructions}
              onChange={(e) => setOrderForm(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder="Instrucciones especiales para el pedido..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateOrderModal(false);
                resetOrderForm();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="flex-1"
            >
              Crear Pedido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Order Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOrderToDelete(null);
        }}
        title="Confirmar Eliminación"
        size="md"
      >
        {orderToDelete && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar pedido {orderToDelete.order_number}?
              </h3>
              <p className="text-gray-600 mb-4">
                Esta acción eliminará permanentemente:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Cliente: {orderToDelete.customer.name}</li>
                  <li>• Total: ${orderToDelete.total.toFixed(2)}</li>
                  <li>• {orderToDelete.items.length} producto{orderToDelete.items.length !== 1 ? 's' : ''}</li>
                  <li>• Estado: {orderToDelete.status}</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteOrder}
                icon={Trash2}
              >
                Eliminar Pedido
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        isOpen={showEditOrderModal}
        onClose={() => {
          setShowEditOrderModal(false);
          setEditingOrder(null);
          resetOrderForm();
        }}
        title={editingOrder ? `Editar Pedido #${editingOrder.order_number}` : ''}
        size="lg"
      >
        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                value={orderForm.customer.name}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, name: e.target.value }
                }))}
                placeholder="Nombre del cliente"
              />
              <Input
                label="Teléfono *"
                value={orderForm.customer.phone}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, phone: e.target.value }
                }))}
                placeholder="Número de teléfono"
              />
              <Input
                label="Email"
                type="email"
                value={orderForm.customer.email}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, email: e.target.value }
                }))}
                placeholder="Email del cliente"
              />
            </div>
          </div>

          {/* Order Type */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Tipo de Pedido</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="editOrderType"
                  value="pickup"
                  checked={orderForm.order_type === 'pickup'}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, order_type: e.target.value as Order['order_type'] }))}
                  className="mr-2"
                />
                <span>Recoger</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="editOrderType"
                  value="delivery"
                  checked={orderForm.order_type === 'delivery'}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, order_type: e.target.value as Order['order_type'] }))}
                  className="mr-2"
                />
                <span>Delivery</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="editOrderType"
                  value="table"
                  checked={orderForm.order_type === 'table'}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, order_type: e.target.value as Order['order_type'] }))}
                  className="mr-2"
                />
                <span>Mesa</span>
              </label>
            </div>
          </div>

          {/* Conditional Fields */}
          {orderForm.order_type === 'delivery' && (
            <div className="space-y-4">
              <Input
                label="Dirección de Entrega"
                value={orderForm.delivery_address}
                onChange={(e) => setOrderForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                placeholder="Dirección completa de entrega"
              />
              <Input
                label="Referencias de Entrega"
                value={orderForm.customer.delivery_instructions}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  customer: { ...prev.customer, delivery_instructions: e.target.value }
                }))}
                placeholder="Referencias para encontrar la dirección"
              />
            </div>
          )}

          {orderForm.order_type === 'table' && (
            <Input
              label="Número de Mesa"
              value={orderForm.table_number}
              onChange={(e) => setOrderForm(prev => ({ ...prev, table_number: e.target.value }))}
              placeholder="Número de mesa"
            />
          )}

          {/* Products Selection */}
          <OrderProductSelector
            products={products}
            orderItems={orderItems}
            onAddItem={addItemToOrder}
            onRemoveItem={removeItemFromOrder}
            onUpdateQuantity={updateItemQuantity}
            onShowToast={showToast}
          />

          {/* Order Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pedido</label>
            <select
              value={orderForm.status}
              onChange={(e) => setOrderForm(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Listo</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones Especiales</label>
            <textarea
              value={orderForm.special_instructions}
              onChange={(e) => setOrderForm(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder="Instrucciones especiales para el pedido..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditOrderModal(false);
                setEditingOrder(null);
                resetOrderForm();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateOrder}
              className="flex-1"
            >
              Actualizar Pedido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};