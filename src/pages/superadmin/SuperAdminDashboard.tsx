import React, { useState, useEffect } from 'react';
import { Store, Users, CreditCard, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { Restaurant, Subscription } from '../../types';
import { loadFromStorage, resetAllData } from '../../data/mockData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const SuperAdminDashboard: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const restaurantData = loadFromStorage('restaurants') || [];
    const subscriptionData = loadFromStorage('subscriptions') || [];
    setRestaurants(restaurantData);
    setSubscriptions(subscriptionData);
  }, []);

  const getRestaurantSubscription = (restaurantId: string) => {
    return subscriptions.find(s => s.restaurant_id === restaurantId);
  };

  const isRestaurantActive = (restaurantId: string) => {
    const subscription = getRestaurantSubscription(restaurantId);
    return subscription?.status === 'active';
  };

  const stats = {
    totalRestaurants: restaurants.length,
    activeRestaurants: restaurants.filter(r => isRestaurantActive(r.id)).length,
    inactiveRestaurants: restaurants.filter(r => !isRestaurantActive(r.id)).length,
    gratisPlan: subscriptions.filter(s => s.plan_type === 'gratis').length,
    basicPlan: subscriptions.filter(s => s.plan_type === 'basic').length,
    proPlan: subscriptions.filter(s => s.plan_type === 'pro').length,
    businessPlan: subscriptions.filter(s => s.plan_type === 'business').length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    expiredSubscriptions: subscriptions.filter(s => s.status === 'expired').length,
  };

  const recentRestaurants = restaurants
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getRestaurantStatusBadge = (restaurantId: string) => {
    const subscription = getRestaurantSubscription(restaurantId);
    if (!subscription) {
      return <Badge variant="gray">Sin suscripción</Badge>;
    }

    return subscription.status === 'active'
      ? <Badge variant="success">Activo</Badge>
      : <Badge variant="error">Inactivo</Badge>;
  };

  const getSubscriptionBadge = (subscription: Subscription | undefined) => {
    if (!subscription) return <Badge variant="gray">Sin suscripción</Badge>;

    const planName = subscription.plan_type === 'gratis' ? 'Gratis' :
                     subscription.plan_type === 'basic' ? 'Basic' :
                     subscription.plan_type === 'pro' ? 'Pro' :
                     subscription.plan_type === 'business' ? 'Business' :
                     subscription.plan_type.toUpperCase();

    const variant = subscription.plan_type === 'gratis' ? 'gray' :
                   subscription.plan_type === 'basic' ? 'info' :
                   subscription.plan_type === 'pro' ? 'success' :
                   'error';

    return <Badge variant={variant}>{planName}</Badge>;
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos a su estado inicial? Esta acción no se puede deshacer.')) {
      resetAllData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleResetData}
          >
            Reiniciar Datos
          </Button>
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Restaurantes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRestaurants}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <span className="text-sm text-green-600 font-medium">
              {stats.activeRestaurants} activos
            </span>
            <span className="text-sm text-red-600 font-medium">
              {stats.inactiveRestaurants} inactivos
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan Gratis</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.gratisPlan}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600 font-medium">
              Sin costo mensual
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan Basic</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.basicPlan}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-blue-600 font-medium">
              $15/mes
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan Pro</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.proPlan}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              $35/mes
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan Business</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.businessPlan}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-purple-600 font-medium">
              $75/mes
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suscripciones Activas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-red-600 font-medium">
              {stats.expiredSubscriptions} vencidas
            </span>
          </div>
        </div>
      </div>

      {/* Recent Restaurants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Restaurantes Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRestaurants.map((restaurant) => {
                const subscription = subscriptions.find(s => s.restaurant_id === restaurant.id);
                return (
                  <tr key={restaurant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.logo && (
                          <img
                            className="h-8 w-8 rounded-full object-cover mr-3"
                            src={restaurant.logo}
                            alt={restaurant.name}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRestaurantStatusBadge(restaurant.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubscriptionBadge(subscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};