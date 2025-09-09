import React, { useState, useEffect } from 'react';
import { Save, Globe, Clock, Truck, QrCode, Palette, Bell, MapPin } from 'lucide-react';
import { Restaurant } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const RestaurantSettings: React.FC = () => {
  const { restaurant, user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({ ...restaurant });
    }
  }, [restaurant]);

  const handleSave = async () => {
    if (!formData || !restaurant) return;

    setLoading(true);
    try {
      const restaurants = loadFromStorage('restaurants', []);
      const updatedRestaurants = restaurants.map((r: Restaurant) =>
        r.id === restaurant.id
          ? { ...formData, updated_at: new Date().toISOString() }
          : r
      );

      saveToStorage('restaurants', updatedRestaurants);

      // Update auth context
      const currentAuth = loadFromStorage('currentAuth', null);
      if (currentAuth) {
        currentAuth.restaurant = { ...formData, updated_at: new Date().toISOString() };
        saveToStorage('currentAuth', currentAuth);
      }

      showToast(
        'success',
        'Configuración Guardada',
        'Los cambios han sido guardados exitosamente.',
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

  const updateFormData = (path: string, value: any) => {
    if (!formData) return;

    const keys = path.split('.');
    const newData = { ...formData };
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'hours', name: 'Horarios', icon: Clock },
    { id: 'delivery', name: 'Delivery', icon: Truck },
    { id: 'theme', name: 'Tema', icon: Palette },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
  ];

  if (!formData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
        <Button
          onClick={handleSave}
          loading={loading}
          icon={Save}
        >
          {t('save')} {t('settings')}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('restaurantInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={`${t('restaurantName')}*`}
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                  <Input
                    label="Logo URL"
                    value={formData.logo || ''}
                    onChange={(e) => updateFormData('logo', e.target.value)}
                    placeholder="https://example.com/logo.jpg"
                  />
                  <Input
                    label={t('email')}
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                  <Input
                    label={t('phone')}
                    value={formData.phone || ''}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label={t('address')}
                    value={formData.address || ''}
                    onChange={(e) => updateFormData('address', e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe tu restaurante..."
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dominio</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Tu menú público está disponible en:</p>
                  <p className="text-lg font-mono text-blue-600">
                    {window.location.origin}/{formData.domain}
                  </p>
                  <a
                    href={`${window.location.origin}/${formData.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Ver Menú Público
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">{t('businessHours')}</h3>
              <div className="space-y-4">
                {Object.entries(formData.settings.business_hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {t(day)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours.is_open}
                        onChange={(e) => updateFormData(`settings.business_hours.${day}.is_open`, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{t('open')}</span>
                    </div>
                    {hours.is_open && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateFormData(`settings.business_hours.${day}.open`, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateFormData(`settings.business_hours.${day}.close`, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{t('deliverySettings')}</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.delivery.enabled}
                    onChange={(e) => updateFormData('settings.delivery.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {formData.settings.delivery.enabled ? t('enabled') : t('disabled')}
                  </span>
                </div>
              </div>

              {formData.settings.delivery.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('minimumOrder')}
                    type="number"
                    step="0.01"
                    value={formData.settings.delivery.min_order_amount}
                    onChange={(e) => updateFormData('settings.delivery.min_order_amount', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label={t('estimatedTime')}
                    value={formData.settings.delivery.estimated_time}
                    onChange={(e) => updateFormData('settings.delivery.estimated_time', e.target.value)}
                    placeholder="30-45 minutos"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">{t('themeSettings')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Primario
                  </label>
                  <input
                    type="color"
                    value={formData.settings.theme.primary_color}
                    onChange={(e) => updateFormData('settings.theme.primary_color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Secundario
                  </label>
                  <input
                    type="color"
                    value={formData.settings.theme.secondary_color}
                    onChange={(e) => updateFormData('settings.theme.secondary_color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Terciario
                  </label>
                  <input
                    type="color"
                    value={formData.settings.theme.tertiary_color}
                    onChange={(e) => updateFormData('settings.theme.tertiary_color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente
                  </label>
                  <select
                    value={formData.settings.theme.font_family}
                    onChange={(e) => updateFormData('settings.theme.font_family', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo de Botones
                  </label>
                  <select
                    value={formData.settings.theme.button_style}
                    onChange={(e) => updateFormData('settings.theme.button_style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rounded">Redondeados</option>
                    <option value="square">Cuadrados</option>
                    <option value="pill">Píldora</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">{t('notifications')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email para Notificaciones"
                  type="email"
                  value={formData.settings.notifications.email}
                  onChange={(e) => updateFormData('settings.notifications.email', e.target.value)}
                />
                <Input
                  label="WhatsApp"
                  value={formData.settings.notifications.whatsapp || ''}
                  onChange={(e) => updateFormData('settings.notifications.whatsapp', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.settings.notifications.sound_enabled}
                  onChange={(e) => updateFormData('settings.notifications.sound_enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Habilitar sonidos de notificación
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};