import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar, Users, Filter, Download, X, Search } from 'lucide-react';
import { Product, Order, Category } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

export const RestaurantAnalytics: React.FC = () => {
  const { restaurant } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (restaurant) {
      loadAnalyticsData();
      // Set default dates (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }
  }, [restaurant]);

  useEffect(() => {
    // Update filtered orders when filters change
    // This effect will run whenever any filter state changes
  }, [orders, startDate, endDate, selectedCategory, selectedOrderType, selectedStatus]);

  const loadAnalyticsData = () => {
    if (!restaurant) return;

    const allProducts = loadFromStorage('products') || [];
    const allOrders = loadFromStorage('orders') || [];
    const allCategories = loadFromStorage('categories') || [];

    const restaurantProducts = allProducts.filter((p: Product) => p && p.restaurant_id === restaurant.id);
    const restaurantOrders = allOrders.filter((o: Order) =>
      o &&
      o.restaurant_id === restaurant.id &&
      o.order_number &&
      o.status &&
      o.items
    );
    const restaurantCategories = allCategories.filter((c: Category) => c && c.restaurant_id === restaurant.id && c.active);

    setProducts(restaurantProducts);
    setOrders(restaurantOrders);
    setCategories(restaurantCategories);
  };

  // Filter orders by date range
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Date filter
      if (startDate || endDate) {
        const orderDate = new Date(order.created_at);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2100-12-31');
        
        if (orderDate < start || orderDate > end) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const hasProductInCategory = order.items.some(item => 
          item.product.category_id === selectedCategory
        );
        if (!hasProductInCategory) {
          return false;
        }
      }

      // Order type filter
      if (selectedOrderType !== 'all' && order.order_type !== selectedOrderType) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Remove the old filter logic

  const getActiveFiltersCount = () => {
    let count = 0;
    if (startDate || endDate) count++;
    if (selectedCategory !== 'all') count++;
    if (selectedOrderType !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory('all');
    setSelectedOrderType('all');
    setSelectedStatus('all');
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('No hay datos para exportar', 'warning');
      return;
    }

    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', generateFileName());
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Datos exportados exitosamente', 'success');
    }
  };

  const generateCSVContent = () => {
    const headers = [
      'Número de Pedido',
      'Fecha',
      'Cliente',
      'Tipo',
      'Estado',
      'Total',
      'Items'
    ];

    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      order.customer?.name || 'N/A',
      order.order_type === 'pickup' ? 'Recoger' : 
      order.order_type === 'delivery' ? 'Delivery' : 'Mesa',
      order.status === 'pending' ? 'Pendiente' :
      order.status === 'confirmed' ? 'Confirmado' :
      order.status === 'preparing' ? 'Preparando' :
      order.status === 'ready' ? 'Listo' :
      order.status === 'delivered' ? 'Entregado' :
      order.status === 'cancelled' ? 'Cancelado' : order.status,
      `$${order.total.toFixed(2)}`,
      order.items.map(item => `${item.product.name} x${item.quantity}`).join('; ')
    ]);

    const csvRows = [headers, ...rows];
    return csvRows.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const generateFileName = () => {
    const restaurantName = restaurant?.name || 'Restaurant';
    const dateRange = startDate && endDate ? `_${startDate}_${endDate}` : 
                     startDate ? `_desde_${startDate}` :
                     endDate ? `_hasta_${endDate}` : '';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${restaurantName}_estadisticas${dateRange}_${timestamp}.csv`;
  };

  // Calculate analytics
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const totalRevenue = filteredOrders.filter(o => o.status === 'delivered').reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Orders by status
  const ordersByStatus = {
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
    preparing: filteredOrders.filter(o => o.status === 'preparing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
  };

  // Monthly orders
  const getMonthlyOrders = () => {
    const monthlyData: { [key: string]: number } = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  const monthlyOrders = getMonthlyOrders();

  // Top products
  const getTopProducts = () => {
    const productSales: { [key: string]: { product: Product; quantity: number; revenue: number } } = {};
    
    filteredOrders.filter(o => o.status === 'delivered').forEach(order => {
      order.items.forEach(item => {
        const key = item.product.id;
        if (!productSales[key]) {
          productSales[key] = {
            product: item.product,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.variation.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // Recent orders
  const recentOrders = filteredOrders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmado</Badge>;
      case 'preparing':
        return <Badge variant="info">Preparando</Badge>;
      case 'ready':
        return <Badge variant="success">Listo</Badge>;
      case 'delivered':
        return <Badge variant="success">Entregado</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="gray">Desconocido</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas y Reportes</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={exportToCSV}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            Filtros Avanzados {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            />
          </div>
          
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rango de Fechas</label>
              <Input
                type="date"
                placeholder="Desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
              <Input
                type="date"
                placeholder="Hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Order Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pedido</label>
              <select
                value={selectedOrderType}
                onChange={(e) => setSelectedOrderType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="pickup">Recoger</option>
                <option value="delivery">Delivery</option>
                <option value="table">Mesa</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="preparing">Preparando</option>
                <option value="ready">Listo</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">Filtros activos:</span>
              
              {(startDate || endDate) && (
                <Badge variant="info">
                  📅 {startDate || 'inicio'} - {endDate || 'hoy'}
                </Badge>
              )}
              
              {selectedCategory !== 'all' && (
                <Badge variant="info">
                  📂 {categories.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
              
              {selectedOrderType !== 'all' && (
                <Badge variant="info">
                  🛍️ {selectedOrderType === 'pickup' ? 'Recoger' : 
                      selectedOrderType === 'delivery' ? 'Delivery' : 'Mesa'}
                </Badge>
              )}
              
              {selectedStatus !== 'all' && (
                <Badge variant="info">
                  📊 {selectedStatus === 'pending' ? 'Pendiente' :
                      selectedStatus === 'confirmed' ? 'Confirmado' :
                      selectedStatus === 'preparing' ? 'Preparando' :
                      selectedStatus === 'ready' ? 'Listo' :
                      selectedStatus === 'delivered' ? 'Entregado' :
                      selectedStatus === 'cancelled' ? 'Cancelado' : selectedStatus}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-700 ml-2"
              >
                Limpiar Todos
              </Button>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            📊 Mostrando <strong>{filteredOrders.length}</strong> pedido{filteredOrders.length !== 1 ? 's' : ''} 
            {getActiveFiltersCount() > 0 ? ' que coinciden con los filtros' : ' en total'}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>


      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              {completedOrders} completados
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              Pedidos entregados
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-purple-600 font-medium">
              Por pedido
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-orange-600 font-medium">
              De {products.length} total
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Pedidos por Tipo
          </h3>
          <div className="space-y-3">
            {(() => {
              const ordersByType = {
                pickup: filteredOrders.filter(o => o.order_type === 'pickup').length,
                delivery: filteredOrders.filter(o => o.order_type === 'delivery').length,
                table: filteredOrders.filter(o => o.order_type === 'table').length,
              };
              const totalTypeOrders = Object.values(ordersByType).reduce((sum, count) => sum + count, 0);
              
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recoger</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${totalTypeOrders > 0 ? (ordersByType.pickup / totalTypeOrders) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{ordersByType.pickup}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivery</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${totalTypeOrders > 0 ? (ordersByType.delivery / totalTypeOrders) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{ordersByType.delivery}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mesa</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${totalTypeOrders > 0 ? (ordersByType.table / totalTypeOrders) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{ordersByType.table}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Pedidos por Mes
          </h3>
          <div className="space-y-3">
            {monthlyOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay datos suficientes para mostrar
              </p>
            ) : (
              monthlyOrders.map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...monthlyOrders.map(([, c]) => c))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Estados de Pedidos
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Entregados</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? (ordersByStatus.delivered / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{ordersByStatus.delivered}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendientes</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? (ordersByStatus.pending / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{ordersByStatus.pending}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En Preparación</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? ((ordersByStatus.confirmed + ordersByStatus.preparing + ordersByStatus.ready) / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {ordersByStatus.confirmed + ordersByStatus.preparing + ordersByStatus.ready}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelados</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? (ordersByStatus.cancelled / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{ordersByStatus.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Productos Más Vendidos</h3>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay ventas registradas aún
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} vendidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pedidos Recientes</h3>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay pedidos registrados aún
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} - {order.customer?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};