import React, { useState, useEffect } from 'react';
import { Store, Users, CreditCard, TrendingUp, Calendar, RefreshCw, DollarSign, Activity, Clock } from 'lucide-react';
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard Principal</h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Vista general del sistema Platyo
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleResetData}
            className="shadow-sm"
          >
            Reiniciar Datos
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Store className="h-6 w-6 text-white" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Total Restaurantes</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{stats.totalRestaurants}</p>
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
              {stats.activeRestaurants} activos
            </span>
            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
              {stats.inactiveRestaurants} inactivos
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Plan Gratis</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{stats.gratisPlan}</p>
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-600 font-medium">
              Sin costo mensual
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Plan Basic</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{stats.basicPlan}</p>
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
              $15/mes
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Plan Pro</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{stats.proPlan}</p>
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
              $35/mes
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Plan Business</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{stats.businessPlan}</p>
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
              $75/mes
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Suscripciones Activas</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{stats.activeSubscriptions}</p>
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
              {stats.expiredSubscriptions} vencidas
            </span>
          </div>
        </div>
      </div>

      {/* Recent Restaurants */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            Restaurantes Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Restaurante
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Suscripción
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recentRestaurants.map((restaurant) => {
                const subscription = subscriptions.find(s => s.restaurant_id === restaurant.id);
                return (
                  <tr key={restaurant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.logo ? (
                          <img
                            className="h-10 w-10 rounded-xl object-cover mr-3 shadow-sm"
                            src={restaurant.logo}
                            alt={restaurant.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3 shadow-sm">
                            <Store className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="text-sm font-semibold text-slate-900">
                          {restaurant.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {restaurant.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRestaurantStatusBadge(restaurant.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubscriptionBadge(subscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(restaurant.created_at).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
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