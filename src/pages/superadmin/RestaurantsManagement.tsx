import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Filter, ExternalLink, Settings, Plus } from 'lucide-react';
import { Restaurant, Subscription } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const RestaurantsManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_type: 'gratis' as Subscription['plan_type'],
    duration: 'monthly' as Subscription['duration'],
    status: 'active' as Subscription['status'],
  });
  const [newRestaurantForm, setNewRestaurantForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  });
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const restaurantData = loadFromStorage('restaurants') || [];
    const subscriptionData = loadFromStorage('subscriptions') || [];
    setRestaurants(restaurantData);
    setSubscriptions(subscriptionData);
  };

  const getSubscription = (restaurantId: string) => {
    return subscriptions.find(sub => sub.restaurant_id === restaurantId);
  };

  const isRestaurantActive = (restaurantId: string) => {
    const subscription = getSubscription(restaurantId);
    return subscription?.status === 'active';
  };

  const handleEditSubscription = (restaurant: Restaurant) => {
    const subscription = getSubscription(restaurant.id);
    setEditingRestaurant(restaurant);
    
    if (subscription) {
      setSubscriptionForm({
        plan_type: subscription.plan_type,
        duration: subscription.duration,
        status: subscription.status,
      });
    } else {
      setSubscriptionForm({
        plan_type: 'gratis',
        duration: 'monthly',
        status: 'active',
      });
    }
    setShowSubscriptionModal(true);
  };

  const saveSubscription = () => {
    if (!editingRestaurant) return;

    const existingSubscription = getSubscription(editingRestaurant.id);
    const allSubscriptions = loadFromStorage('subscriptions') || [];
    
    if (existingSubscription) {
      // Update existing subscription
      const updatedSubscriptions = allSubscriptions.map((sub: Subscription) =>
        sub.id === existingSubscription.id
          ? { 
              ...sub, 
              ...subscriptionForm,
              start_date: new Date().toISOString(),
              end_date: getEndDate(subscriptionForm.duration),
            }
          : sub
      );
      saveToStorage('subscriptions', updatedSubscriptions);
    } else {
      // Create new subscription
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        restaurant_id: editingRestaurant.id,
        ...subscriptionForm,
        start_date: new Date().toISOString(),
        end_date: getEndDate(subscriptionForm.duration),
        auto_renew: true,
        created_at: new Date().toISOString(),
      };
      saveToStorage('subscriptions', [...allSubscriptions, newSubscription]);
    }

    // Update restaurant subscription_id if needed
    const updatedRestaurants = restaurants.map(restaurant =>
      restaurant.id === editingRestaurant.id
        ? {
            ...restaurant,
            subscription_id: existingSubscription?.id || `sub-${Date.now()}`,
            updated_at: new Date().toISOString()
          }
        : restaurant
    );

    setRestaurants(updatedRestaurants);
    saveToStorage('restaurants', updatedRestaurants);
    
    loadData();
    setShowSubscriptionModal(false);
    setEditingRestaurant(null);
  };

  const getEndDate = (duration: Subscription['duration']) => {
    const now = new Date();
    switch (duration) {
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      case 'annual':
        now.setFullYear(now.getFullYear() + 1);
        break;
    }
    return now.toISOString();
  };

  const filteredRestaurants = restaurants
    .filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by date range
      if (startDate || endDate) {
        const restaurantDate = new Date(restaurant.created_at);
        if (startDate && restaurantDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (restaurantDate > end) return false;
        }
      }

      if (filter === 'all') return matchesSearch;

      const isActive = isRestaurantActive(restaurant.id);
      if (filter === 'active') return matchesSearch && isActive;
      if (filter === 'inactive') return matchesSearch && !isActive;

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const getRestaurantStatusBadge = (restaurantId: string) => {
    const subscription = getSubscription(restaurantId);
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

  const handleCreateRestaurant = () => {
    if (!newRestaurantForm.name || !newRestaurantForm.email) {
      alert('Por favor completa al menos el nombre y email del restaurante');
      return;
    }

    const restaurantId = `rest-${Date.now()}`;
    const slug = newRestaurantForm.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newRestaurant: Restaurant = {
      id: restaurantId,
      name: newRestaurantForm.name,
      slug: slug,
      email: newRestaurantForm.email,
      phone: newRestaurantForm.phone,
      address: newRestaurantForm.address,
      description: newRestaurantForm.description,
      owner_id: '',
      owner_name: '',
      domain: slug,
      settings: {
        currency: 'USD',
        language: 'es',
        timezone: 'America/Bogota',
        social_media: {
          facebook: '',
          instagram: '',
          whatsapp: newRestaurantForm.phone || '',
        },
        ui_settings: {
          show_search_bar: true,
          info_message: 'Agrega los productos que desees al carrito',
          layout_type: 'list',
        },
        theme: {
          primary_color: '#dc2626',
          secondary_color: '#f3f4f6',
          accent_color: '#16a34a',
          text_color: '#1f2937',
          primary_font: 'Inter',
          secondary_font: 'Poppins',
          font_sizes: {
            title: '32px',
            subtitle: '24px',
            normal: '16px',
            small: '14px',
          },
          font_weights: {
            light: 300,
            regular: 400,
            medium: 500,
            bold: 700,
          },
          button_style: 'rounded',
        },
        business_hours: {
          monday: { open: '09:00', close: '18:00', is_open: true },
          tuesday: { open: '09:00', close: '18:00', is_open: true },
          wednesday: { open: '09:00', close: '18:00', is_open: true },
          thursday: { open: '09:00', close: '18:00', is_open: true },
          friday: { open: '09:00', close: '18:00', is_open: true },
          saturday: { open: '09:00', close: '18:00', is_open: true },
          sunday: { open: '09:00', close: '18:00', is_open: false },
        },
        delivery: {
          enabled: false,
          zones: [],
          min_order_amount: 0,
        },
        table_orders: {
          enabled: false,
          table_numbers: 0,
          qr_codes: false,
          auto_assign: false,
        },
        notifications: {
          email: newRestaurantForm.email,
          whatsapp: newRestaurantForm.phone,
          sound_enabled: true,
        },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create subscription
    const subscriptionId = `sub-${Date.now()}`;
    const newSubscription: Subscription = {
      id: subscriptionId,
      restaurant_id: restaurantId,
      plan_type: 'gratis',
      duration: 'monthly',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: '2099-12-31T23:59:59Z',
      auto_renew: false,
      created_at: new Date().toISOString(),
    };

    newRestaurant.subscription_id = subscriptionId;

    const updatedRestaurants = [...restaurants, newRestaurant];
    const allSubscriptions = loadFromStorage('subscriptions') || [];
    const updatedSubscriptions = [...allSubscriptions, newSubscription];

    saveToStorage('restaurants', updatedRestaurants);
    saveToStorage('subscriptions', updatedSubscriptions);

    setNewRestaurantForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      description: '',
    });
    setShowCreateModal(false);
    loadData();
  };

  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setShowDeleteModal(true);
  };

  const confirmDeleteRestaurant = () => {
    if (!restaurantToDelete) return;

    // Delete restaurant
    const updatedRestaurants = restaurants.filter(r => r.id !== restaurantToDelete.id);
    saveToStorage('restaurants', updatedRestaurants);

    // Delete associated subscription
    const allSubscriptions = loadFromStorage('subscriptions') || [];
    const updatedSubscriptions = allSubscriptions.filter((sub: Subscription) => sub.restaurant_id !== restaurantToDelete.id);
    saveToStorage('subscriptions', updatedSubscriptions);

    // Delete associated data (categories, products, orders)
    const allCategories = loadFromStorage('categories') || [];
    const updatedCategories = allCategories.filter((cat: any) => cat.restaurant_id !== restaurantToDelete.id);
    saveToStorage('categories', updatedCategories);

    const allProducts = loadFromStorage('products') || [];
    const updatedProducts = allProducts.filter((prod: any) => prod.restaurant_id !== restaurantToDelete.id);
    saveToStorage('products', updatedProducts);

    const allOrders = loadFromStorage('orders') || [];
    const updatedOrders = allOrders.filter((order: any) => order.restaurant_id !== restaurantToDelete.id);
    saveToStorage('orders', updatedOrders);

    loadData();
    setShowDeleteModal(false);
    setRestaurantToDelete(null);
  };

  const getPublicMenuUrl = (restaurant: Restaurant) => {
    return `${window.location.origin}/${restaurant.domain}`;
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Restaurantes</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Crear Restaurante
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
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
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
            {(startDate || endDate || sortBy !== 'newest') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSortBy('newest');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menú Público
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRestaurants.map((restaurant) => {
                const subscription = getSubscription(restaurant.id);
                return (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.logo && (
                          <img
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            src={restaurant.logo}
                            alt={restaurant.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.domain}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{restaurant.email}</div>
                      {restaurant.phone && (
                        <div className="text-sm text-gray-500">{restaurant.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRestaurantStatusBadge(restaurant.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubscriptionBadge(subscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={getPublicMenuUrl(restaurant)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver Menú
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setShowModal(true);
                          }}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Settings}
                          onClick={() => handleEditSubscription(restaurant)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Gestionar Suscripción"
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteRestaurant(restaurant)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar Restaurante"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restaurant Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRestaurant(null);
        }}
        title="Detalles del Restaurante"
        size="lg"
      >
        {selectedRestaurant && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium mb-4">Información Básica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Propietario</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.owner_name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-sm text-gray-900">{selectedRestaurant.phone || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            {selectedRestaurant.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <p className="text-sm text-gray-900">{selectedRestaurant.address}</p>
              </div>
            )}

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Dominio</label>
              <p className="text-sm text-gray-900">{selectedRestaurant.domain}</p>
              <a
                href={getPublicMenuUrl(selectedRestaurant)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-1"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Ver Menú Público
              </a>
            </div>

            {/* Status and Subscription */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                {getRestaurantStatusBadge(selectedRestaurant.id)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Suscripción</label>
                {getSubscriptionBadge(getSubscription(selectedRestaurant.id))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedRestaurant.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedRestaurant.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Subscription Management Modal */}
      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setEditingRestaurant(null);
        }}
        title="Gestionar Suscripción"
        size="md"
      >
        {editingRestaurant && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Configurando suscripción para: <strong>{editingRestaurant.name}</strong>
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Plan
                  </label>
                  <select
                    value={subscriptionForm.plan_type}
                    onChange={(e) => setSubscriptionForm(prev => ({
                      ...prev,
                      plan_type: e.target.value as Subscription['plan_type']
                    }))}
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
                    value={subscriptionForm.duration}
                    onChange={(e) => setSubscriptionForm(prev => ({ 
                      ...prev, 
                      duration: e.target.value as Subscription['duration'] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="annual">Anual</option>
                  </select>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={subscriptionForm.status}
                    onChange={(e) => setSubscriptionForm(prev => ({
                      ...prev,
                      status: e.target.value as Subscription['status']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Activa</option>
                    <option value="expired">Vencida</option>
                  </select>
                </div>
              </div>
            </div>
                </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setEditingRestaurant(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={saveSubscription}>
                Guardar Suscripción
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Restaurant Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRestaurantToDelete(null);
        }}
        title="Confirmar Eliminación"
        size="md"
      >
        {restaurantToDelete && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar restaurante "{restaurantToDelete.name}"?
              </h3>
              <p className="text-gray-600 mb-4">
                Esta acción eliminará permanentemente:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ul className="text-sm text-red-800 space-y-1 text-left">
                  <li>• Toda la información del restaurante</li>
                  <li>• Suscripción activa</li>
                  <li>• Categorías y productos</li>
                  <li>• Historial de pedidos</li>
                  <li>• Configuraciones personalizadas</li>
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
                  setRestaurantToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteRestaurant}
                icon={Trash2}
              >
                Eliminar Restaurante
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Restaurant Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewRestaurantForm({
            name: '',
            email: '',
            phone: '',
            address: '',
            description: '',
          });
        }}
        title="Crear Nuevo Restaurante"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Restaurante *
            </label>
            <Input
              value={newRestaurantForm.name}
              onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, name: e.target.value })}
              placeholder="Ej: Restaurante Mi Sabor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={newRestaurantForm.email}
              onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, email: e.target.value })}
              placeholder="contacto@restaurante.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <Input
              type="tel"
              value={newRestaurantForm.phone}
              onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, phone: e.target.value })}
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <Input
              value={newRestaurantForm.address}
              onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, address: e.target.value })}
              placeholder="Calle 123 #45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={newRestaurantForm.description}
              onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, description: e.target.value })}
              placeholder="Breve descripción del restaurante..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El restaurante se creará con:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Plan Gratis activo</li>
              <li>• Configuración predeterminada</li>
              <li>• Sin usuarios asignados (asignar desde Gestión de Usuarios)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setNewRestaurantForm({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  description: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRestaurant}
              icon={Plus}
            >
              Crear Restaurante
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};