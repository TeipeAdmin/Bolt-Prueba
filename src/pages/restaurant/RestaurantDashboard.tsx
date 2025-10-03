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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')} - {restaurant?.name}</h1>
        <div className="text-sm text-gray-500">
          {t('lastUpdate')}: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Menu className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalProducts')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              {stats.activeProducts} {t('activeProducts')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('todayOrders')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.todayOrders}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              {stats.totalOrders} total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalSales')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.currentMonthRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-purple-600 font-medium">
              Mes actual
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('categories')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.categories}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-orange-600 font-medium">
              {t('active')}
            </span>
          </div>
        </div>
      </div>

      {/* Restaurant Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('restaurantStatus')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{t('status')}</p>
            <Badge variant={restaurant?.status === 'active' ? 'success' : 'warning'}>
              {restaurant?.status === 'active' ? t('active') : t('pending')}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">URL del Menú</p>
            <a
              href={`/${restaurant?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              /{restaurant?.slug}
              <Eye className="w-4 h-4" />
            </a>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{t('delivery')}</p>
            <Badge variant={restaurant?.settings?.delivery?.enabled ? 'success' : 'gray'}>
              {restaurant?.settings?.delivery?.enabled ? t('enabled') : t('disabled')}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Suscripción</p>
            <Badge variant={currentSubscription?.status === 'active' ? 'success' : 'warning'}>
              {getCurrentPlanName()}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Atención en Mesas</p>
            <Badge variant={restaurant?.settings?.table_orders?.enabled ? 'success' : 'gray'}>
              {restaurant?.settings?.table_orders?.enabled ? t('enabled') : t('disabled')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            {t('recentOrders')}
          </h2>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{t('noOrdersYet')}</p>
            <p className="text-sm">{t('ordersWillAppear')}</p>
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