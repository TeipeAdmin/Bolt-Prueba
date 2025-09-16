import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Eye, EyeOff, Globe, Mail, Phone, MapPin, Clock, Truck, QrCode, Palette, Bell, Facebook, Instagram, Twitter, MessageCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Restaurant, RestaurantSettings as RestaurantSettingsType } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const RestaurantSettings: React.FC = () => {
  const { restaurant, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettingsType | null>(null);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: '',
    owner_name: '',
  });

  useEffect(() => {
    if (restaurant) {
      setSettings(restaurant.settings);
      setRestaurantInfo({
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        description: restaurant.description || '',
        logo: restaurant.logo || '',
        owner_name: restaurant.owner_name || '',
      });
    }
  }, [restaurant]);

  const handleSaveGeneral = async () => {
    if (!restaurant || !settings) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? {
              ...r,
              ...restaurantInfo,
              settings: {
                ...settings,
                language: language,
              },
              updated_at: new Date().toISOString(),
            }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = updatedRestaurants.find((r: Restaurant) => r.id === restaurant.id);
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Configuración Guardada',
        'La configuración general ha sido actualizada exitosamente.',
        4000
      );
    } catch (error) {
      showToast(
        'error',
        'Error',
        'Hubo un problema al guardar la configuración.',
        4000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegional = async () => {
    if (!restaurant || !settings) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? {
              ...r,
              settings: {
                ...r.settings,
                ...settings,
                language: language,
              },
              updated_at: new Date().toISOString(),
            }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = updatedRestaurants.find((r: Restaurant) => r.id === restaurant.id);
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Configuración Regional Guardada',
        'La configuración regional ha sido actualizada exitosamente.',
        4000
      );
    } catch (error) {
      showToast(
        'error',
        'Error',
        'Hubo un problema al guardar la configuración regional.',
        4000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOperational = async () => {
    if (!restaurant || !settings) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? {
              ...r,
              settings: {
                ...r.settings,
                ...settings,
              },
              updated_at: new Date().toISOString(),
            }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = updatedRestaurants.find((r: Restaurant) => r.id === restaurant.id);
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Configuración Operacional Guardada',
        'La configuración operacional ha sido actualizada exitosamente.',
        4000
      );
    } catch (error) {
      showToast(
        'error',
        'Error',
        'Hubo un problema al guardar la configuración operacional.',
        4000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!restaurant || !settings) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? {
              ...r,
              settings: {
                ...r.settings,
                ...settings,
              },
              updated_at: new Date().toISOString(),
            }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = updatedRestaurants.find((r: Restaurant) => r.id === restaurant.id);
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Tema Guardado',
        'La configuración del tema ha sido actualizada exitosamente.',
        4000
      );
    } catch (error) {
      showToast(
        'error',
        'Error',
        'Hubo un problema al guardar el tema.',
        4000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSocial = async () => {
    if (!restaurant || !settings) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? {
              ...r,
              settings: {
                ...r.settings,
                ...settings,
              },
              updated_at: new Date().toISOString(),
            }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = updatedRestaurants.find((r: Restaurant) => r.id === restaurant.id);
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Redes Sociales Guardadas',
        'La configuración de redes sociales ha sido actualizada exitosamente.',
        4000
      );
    } catch (error) {
      showToast(
        'error',
        'Error',
        'Hubo un problema al guardar las redes sociales.',
        4000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!restaurant || !settings) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? {
              ...r,
              settings: {
                ...r.settings,
                ...settings,
              },
              updated_at: new Date().toISOString(),
            }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = updatedRestaurants.find((r: Restaurant) => r.id === restaurant.id);
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Notificaciones Guardadas',
        'La configuración de notificaciones ha sido actualizada exitosamente.',
        4000
      );
    } catch (error) {
      showToast(
        'error',
        'Error',
        'Hubo un problema al guardar las notificaciones.',
        4000
      );
    } finally {
      setLoading(false);
    }
  };

  const getPublicMenuUrl = () => {
    return `${window.location.origin}/${restaurant?.domain}`;
  };

  if (!restaurant || !settings) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: t('generalSettings'), icon: Globe },
    { id: 'regional', name: t('regionalSettings'), icon: MapPin },
    { id: 'operational', name: t('operationalSettings'), icon: Clock },
    { id: 'theme', name: t('themeSettings'), icon: Palette },
    { id: 'social', name: t('socialMedia'), icon: MessageCircle },
    { id: 'notifications', name: t('notifications'), icon: Bell },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
        <div className="flex items-center gap-3">
          <a
            href={getPublicMenuUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Ver Menú Público
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('restaurantInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={`${t('restaurantName')} *`}
                    value={restaurantInfo.name}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre de tu restaurante"
                  />

                  <Input
                    label={t('ownerName')}
                    value={restaurantInfo.owner_name}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, owner_name: e.target.value }))}
                    placeholder="Nombre del propietario"
                  />

                  <Input
                    label={`${t('email')} *`}
                    type="email"
                    value={restaurantInfo.email}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contacto@mirestaurante.com"
                  />

                  <Input
                    label={t('phone')}
                    value={restaurantInfo.phone}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="mt-6">
                  <Input
                    label={t('address')}
                    value={restaurantInfo.address}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Dirección completa del restaurante"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('description')}
                  </label>
                  <textarea
                    value={restaurantInfo.description}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción breve de tu restaurante..."
                  />
                </div>

                {/* Logo Section - Improved Design */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Logo del Restaurante
                  </label>
                  
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Logo Preview */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {restaurantInfo.logo ? (
                          <img
                            src={restaurantInfo.logo}
                            alt="Logo preview"
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Sin logo</p>
                          </div>
                        )}
                        {restaurantInfo.logo && (
                          <div className="hidden text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Error al cargar</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo URL Input */}
                    <div className="flex-1 space-y-3">
                      <div className="relative">
                        <Input
                          label="URL del Logo"
                          value={restaurantInfo.logo}
                          onChange={(e) => setRestaurantInfo(prev => ({ ...prev, logo: e.target.value }))}
                          placeholder="https://ejemplo.com/mi-logo.png"
                          className="pr-10"
                        />
                        {restaurantInfo.logo && (
                          <button
                            type="button"
                            onClick={() => setRestaurantInfo(prev => ({ ...prev, logo: '' }))}
                            className="absolute right-3 top-8 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar logo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Upload className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                              Recomendaciones para el logo
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                              <li>• Formato: PNG, JPG o SVG</li>
                              <li>• Tamaño recomendado: 200x200 píxeles</li>
                              <li>• Fondo transparente preferible</li>
                              <li>• Peso máximo: 2MB</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {restaurantInfo.logo && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-800">
                              Logo configurado correctamente
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveGeneral}
                  loading={loading}
                  icon={Save}
                >
                  {t('save')} {t('generalSettings')}
                </Button>
              </div>
            </div>
          )}

          {/* Regional Settings */}
          {activeTab === 'regional' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('regionalSettings')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('language')}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('currency')}
                    </label>
                    <select
                      value={settings.currency || 'USD'}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, currency: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="COP">COP - Peso Colombiano</option>
                      <option value="ARS">ARS - Peso Argentino</option>
                      <option value="CLP">CLP - Peso Chileno</option>
                      <option value="PEN">PEN - Sol Peruano</option>
                      <option value="BRL">BRL - Real Brasileño</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona Horaria
                    </label>
                    <select
                      value={settings.timezone || 'America/Mexico_City'}
                      onChange={(e) => setSettings(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                      <option value="America/Bogota">Bogotá (GMT-5)</option>
                      <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                      <option value="America/Santiago">Santiago (GMT-3)</option>
                      <option value="America/Lima">Lima (GMT-5)</option>
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveRegional}
                  loading={loading}
                  icon={Save}
                >
                  {t('save')} {t('regionalSettings')}
                </Button>
              </div>
            </div>
          )}

          {/* Operational Settings */}
          {activeTab === 'operational' && (
            <div className="space-y-8">
              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('businessHours')}</h3>
                <div className="space-y-4">
                  {Object.entries(settings.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {t(day as any)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.is_open}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            business_hours: {
                              ...prev.business_hours,
                              [day]: { ...hours, is_open: e.target.checked }
                            }
                          } : null)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm text-gray-600 w-16">
                          {hours.is_open ? t('open') : t('closed')}
                        </span>
                      </div>

                      {hours.is_open && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              business_hours: {
                                ...prev.business_hours,
                                [day]: { ...hours, open: e.target.value }
                              }
                            } : null)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              business_hours: {
                                ...prev.business_hours,
                                [day]: { ...hours, close: e.target.value }
                              }
                            } : null)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliverySettings')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.delivery.enabled}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        delivery: { ...prev.delivery, enabled: e.target.checked }
                      } : null)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Habilitar servicio de delivery
                    </span>
                  </div>

                  {settings.delivery.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                      <Input
                        label={t('minimumOrder')}
                        type="number"
                        value={settings.delivery.min_order_amount}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          delivery: { ...prev.delivery, min_order_amount: parseFloat(e.target.value) || 0 }
                        } : null)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />

                      <Input
                        label={t('deliveryCost')}
                        type="number"
                        value={settings.delivery.delivery_cost || 0}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          delivery: { ...prev.delivery, delivery_cost: parseFloat(e.target.value) || 0 }
                        } : null)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />

                      <Input
                        label={t('estimatedTime')}
                        value={settings.delivery.estimated_time}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          delivery: { ...prev.delivery, estimated_time: e.target.value }
                        } : null)}
                        placeholder="30-45 minutos"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Table Orders */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tableOrders')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.table_orders?.enabled || false}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        table_orders: { ...prev.table_orders, enabled: e.target.checked }
                      } : null)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Habilitar pedidos en mesa
                    </span>
                  </div>

                  {settings.table_orders?.enabled && (
                    <div className="ml-7">
                      <Input
                        label={t('numberOfTables')}
                        type="number"
                        value={settings.table_orders.table_numbers || 10}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          table_orders: { ...prev.table_orders, table_numbers: parseInt(e.target.value) || 10 }
                        } : null)}
                        placeholder="10"
                        min="1"
                        max="100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveOperational}
                  loading={loading}
                  icon={Save}
                >
                  {t('save')} {t('operationalSettings')}
                </Button>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('themeSettings')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Primario
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.theme.primary_color}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          theme: { ...prev.theme, primary_color: e.target.value }
                        } : null)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.theme.primary_color}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          theme: { ...prev.theme, primary_color: e.target.value }
                        } : null)}
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Secundario
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.theme.secondary_color}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          theme: { ...prev.theme, secondary_color: e.target.value }
                        } : null)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.theme.secondary_color}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          theme: { ...prev.theme, secondary_color: e.target.value }
                        } : null)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color de Texto
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.theme.tertiary_color}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          theme: { ...prev.theme, tertiary_color: e.target.value }
                        } : null)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.theme.tertiary_color}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          theme: { ...prev.theme, tertiary_color: e.target.value }
                        } : null)}
                        placeholder="#1f2937"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuente
                    </label>
                    <select
                      value={settings.theme.font_family}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        theme: { ...prev.theme, font_family: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estilo de Botones
                    </label>
                    <select
                      value={settings.theme.button_style}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        theme: { ...prev.theme, button_style: e.target.value as any }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="rounded">Redondeados</option>
                      <option value="square">Cuadrados</option>
                      <option value="pill">Píldora</option>
                    </select>
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa</h4>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ 
                      backgroundColor: settings.theme.secondary_color,
                      color: settings.theme.tertiary_color,
                      fontFamily: settings.theme.font_family
                    }}
                  >
                    <h5 className="text-lg font-semibold mb-2">Nombre del Restaurante</h5>
                    <p className="text-sm mb-3">Esta es una vista previa de cómo se verá tu menú público.</p>
                    <button
                      className={`px-4 py-2 text-white text-sm font-medium ${
                        settings.theme.button_style === 'rounded' ? 'rounded-lg' :
                        settings.theme.button_style === 'square' ? 'rounded-none' : 'rounded-full'
                      }`}
                      style={{ backgroundColor: settings.theme.primary_color }}
                    >
                      Botón de Ejemplo
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveTheme}
                  loading={loading}
                  icon={Save}
                >
                  {t('save')} {t('themeSettings')}
                </Button>
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('socialMedia')}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <Input
                      label="Facebook"
                      value={settings.social_media.facebook || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        social_media: { ...prev.social_media, facebook: e.target.value }
                      } : null)}
                      placeholder="https://facebook.com/tu-restaurante"
                      className="flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <Input
                      label="Instagram"
                      value={settings.social_media.instagram || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        social_media: { ...prev.social_media, instagram: e.target.value }
                      } : null)}
                      placeholder="https://instagram.com/tu-restaurante"
                      className="flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <Input
                      label="Twitter"
                      value={settings.social_media.twitter || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        social_media: { ...prev.social_media, twitter: e.target.value }
                      } : null)}
                      placeholder="https://twitter.com/tu-restaurante"
                      className="flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <Input
                      label="WhatsApp"
                      value={settings.social_media.whatsapp || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        social_media: { ...prev.social_media, whatsapp: e.target.value }
                      } : null)}
                      placeholder="+1555123456"
                      className="flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <Input
                      label="Sitio Web"
                      value={settings.social_media.website || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        social_media: { ...prev.social_media, website: e.target.value }
                      } : null)}
                      placeholder="https://tu-restaurante.com"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveSocial}
                  loading={loading}
                  icon={Save}
                >
                  {t('save')} {t('socialMedia')}
                </Button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('notifications')}</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Email para Notificaciones"
                    type="email"
                    value={settings.notifications.email}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.value }
                    } : null)}
                    placeholder="pedidos@mirestaurante.com"
                  />

                  <Input
                    label="WhatsApp para Pedidos"
                    value={settings.notifications.whatsapp || ''}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, whatsapp: e.target.value }
                    } : null)}
                    placeholder="+1555123456"
                    helperText="Número donde recibirás los pedidos por WhatsApp"
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sound_enabled}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        notifications: { ...prev.notifications, sound_enabled: e.target.checked }
                      } : null)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Habilitar sonidos de notificación
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveNotifications}
                  loading={loading}
                  icon={Save}
                >
                  {t('save')} {t('notifications')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};