import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar, Users, Filter, Download, X, Search } from 'lucide-react';
import { Product, Order, Category } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext'; // IMPORTACIÓN AÑADIDA
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/currencyUtils';

export const RestaurantAnalytics: React.FC = () => {
  const { restaurant } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage(); // HOOK AÑADIDO
  const currency = restaurant?.settings?.currency || 'USD';
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
      showToast('warning', t('analyticsToastNoData'));
      return;
    }
  
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
  
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = generateFileName();
    link.style.display = 'none';
  
    document.body.appendChild(link);
    link.click();
  
    URL.revokeObjectURL(url);
  
    document.body.removeChild(link);
  
    showToast('success', t('analyticsToastExportSuccess'));
  };

  const generateCSVContent = () => {
    const csvData = [];

    // Título del reporte
    csvData.push([t('csvReportTitle')]);
    csvData.push([t('csvRestaurantLabel'), restaurant?.name || '']);
    csvData.push([t('csvGenerationDate'), new Date().toLocaleString()]);
    csvData.push([t('csvPeriodLabel'), startDate && endDate ? `${startDate} a ${endDate}` : t('csvAllPeriods')]);
    csvData.push([]);

    // Resumen ejecutivo
    csvData.push([t('csvExecutiveSummary')]);
    csvData.push([t('csvTotalOrders'), totalOrders]);
    csvData.push([t('csvCompletedOrders'), completedOrders]);
    csvData.push([t('csvCancelledOrders'), ordersByStatus.cancelled]);
    csvData.push([t('csvCompletionRate'), `${totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%`]);
    csvData.push([t('csvTotalRevenue'), formatCurrency(totalRevenue, currency)]);
    csvData.push([t('csvAverageTicket'), formatCurrency(averageOrderValue, currency)]);
    csvData.push([]);

    // Distribución por tipo de pedido
    csvData.push([t('csvOrderTypeDistribution')]);
    const ordersByType = {
      pickup: filteredOrders.filter(o => o.order_type === 'pickup').length,
      delivery: filteredOrders.filter(o => o.order_type === 'delivery').length,
      table: filteredOrders.filter(o => o.order_type === 'table').length,
    };
    csvData.push([t('orderTypePickup'), ordersByType.pickup, `${totalOrders > 0 ? ((ordersByType.pickup / totalOrders) * 100).toFixed(1) : 0}%`]);
    csvData.push([t('orderTypeDelivery'), ordersByType.delivery, `${totalOrders > 0 ? ((ordersByType.delivery / totalOrders) * 100).toFixed(1) : 0}%`]);
    csvData.push([t('orderTypeTable'), ordersByType.table, `${totalOrders > 0 ? ((ordersByType.table / totalOrders) * 100).toFixed(1) : 0}%`]);
    csvData.push([]);

    // Distribución por estado
    csvData.push([t('csvOrderStatusDistribution')]);
    csvData.push([t('orderStatusPendingPlural'), ordersByStatus.pending]);
    csvData.push([t('orderStatusConfirmedPlural'), ordersByStatus.confirmed]);
    csvData.push([t('orderStatusPreparing'), ordersByStatus.preparing]);
    csvData.push([t('orderStatusReadyPlural'), ordersByStatus.ready]);
    csvData.push([t('orderStatusDeliveredPlural'), ordersByStatus.delivered]);
    csvData.push([t('orderStatusCancelledPlural'), ordersByStatus.cancelled]);
    csvData.push([]);

    // Productos más vendidos
    csvData.push([t('csvTopSellingProducts')]);
    csvData.push([t('csvPosition'), t('csvProduct'), t('csvQuantitySold'), t('csvRevenue')]);
    topProducts.forEach((item, index) => {
      csvData.push([
        `#${index + 1}`,
        item.product.name,
        item.quantity,
        formatCurrency(item.revenue, currency)
      ]);
    });
    csvData.push([]);

    // Ventas por categoría
    csvData.push([t('csvSalesByCategory')]);
    csvData.push([t('csvCategory'), t('csvProductCount'), t('csvRevenue')]);
    const salesByCategory: { [key: string]: { name: string; count: number; revenue: number } } = {};

    filteredOrders.filter(o => o.status === 'delivered').forEach(order => {
      order.items.forEach(item => {
        const category = categories.find(c => c.id === item.product.category_id);
        const categoryName = category?.name || t('csvNoCategory');

        if (!salesByCategory[categoryName]) {
          salesByCategory[categoryName] = { name: categoryName, count: 0, revenue: 0 };
        }
        salesByCategory[categoryName].count += item.quantity;
        salesByCategory[categoryName].revenue += item.variation.price * item.quantity;
      });
    });

    Object.values(salesByCategory)
      .sort((a, b) => b.revenue - a.revenue)
      .forEach(cat => {
        csvData.push([cat.name, cat.count, formatCurrency(cat.revenue, currency)]);
      });
    csvData.push([]);

    // Ventas por día de la semana
    csvData.push([t('csvSalesByDay')]);
    csvData.push([t('csvDay'), t('csvOrderCount'), t('csvRevenue')]);
    const dayNames = [t('daySunday'), t('dayMonday'), t('dayTuesday'), t('dayWednesday'), t('dayThursday'), t('dayFriday'), t('daySaturday')];
    const salesByDay = Array(7).fill(0).map(() => ({ count: 0, revenue: 0 }));

    filteredOrders.filter(o => o.status === 'delivered').forEach(order => {
      const day = new Date(order.created_at).getDay();
      salesByDay[day].count++;
      salesByDay[day].revenue += order.total;
    });

    salesByDay.forEach((data, index) => {
      csvData.push([dayNames[index], data.count, formatCurrency(data.revenue, currency)]);
    });
    csvData.push([]);

    // Detalle completo de pedidos
    csvData.push([t('csvOrderDetails')]);
    csvData.push([
      t('csvOrderNumber'),
      t('csvDate'),
      t('csvTime'),
      t('csvCustomer'),
      t('csvPhone'),
      t('csvEmail'),
      t('csvOrderType'),
      t('csvStatus'),
      t('csvSubtotal'),
      t('csvDeliveryCost'),
      t('csvTotal'),
      t('csvPaymentMethod'),
      t('csvItems'),
      t('csvSpecialNotes')
    ]);

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      csvData.push([
        order.order_number,
        orderDate.toLocaleDateString(),
        orderDate.toLocaleTimeString(),
        order.customer?.name || 'N/A',
        order.customer?.phone || 'N/A',
        order.customer?.email || 'N/A',
        order.order_type === 'pickup' ? t('orderTypePickup') :
        order.order_type === 'delivery' ? t('orderTypeDelivery') : t('orderTypeTable'),
        order.status === 'pending' ? t('orderStatusPending') :
        order.status === 'confirmed' ? t('orderStatusConfirmed') :
        order.status === 'preparing' ? t('orderStatusPreparing') :
        order.status === 'ready' ? t('orderStatusReady') :
        order.status === 'delivered' ? t('orderStatusDelivered') :
        order.status === 'cancelled' ? t('orderStatusCancelled') : order.status,
        formatCurrency(order.subtotal, currency),
        formatCurrency(order.delivery_cost || 0, currency),
        formatCurrency(order.total, currency),
        'N/A', // Método de pago no está disponible
        order.items.map(item =>
          `${item.product.name} (${item.variation.name}) x${item.quantity} - ${formatCurrency(item.total_price, currency)}`
        ).join('; '),
        order.special_instructions || 'N/A'
      ]);
    });
    csvData.push([]);

    // Detalle de items vendidos
    csvData.push([t('csvItemsSoldDetails')]);
    csvData.push([t('csvProduct'), t('csvVariation'), t('csvQuantity'), t('csvUnitPrice'), t('csvTotal')]);

    const itemsDetails: { [key: string]: { product: string; variation: string; quantity: number; price: number; total: number } } = {};

    filteredOrders.filter(o => o.status === 'delivered').forEach(order => {
      order.items.forEach(item => {
        const key = `${item.product.id}-${item.variation.id}`;
        if (!itemsDetails[key]) {
          itemsDetails[key] = {
            product: item.product.name,
            variation: item.variation.name,
            quantity: 0,
            price: item.variation.price,
            total: 0
          };
        }
        itemsDetails[key].quantity += item.quantity;
        itemsDetails[key].total += item.total_price;
      });
    });

    Object.values(itemsDetails)
      .sort((a, b) => b.quantity - a.quantity)
      .forEach(item => {
        csvData.push([
          item.product,
          item.variation,
          item.quantity,
          formatCurrency(item.price, currency),
          formatCurrency(item.total, currency)
        ]);
      });

    // Convertir a formato CSV
    const csvContent = csvData.map(row =>
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Agregar BOM para compatibilidad con Excel
    return '\ufeff' + csvContent;
  };

  const generateFileName = () => {
    const restaurantName = restaurant?.name || t('fileNameRestaurantDefault');
    const dateRange = startDate && endDate ? `_${startDate}_${endDate}` : 
                     startDate ? `_${t('fileNamePrefixFrom')}_${startDate}` :
                     endDate ? `_${t('fileNamePrefixUntil')}_${endDate}` : '';
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
        return <Badge variant="warning">{t('orderStatusPending')}</Badge>;
      case 'confirmed':
        return <Badge variant="info">{t('orderStatusConfirmed')}</Badge>;
      case 'preparing':
        return <Badge variant="info">{t('orderStatusPreparing')}</Badge>;
      case 'ready':
        return <Badge variant="success">{t('orderStatusReady')}</Badge>;
      case 'delivered':
        return <Badge variant="success">{t('orderStatusDelivered')}</Badge>;
      case 'cancelled':
        return <Badge variant="error">{t('orderStatusCancelled')}</Badge>;
      default:
        return <Badge variant="gray">{t('orderStatusUnknown')}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        {/* Título */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {t('analyticsPageTitle')}
        </h1>
      
        {/* Controles */}
        <div className="flex flex-wrap justify-start md:justify-end items-center gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={exportToCSV}
          className="bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          {t('btnExportCSV')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
          className="
            bg-gray-600 text-white border-gray-600 
            hover:bg-gray-600 hover:text-white hover:border-gray-600 
            active:bg-gray-600 active:text-white active:border-gray-600
          "
        >
          {t('btnAdvancedFilters')}
          {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount()})`}
        </Button>
        </div>
      </div>


      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('btnAdvancedFilters')}</h3>
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
              <label className="block text-sm font-medium text-gray-700">{t('filterDateRange')}</label>
              <Input
                type="date"
                placeholder={t('filterDateStart')}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
              <Input
                type="date"
                placeholder={t('filterDateUntil')}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('filterCategory')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('filterAllCategories')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Order Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('filterOrderType')}</label>
              <select
                value={selectedOrderType}
                onChange={(e) => setSelectedOrderType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('filterAllTypes')}</option>
                <option value="pickup">{t('orderTypePickup')}</option>
                <option value="delivery">{t('orderTypeDelivery')}</option>
                <option value="table">{t('orderTypeTable')}</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('filterStatus')}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('filterAllStatuses')}</option>
                <option value="pending">{t('orderStatusPending')}</option>
                <option value="confirmed">{t('orderStatusConfirmed')}</option>
                <option value="preparing">{t('orderStatusPreparing')}</option>
                <option value="ready">{t('orderStatusReady')}</option>
                <option value="delivered">{t('orderStatusDelivered')}</option>
                <option value="cancelled">{t('orderStatusCancelled')}</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">{t('filterActiveLabel')}</span>
              
              {(startDate || endDate) && (
                <Badge variant="info">
                  📅 {startDate || t('filterDateStartShort')} - {endDate || t('filterDateToday')}
                </Badge>
              )}
              
              {selectedCategory !== 'all' && (
                <Badge variant="info">
                  📂 {categories.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
              
              {selectedOrderType !== 'all' && (
                <Badge variant="info">
                  🛍️ {selectedOrderType === 'pickup' ? t('orderTypePickup') : 
                      selectedOrderType === 'delivery' ? t('orderTypeDelivery') : t('orderTypeTable')}
                </Badge>
              )}
              
              {selectedStatus !== 'all' && (
                <Badge variant="info">
                  📊 {selectedStatus === 'pending' ? t('orderStatusPending') :
                      selectedStatus === 'confirmed' ? t('orderStatusConfirmed') :
                      selectedStatus === 'preparing' ? t('orderStatusPreparing') :
                      selectedStatus === 'ready' ? t('orderStatusReady') :
                      selectedStatus === 'delivered' ? t('orderStatusDelivered') :
                      selectedStatus === 'cancelled' ? t('orderStatusCancelled') : selectedStatus}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-700 ml-2"
              >
                {t('btnClearAllFilters')}
              </Button>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            📊 {t('filterSummaryShowing')} <strong>{filteredOrders.length}</strong> {filteredOrders.length !== 1 ? t('filterSummaryOrderPlural') : t('filterSummaryOrderSingular')} 
            {getActiveFiltersCount() > 0 ? t('filterSummaryMatchingFilters') : t('filterSummaryInTotal')}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {t('analyticsLastUpdated')}: {new Date().toLocaleString()}
        </div>
      </div>


      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('statTotalOrders')}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              {completedOrders} {t('statCompletedSubtitle')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('statTotalRevenue')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalRevenue, currency)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              {t('statDeliveredOrdersSubtitle')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('statAverageTicket')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(averageOrderValue, currency)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-purple-600 font-medium">
              {t('statPerOrderSubtitle')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('statActiveProducts')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-orange-600 font-medium">
              {t('statOf')} {products.length} {t('statTotal')}
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
            {t('chartOrdersByType')}
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
                    <span className="text-sm text-gray-600">{t('orderTypePickup')}</span>
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
                    <span className="text-sm text-gray-600">{t('orderTypeDelivery')}</span>
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
                    <span className="text-sm text-gray-600">{t('orderTypeTable')}</span>
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
            {t('chartOrdersByMonth')}
          </h3>
          <div className="space-y-3">
            {monthlyOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('chartNoData')}
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
            {t('chartOrderStatus')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('orderStatusDeliveredPlural')}</span>
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
              <span className="text-sm text-gray-600">{t('orderStatusPendingPlural')}</span>
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
              <span className="text-sm text-gray-600">{t('orderStatusPreparing')}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? (ordersByStatus.preparing / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{ordersByStatus.preparing}</span>
              </div>
            </div>
            {/* Confirmed - Added missing block */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('orderStatusConfirmedPlural')}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? (ordersByStatus.confirmed / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{ordersByStatus.confirmed}</span>
              </div>
            </div>
            {/* Ready - Added missing block */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('orderStatusReadyPlural')}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${totalOrders > 0 ? (ordersByStatus.ready / totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{ordersByStatus.ready}</span>
              </div>
            </div>
            {/* Cancelled - Added missing block */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('orderStatusCancelledPlural')}</span>
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
            <h3 className="text-lg font-medium text-gray-900">{t('chartTopProductsTitle')}</h3>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('chartNoProducts')}
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} {t('unitsSold')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.revenue, currency)}
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
            <h3 className="text-lg font-medium text-gray-900">{t('recentOrdersTitle')}</h3>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('noOrdersYet')}
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('orderNumber')} {order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} - {order.customer?.name || t('customerUnknown')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total, currency)}
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