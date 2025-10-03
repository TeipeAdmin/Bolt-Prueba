import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, Plus, CreditCard as Edit } from 'lucide-react';
import { Subscription, Restaurant } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const SubscriptionsManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    plan_type: 'basic' as Subscription['plan_type'],
    duration: 'monthly' as Subscription['duration'],
    start_date: '',
    end_date: '',
    status: 'active' as Subscription['status'],
    auto_renew: true,
  });
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'expiring'>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const subscriptionData = loadFromStorage('subscriptions') || [];
    const restaurantData = loadFromStorage('restaurants') || [];

    // Remove duplicate subscriptions based on restaurant_id
    const uniqueSubscriptions = subscriptionData.reduce((acc: Subscription[], current: Subscription) => {
      const duplicate = acc.find(sub => sub.restaurant_id === current.restaurant_id);
      if (!duplicate) {
        acc.push(current);
      } else {
        // Keep the most recent one
        const existingIndex = acc.findIndex(sub => sub.restaurant_id === current.restaurant_id);
        if (new Date(current.created_at) > new Date(acc[existingIndex].created_at)) {
          acc[existingIndex] = current;
        }
      }
      return acc;
    }, []);

    // Auto-expire subscriptions based on end date
    const now = new Date();
    const updatedSubscriptions = uniqueSubscriptions.map(sub => {
      const endDate = new Date(sub.end_date);

      // If subscription is expired and not 'gratis' plan, mark as expired
      if (endDate < now && sub.plan_type !== 'gratis' && sub.status === 'active') {
        return { ...sub, status: 'expired' as const };
      }
      return sub;
    });

    setSubscriptions(updatedSubscriptions);
    setRestaurants(restaurantData);

    // Save the updated subscriptions back to storage
    if (JSON.stringify(updatedSubscriptions) !== JSON.stringify(uniqueSubscriptions)) {
      saveToStorage('subscriptions', updatedSubscriptions);
    }
  };

  const getRestaurant = (restaurantId: string) => {
    return restaurants.find(restaurant => restaurant.id === restaurantId);
  };

  const updateSubscriptionStatus = (subscriptionId: string, newStatus: Subscription['status']) => {
    const updatedSubscriptions = subscriptions.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, status: newStatus }
        : sub
    );
    
    setSubscriptions(updatedSubscriptions);
    saveToStorage('subscriptions', updatedSubscriptions);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      plan_type: subscription.plan_type,
      duration: subscription.duration,
      start_date: subscription.start_date.split('T')[0],
      end_date: subscription.end_date.split('T')[0],
      status: subscription.status,
      auto_renew: subscription.auto_renew,
    });
    setShowEditModal(true);
  };

  const handleSaveSubscription = () => {
    if (!editingSubscription) return;

    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === editingSubscription.id
        ? {
            ...sub,
            ...formData,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
          }
        : sub
    );

    setSubscriptions(updatedSubscriptions);
    saveToStorage('subscriptions', updatedSubscriptions);
    setShowEditModal(false);
    setEditingSubscription(null);
  };

  const extendSubscription = (subscriptionId: string, months: number) => {
    const updatedSubscriptions = subscriptions.map(sub => {
      if (sub.id === subscriptionId) {
        const currentEndDate = new Date(sub.end_date);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + months);
        
        return {
          ...sub,
          end_date: newEndDate.toISOString(),
          status: 'active' as const
        };
      }
      return sub;
    });
    
    setSubscriptions(updatedSubscriptions);
    saveToStorage('subscriptions', updatedSubscriptions);
  };

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activa</Badge>;
      case 'expired':
        return <Badge variant="error">Vencida</Badge>;
      default:
        return <Badge variant="gray">Desconocido</Badge>;
    }
  };

  const getPlanBadge = (planType: Subscription['plan_type']) => {
    switch (planType) {
      case 'gratis':
        return <Badge variant="gray">Gratis</Badge>;
      case 'basic':
        return <Badge variant="info">Basic</Badge>;
      case 'pro':
        return <Badge variant="success">Pro</Badge>;
      case 'business':
        return <Badge variant="error">Business</Badge>;
      case 'premium':
        return <Badge variant="success">Premium</Badge>;
      case 'enterprise':
        return <Badge variant="error">Enterprise</Badge>;
      case 'trial':
        return <Badge variant="warning">Prueba</Badge>;
      default:
        return <Badge variant="gray">Desconocido</Badge>;
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Suscripciones</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vencidas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => s.status === 'expired').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Por Vencer (7 días)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => isExpiringSoon(s.end_date)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plan Gratis</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(s => s.plan_type === 'gratis').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <Input
              placeholder="Buscar por restaurante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los planes</option>
                <option value="gratis">Gratis</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activa</option>
                <option value="expired">Vencida</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento (desde)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento (hasta)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'expiring')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
                <option value="expiring">Próximo a expirar</option>
              </select>
            </div>
            {(filterPlan !== 'all' || filterStatus !== 'all' || startDate || endDate || sortBy !== 'newest' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterPlan('all');
                  setFilterStatus('all');
                  setStartDate('');
                  setEndDate('');
                  setSortBy('newest');
                  setSearchTerm('');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions
                .filter(subscription => {
                  // Filter by search term (restaurant name)
                  if (searchTerm) {
                    const restaurant = getRestaurant(subscription.restaurant_id);
                    if (!restaurant || !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                      return false;
                    }
                  }

                  // Filter by plan
                  if (filterPlan !== 'all' && subscription.plan_type !== filterPlan) return false;

                  // Filter by status
                  if (filterStatus !== 'all' && subscription.status !== filterStatus) return false;

                  // Filter by date range (using end_date - fecha de vencimiento)
                  if (startDate || endDate) {
                    const subDate = new Date(subscription.end_date);
                    if (startDate && subDate < new Date(startDate)) return false;
                    if (endDate) {
                      const end = new Date(endDate);
                      end.setHours(23, 59, 59, 999);
                      if (subDate > end) return false;
                    }
                  }

                  return true;
                })
                .sort((a, b) => {
                  if (sortBy === 'newest') {
                    return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
                  } else if (sortBy === 'oldest') {
                    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
                  } else { // expiring
                    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
                  }
                })
                .map((subscription) => {
                const restaurant = getRestaurant(subscription.restaurant_id);
                const expiringSoon = isExpiringSoon(subscription.end_date);
                const expired = isExpired(subscription.end_date);
                
                return (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {restaurant?.name || 'Restaurante no encontrado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {restaurant?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(subscription.plan_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subscription.status)}
                        {expiringSoon && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        {expired && <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.duration === 'monthly' && 'Mensual'}
                      {subscription.duration === 'quarterly' && 'Trimestral'}
                      {subscription.duration === 'annual' && 'Anual'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subscription.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditSubscription(subscription)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowModal(true);
                          }}
                        >
                          Ver
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => extendSubscription(subscription.id, 1)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Extender
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSubscription(null);
        }}
        title="Detalles de Suscripción"
        size="lg"
      >
        {selectedSubscription && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Restaurante</label>
                <p className="text-sm text-gray-900">
                  {getRestaurant(selectedSubscription.restaurant_id)?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                {getPlanBadge(selectedSubscription.plan_type)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                {getStatusBadge(selectedSubscription.status)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duración</label>
                <p className="text-sm text-gray-900">
                  {selectedSubscription.duration === 'monthly' && 'Mensual'}
                  {selectedSubscription.duration === 'quarterly' && 'Trimestral'}
                  {selectedSubscription.duration === 'annual' && 'Anual'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSubscription.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSubscription.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Renovación Automática</label>
                <Badge variant={selectedSubscription.auto_renew ? 'success' : 'gray'}>
                  {selectedSubscription.auto_renew ? 'Habilitada' : 'Deshabilitada'}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSubscription.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => extendSubscription(selectedSubscription.id, 1)}
                variant="outline"
              >
                Extender 1 mes
              </Button>
              <Button
                onClick={() => extendSubscription(selectedSubscription.id, 3)}
                variant="outline"
              >
                Extender 3 meses
              </Button>
              <Button
                onClick={() => extendSubscription(selectedSubscription.id, 12)}
                variant="primary"
              >
                Extender 1 año
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSubscription(null);
        }}
        title="Editar Suscripción"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Plan
              </label>
              <select
                value={formData.plan_type}
                onChange={(e) => setFormData(prev => ({ ...prev, plan_type: e.target.value as Subscription['plan_type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gratis">Gratis</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value as Subscription['duration'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Subscription['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activa</option>
                <option value="expired">Vencida</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.auto_renew}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_renew: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Renovación Automática
              </label>
            </div>

            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            />

            <Input
              label="Fecha de Vencimiento"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                setEditingSubscription(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveSubscription}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};