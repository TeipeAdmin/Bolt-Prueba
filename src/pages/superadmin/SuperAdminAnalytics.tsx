import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Store, Calendar, DollarSign, Filter } from 'lucide-react';
import { Restaurant, Subscription, User } from '../../types';
import { loadFromStorage } from '../../data/mockData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SuperAdminAnalytics: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const restaurantData = loadFromStorage('restaurants') || [];
    const subscriptionData = loadFromStorage('subscriptions') || [];
    const userData = loadFromStorage('users') || [];
    
    setRestaurants(restaurantData);
    setSubscriptions(subscriptionData);
    setUsers(userData);
  }, []);

  // Filter subscriptions based on selected filters
  const getFilteredSubscriptions = () => {
    let filtered = [...subscriptions];

    // Filter by plan
    if (selectedPlanFilter !== 'all') {
      filtered = filtered.filter(s => s.plan_type === selectedPlanFilter);
    }

    // Filter by period (only if custom dates are not set)
    if (selectedPeriodFilter !== 'all' && !startDate && !endDate) {
      const now = new Date();
      const periodStartDate = new Date();

      switch (selectedPeriodFilter) {
        case 'today':
          periodStartDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          periodStartDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStartDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          periodStartDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(s => new Date(s.created_at) >= periodStartDate);
    }

    // Filter by custom date range
    if (startDate || endDate) {
      filtered = filtered.filter(s => {
        const subDate = new Date(s.created_at);
        if (startDate && subDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (subDate > end) return false;
        }
        return true;
      });
    }

    return filtered;
  };

  // Filter subscriptions first
  const filteredSubscriptions = getFilteredSubscriptions();

  // Calculate analytics based on filtered data
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  const pendingRestaurants = restaurants.filter(r => r.status === 'pending').length;
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.email_verified).length;

  // Subscription stats from filtered data
  const activeSubscriptions = filteredSubscriptions.filter(s => s.status === 'active').length;
  const expiredSubscriptions = filteredSubscriptions.filter(s => s.status === 'expired').length;
  const totalFilteredSubscriptions = filteredSubscriptions.length;

  // Monthly registrations
  const getMonthlyRegistrations = () => {
    const monthlyData: { [key: string]: number } = {};

    restaurants.forEach(restaurant => {
      const date = new Date(restaurant.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  const monthlyRegistrations = getMonthlyRegistrations();

  // Plan distribution from filtered data
  const planDistribution = {
    gratis: filteredSubscriptions.filter(s => s.plan_type === 'gratis').length,
    basic: filteredSubscriptions.filter(s => s.plan_type === 'basic').length,
    pro: filteredSubscriptions.filter(s => s.plan_type === 'pro').length,
    business: filteredSubscriptions.filter(s => s.plan_type === 'business').length,
  };

  // Plan prices (monthly) - Updated with correct prices
  const planPrices: Record<string, number> = {
    gratis: 0,
    basic: 15,
    pro: 35,
    business: 75,
  };

  // Duration multipliers
  const durationMultipliers: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    annual: 12,
  };

  // Calculate economic statistics
  const calculateRevenue = (subs: Subscription[]) => {
    return subs.reduce((total, sub) => {
      const basePrice = planPrices[sub.plan_type] || 0;
      const multiplier = durationMultipliers[sub.duration] || 1;
      return total + (basePrice * multiplier);
    }, 0);
  };

  const totalRevenue = calculateRevenue(filteredSubscriptions.filter(s => s.status === 'active'));
  const potentialRevenue = calculateRevenue(filteredSubscriptions);

  // Monthly recurring revenue (MRR)
  const calculateMRR = () => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, sub) => {
        const basePrice = planPrices[sub.plan_type] || 0;
        return total + basePrice;
      }, 0);
  };

  const mrr = calculateMRR();

  // Revenue by plan
  const revenueByPlan = {
    gratis: calculateRevenue(filteredSubscriptions.filter(s => s.plan_type === 'gratis')),
    basic: calculateRevenue(filteredSubscriptions.filter(s => s.plan_type === 'basic')),
    pro: calculateRevenue(filteredSubscriptions.filter(s => s.plan_type === 'pro')),
    business: calculateRevenue(filteredSubscriptions.filter(s => s.plan_type === 'business')),
  };

  // Expiring subscriptions alert
  const expiringSoon = subscriptions.filter(sub => {
    const endDate = new Date(sub.end_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas del Sistema</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los planes</option>
                <option value="gratis">Gratis</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select
                value={selectedPeriodFilter}
                onChange={(e) => setSelectedPeriodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!!(startDate || endDate)}
              >
                <option value="all">Todo el tiempo</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="year">Último año</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {(selectedPlanFilter !== 'all' || selectedPeriodFilter !== 'all' || startDate || endDate) && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPlanFilter('all');
                  setSelectedPeriodFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Economic Stats */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-sm border border-green-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-600" />
          Estadísticas Económicas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Suscripciones activas filtradas</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-gray-600">MRR (Ingreso Recurrente Mensual)</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ${mrr.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Todas las suscripciones activas</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-gray-600">Potencial de Ingresos</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ${potentialRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Incluye todas las suscripciones filtradas</p>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Ingresos por Plan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gratis</p>
              <p className="text-lg font-bold text-gray-900">${revenueByPlan.gratis.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{planDistribution.gratis} suscripciones</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Basic</p>
              <p className="text-lg font-bold text-blue-900">${revenueByPlan.basic.toFixed(2)}</p>
              <p className="text-xs text-blue-600 mt-1">{planDistribution.basic} suscripciones</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Pro</p>
              <p className="text-lg font-bold text-purple-900">${revenueByPlan.pro.toFixed(2)}</p>
              <p className="text-xs text-purple-600 mt-1">{planDistribution.pro} suscripciones</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-600 mb-1">Business</p>
              <p className="text-lg font-bold text-orange-900">${revenueByPlan.business.toFixed(2)}</p>
              <p className="text-xs text-orange-600 mt-1">{planDistribution.business} suscripciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              {verifiedUsers} verificados
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suscripciones</p>
              <p className="text-2xl font-semibold text-gray-900">{totalFilteredSubscriptions}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              {activeSubscriptions} activas
            </span>
            <span className="text-sm text-gray-400 mx-1">•</span>
            <span className="text-sm text-red-600 font-medium">
              {expiredSubscriptions} vencidas
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
              <p className="text-2xl font-semibold text-gray-900">
                {monthlyRegistrations.length > 0 ? monthlyRegistrations[monthlyRegistrations.length - 1][1] : 0}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-purple-600 font-medium">
              Este mes
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registrations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Registros por Mes
          </h3>
          <div className="space-y-3">
            {monthlyRegistrations.map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...monthlyRegistrations.map(([, c]) => c))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Distribución de Planes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gratis</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${totalFilteredSubscriptions > 0 ? (planDistribution.gratis / totalFilteredSubscriptions) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{planDistribution.gratis}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Basic</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${totalFilteredSubscriptions > 0 ? (planDistribution.basic / totalFilteredSubscriptions) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{planDistribution.basic}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pro</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${totalFilteredSubscriptions > 0 ? (planDistribution.pro / totalFilteredSubscriptions) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{planDistribution.pro}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Business</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${totalFilteredSubscriptions > 0 ? (planDistribution.business / totalFilteredSubscriptions) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{planDistribution.business}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Rendimiento por Plan</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Gratis Plan */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Plan Gratis</span>
                  <Badge variant="default">{planDistribution.gratis} suscripciones</Badge>
                </div>
                <div className="text-xs text-gray-600">
                  Ingreso: $0.00/mes
                </div>
              </div>

              {/* Basic Plan */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Plan Basic</span>
                  <Badge variant="info">{planDistribution.basic} suscripciones</Badge>
                </div>
                <div className="text-xs text-blue-600">
                  Ingreso: ${(planDistribution.basic * planPrices.basic).toFixed(2)}/mes
                </div>
              </div>

              {/* Pro Plan */}
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Plan Pro</span>
                  <Badge variant="success">{planDistribution.pro} suscripciones</Badge>
                </div>
                <div className="text-xs text-green-600">
                  Ingreso: ${(planDistribution.pro * planPrices.pro).toFixed(2)}/mes
                </div>
              </div>

              {/* Business Plan */}
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700">Plan Business</span>
                  <Badge variant="warning">{planDistribution.business} suscripciones</Badge>
                </div>
                <div className="text-xs text-orange-600">
                  Ingreso: ${(planDistribution.business * planPrices.business).toFixed(2)}/mes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Subscriptions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Suscripciones por Vencer</h3>
          </div>
          <div className="p-6">
            {expiringSoon.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay suscripciones próximas a vencer
              </p>
            ) : (
              <div className="space-y-4">
                {expiringSoon.map(subscription => {
                  const restaurant = restaurants.find(r => r.id === subscription.restaurant_id);
                  const daysLeft = Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={subscription.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{restaurant?.name}</p>
                        <p className="text-xs text-gray-500">
                          Vence en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="warning">
                        {subscription.plan_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};