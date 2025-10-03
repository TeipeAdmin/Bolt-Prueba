import React, { useState, useEffect } from 'react';
import { Eye, CreditCard as Edit, Trash2, CheckCircle, XCircle, Filter, ExternalLink, Settings } from 'lucide-react';
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
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_type: 'gratis' as Subscription['plan_type'],
    duration: 'monthly' as Subscription['duration'],
    status: 'active' as Subscription['status'],
  });
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const toggleRestaurantStatus = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;
    
    const newStatus = restaurant.status === 'active' ? 'inactive' : 'active';
    const updatedRestaurants = restaurants.map(restaurant => 
      restaurant.id === restaurantId 
        ? { ...restaurant, status: newStatus, updated_at: new Date().toISOString() }
        : restaurant
    );
    
    setRestaurants(updatedRestaurants);
    saveToStorage('restaurants', updatedRestaurants);
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

    // Update restaurant status based on subscription
    const updatedRestaurants = restaurants.map(restaurant =>
      restaurant.id === editingRestaurant.id
        ? { 
            ...restaurant, 
            status: subscriptionForm.status === 'active' ? 'active' : 'inactive',
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

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && restaurant.status === filter;
  });

  const getStatusBadge = (status: Restaurant['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activo</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactivo</Badge>;
      default:
        return <Badge variant="gray">Inactivo</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: Subscription | undefined) => {
    if (!subscription) return <Badge variant="gray">Sin suscripción</Badge>;

    const planName = subscription.plan_type === 'gratis' ? 'Gratis' :
                     subscription.plan_type === 'basic' ? 'Basic' :
                     subscription.plan_type === 'pro' ? 'Pro' :
                     subscription.plan_type === 'business' ? 'Business' :
                     subscription.plan_type.toUpperCase();

    switch (subscription.status) {
      case 'active':
        return <Badge variant="success">{planName}</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactiva</Badge>;
      default:
        return <Badge variant="gray">Inactiva</Badge>;
    }
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
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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
                      {getStatusBadge(restaurant.status)}
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
                          icon={restaurant.status === 'active' ? XCircle : CheckCircle}
                          onClick={() => toggleRestaurantStatus(restaurant.id)}
                          className={restaurant.status === 'active' 
                            ? "text-red-600 hover:text-red-700" 
                            : "text-green-600 hover:text-green-700"
                          }
                          title={restaurant.status === 'active' ? 'Desactivar' : 'Activar'}
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
                {getStatusBadge(selectedRestaurant.status)}
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
    </div>
  );
};