import React, { useState, useEffect } from 'react';
import { BarChart3, ShoppingBag, Menu, Eye, TrendingUp } from 'lucide-react';
import { Product, Order, Category, Subscription } from '../../types';
import { loadFromStorage, availablePlans } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../../components/ui/Badge';

export const RestaurantDashboard: React.FC = () => {
  const { restaurant } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (restaurant) {
      loadDashboardData();
      loadSubscription();
    }
  }, [restaurant]);

  const loadSubscription = () => {
    const subscriptions = loadFromStorage('subscriptions', []);
    const subscription = subscriptions.find((sub: Subscription) => 
      sub.restaurant_id === restaurant?.id && sub.status === 'active'
    );
    setCurrentSubscription(subscription || null);
  };

  const loadDashboardData = () => {
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

  // Calculate last month's revenue
  const getLastMonthRevenue = () => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return order.status === 'delivered' && 
             orderDate >= currentMonthStart && 
             orderDate <= currentMonthEnd;
    }).reduce((sum, order) => sum + order.total, 0);
  };

  const getCurrentPlanName = () => {
    if (!currentSubscription) return 'Sin suscripción';
    const plan = availablePlans.find(p => p.id === currentSubscription.plan_type);
    return plan ? plan.name : currentSubscription.plan_type;
  };

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalOrders: orders.length,
    todayOrders: orders.filter(o => {
      const today = new Date().toDateString();
      const orderDate = new Date(o.created_at).toDateString();
      return today === orderDate;
    }).length,
    currentMonthRevenue: getLastMonthRevenue(),
    categories: categories.length,
  };

  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-600 mt-1">{restaurant?.name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {t('lastUpdate')}: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700">{t('totalProducts')}</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalProducts}</p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <span className="text-sm text-blue-700 font-medium">
                  {stats.activeProducts} {t('activeProducts')}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Menu className="h-7 w-7 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">{t('todayOrders')}</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.todayOrders}</p>
              <div className="mt-3 pt-3 border-t border-green-200">
                <span className="text-sm text-green-700 font-medium">
                  {stats.totalOrders} total
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-7 w-7 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-xl shadow-sm border border-teal-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-700">{t('totalSales')}</p>
              <p className="text-3xl font-bold text-teal-900 mt-2">
                ${stats.currentMonthRevenue.toFixed(2)}
              </p>
              <div className="mt-3 pt-3 border-t border-teal-200">
                <span className="text-sm text-teal-700 font-medium">
                  Mes actual
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-teal-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-7 w-7 text-teal-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-xl shadow-sm border border-orange-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-700">{t('categories')}</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{stats.categories}</p>
              <div className="mt-3 pt-3 border-t border-orange-200">
                <span className="text-sm text-orange-700 font-medium">
                  {t('active')}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-7 w-7 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          {t('restaurantStatus')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('status')}</p>
            <Badge variant={restaurant?.status === 'active' ? 'success' : 'warning'}>
              {restaurant?.status === 'active' ? t('active') : t('pending')}
            </Badge>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">URL del Menú</p>
            <a
              href={`/${restaurant?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
            >
              /{restaurant?.slug}
              <Eye className="w-4 h-4" />
            </a>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('delivery')}</p>
            <Badge variant={restaurant?.settings?.delivery?.enabled ? 'success' : 'gray'}>
              {restaurant?.settings?.delivery?.enabled ? t('enabled') : t('disabled')}
            </Badge>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Suscripción</p>
            <Badge variant={currentSubscription?.status === 'active' ? 'success' : 'warning'}>
              {getCurrentPlanName()}
            </Badge>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Atención en Mesas</p>
            <Badge variant={restaurant?.settings?.table_orders?.enabled ? 'success' : 'gray'}>
              {restaurant?.settings?.table_orders?.enabled ? t('enabled') : t('disabled')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            <ShoppingBag className="w-5 h-5 text-green-600" />
            {t('recentOrders')}
          </h2>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">{t('noOrdersYet')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('ordersWillAppear')}</p>
          </div>
        ) : (
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.order_type === 'table' ? (
                        <Badge variant="warning">
                          {t('mesa')} {order.table_number}
                        </Badge>
                      ) : (
                        <Badge variant={order.order_type === 'delivery' ? 'info' : 'gray'}>
                          {order.order_type === 'delivery' ? t('delivery') : t('pickup')}
                        </Badge>
                      )}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};