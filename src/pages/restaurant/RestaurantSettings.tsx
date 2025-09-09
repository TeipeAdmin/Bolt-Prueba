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
    { id: 'social', name: 'Redes Sociales', icon: Globe },
    { id: 'delivery', name: 'Delivery', icon: Truck },
    { id: 'tables', name: 'Pedidos en Mesa', icon: QrCode },
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

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Redes Sociales</h3>
              <p className="text-sm text-gray-600">
                Agrega tus redes sociales para que aparezcan en tu menú público
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Facebook"
                  value={formData.settings.social_media?.facebook || ''}
                  onChange={(e) => updateFormData('settings.social_media.facebook', e.target.value)}
                  placeholder="https://facebook.com/tu-restaurante"
                />
                <Input
                  label="Instagram"
                  value={formData.settings.social_media?.instagram || ''}
                  onChange={(e) => updateFormData('settings.social_media.instagram', e.target.value)}
                  placeholder="https://instagram.com/tu-restaurante"
                />
                <Input
                  label="Twitter"
                  value={formData.settings.social_media?.twitter || ''}
                  onChange={(e) => updateFormData('settings.social_media.twitter', e.target.value)}
                  placeholder="https://twitter.com/tu-restaurante"
                />
                <Input
                  label="WhatsApp"
                  value={formData.settings.social_media?.whatsapp || ''}
                  onChange={(e) => updateFormData('settings.social_media.whatsapp', e.target.value)}
                  placeholder="+1234567890"
                />
                <Input
                  label="Sitio Web"
                  value={formData.settings.social_media?.website || ''}
                  onChange={(e) => updateFormData('settings.social_media.website', e.target.value)}
                  placeholder="https://tu-restaurante.com"
                />
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
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Tarifas de Delivery</h4>
                    <div className="space-y-4">
                      {(formData.settings.delivery.pricing_tiers || []).map((tier, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <Input
                              label="Nombre de la Tarifa"
                              value={tier.name || ''}
                              onChange={(e) => {
                                const newTiers = [...(formData.settings.delivery.pricing_tiers || [])];
                                newTiers[index] = { ...tier, name: e.target.value };
                                updateFormData('settings.delivery.pricing_tiers', newTiers);
                              }}
                              placeholder="Estándar, Express, Premium..."
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              label="Pedido Mínimo ($)"
                              type="number"
                              step="0.01"
                              value={tier.min_order_amount || 0}
                              onChange={(e) => {
                                const newTiers = [...(formData.settings.delivery.pricing_tiers || [])];
                                newTiers[index] = { ...tier, min_order_amount: parseFloat(e.target.value) || 0 };
                                updateFormData('settings.delivery.pricing_tiers', newTiers);
                              }}
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              label="Pedido Máximo ($)"
                              type="number"
                              step="0.01"
                              value={tier.max_order_amount || 0}
                              onChange={(e) => {
                                const newTiers = [...(formData.settings.delivery.pricing_tiers || [])];
                                newTiers[index] = { ...tier, max_order_amount: parseFloat(e.target.value) || 0 };
                                updateFormData('settings.delivery.pricing_tiers', newTiers);
                              }}
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              label="Costo ($)"
                              type="number"
                              step="0.01"
                              value={tier.cost || 0}
                              onChange={(e) => {
                                const newTiers = [...(formData.settings.delivery.pricing_tiers || [])];
                                newTiers[index] = { ...tier, cost: parseFloat(e.target.value) || 0 };
                                updateFormData('settings.delivery.pricing_tiers', newTiers);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              label="Tiempo Estimado"
                              value={tier.estimated_time || ''}
                              onChange={(e) => {
                                const newTiers = [...(formData.settings.delivery.pricing_tiers || [])];
                                newTiers[index] = { ...tier, estimated_time: e.target.value };
                                updateFormData('settings.delivery.pricing_tiers', newTiers);
                              }}
                              placeholder="30-45 min"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newTiers = (formData.settings.delivery.pricing_tiers || []).filter((_, i) => i !== index);
                              updateFormData('settings.delivery.pricing_tiers', newTiers);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newTiers = [...(formData.settings.delivery.pricing_tiers || []), {
                            id: Date.now().toString(),
                            name: '',
                            min_order_amount: 0,
                            max_order_amount: 0,
                            cost: 0,
                            estimated_time: ''
                          }];
                          updateFormData('settings.delivery.pricing_tiers', newTiers);
                        }}
                      >
                        Agregar Tarifa de Delivery
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Pedidos en Mesa</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.table_orders?.enabled || false}
                    onChange={(e) => updateFormData('settings.table_orders.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {formData.settings.table_orders?.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </div>
              
              {formData.settings.table_orders?.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Número de Mesas"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.settings.table_orders?.table_numbers || 10}
                      onChange={(e) => updateFormData('settings.table_orders.table_numbers', parseInt(e.target.value) || 10)}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Códigos QR de Mesas</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Los códigos QR permiten a los clientes acceder directamente al menú desde su mesa.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <QrCode className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">
                          URL base para códigos QR: {window.location.origin}/{formData.domain}?table=
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Array.from({ length: formData.settings.table_orders?.table_numbers || 10 }, (_, i) => i + 1).map(tableNum => (
                        <div key={tableNum} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                          <div className="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center relative">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}/${formData.domain}?table=${tableNum}`)}`}
                              alt={`QR Mesa ${tableNum}`}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center">
                              <QrCode className="w-8 h-8 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">Mesa {tableNum}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ?table={tableNum}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => {
                                const qrUrl = `${window.location.origin}/${formData.domain}?table=${tableNum}`;
                                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
                                
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>QR Mesa ${tableNum} - ${formData.name}</title>
                                        <style>
                                          body { 
                                            font-family: Arial, sans-serif; 
                                            text-align: center; 
                                            padding: 20px;
                                            margin: 0;
                                          }
                                          .qr-container {
                                            border: 2px solid #000;
                                            padding: 30px;
                                            margin: 20px auto;
                                            max-width: 400px;
                                            border-radius: 10px;
                                            background: white;
                                          }
                                          .restaurant-name {
                                            font-size: 28px;
                                            font-weight: bold;
                                            margin-bottom: 10px;
                                            color: #1f2937;
                                          }
                                          .table-number {
                                            font-size: 42px;
                                            font-weight: bold;
                                            color: #2563eb;
                                            margin: 20px 0;
                                          }
                                          .qr-image {
                                            width: 200px;
                                            height: 200px;
                                            margin: 20px auto;
                                            border: 1px solid #e5e7eb;
                                            border-radius: 8px;
                                          }
                                          .instructions {
                                            font-size: 16px;
                                            color: #374151;
                                            margin-top: 20px;
                                            line-height: 1.5;
                                          }
                                          .url {
                                            font-size: 12px;
                                            color: #6b7280;
                                            word-break: break-all;
                                            margin-top: 15px;
                                            padding: 10px;
                                            background: #f9fafb;
                                            border-radius: 6px;
                                          }
                                          @media print {
                                            body { margin: 0; }
                                            .qr-container { border: 2px solid #000; }
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="qr-container">
                                          <div class="restaurant-name">${formData.name}</div>
                                          <div class="table-number">MESA ${tableNum}</div>
                                          <img src="${qrImageUrl}" alt="QR Mesa ${tableNum}" class="qr-image" />
                                          <div class="instructions">
                                            <strong>Escanea el código QR con tu teléfono</strong><br/>
                                            para ver nuestro menú y hacer tu pedido
                                          </div>
                                          <div class="url">${qrUrl}</div>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.print();
                                }
                              }}
                            >
                              🖨️
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => {
                                const qrUrl = `${window.location.origin}/${formData.domain}?table=${tableNum}`;
                                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
                                
                                // Create a temporary link to download the QR code
                                const link = document.createElement('a');
                                link.href = qrImageUrl;
                                link.download = `QR-Mesa-${tableNum}-${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              📥
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const tableCount = formData.settings.table_orders?.table_numbers || 10;
                          const qrUrl = `${window.location.origin}/${formData.domain}`;
                          
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            let htmlContent = `
                              <html>
                                <head>
                                  <title>Códigos QR - ${formData.name}</title>
                                  <style>
                                    body { 
                                      font-family: Arial, sans-serif; 
                                      margin: 0;
                                      padding: 20px;
                                    }
                                    .page-title {
                                      text-align: center;
                                      font-size: 24px;
                                      font-weight: bold;
                                      margin-bottom: 30px;
                                      color: #1f2937;
                                    }
                                    .qr-grid {
                                      display: grid;
                                      grid-template-columns: repeat(2, 1fr);
                                      gap: 30px;
                                      max-width: 800px;
                                      margin: 0 auto;
                                    }
                                    .qr-item {
                                      border: 2px solid #000;
                                      padding: 20px;
                                      text-align: center;
                                      border-radius: 10px;
                                      background: white;
                                      page-break-inside: avoid;
                                    }
                                    .restaurant-name {
                                      font-size: 18px;
                                      font-weight: bold;
                                      margin-bottom: 5px;
                                    }
                                    .table-number {
                                      font-size: 28px;
                                      font-weight: bold;
                                      color: #2563eb;
                                      margin: 15px 0;
                                    }
                                    .qr-image {
                                      width: 150px;
                                      height: 150px;
                                      margin: 15px auto;
                                      border: 1px solid #e5e7eb;
                                      border-radius: 8px;
                                    }
                                    .instructions {
                                      font-size: 12px;
                                      color: #374151;
                                      margin-top: 10px;
                                      line-height: 1.4;
                                    }
                                    @media print {
                                      body { margin: 0; }
                                      .qr-item { border: 2px solid #000; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="page-title">Códigos QR - ${formData.name}</div>
                                  <div class="qr-grid">
                            `;
                            
                            for (let i = 1; i <= tableCount; i++) {
                              const tableQrUrl = `${qrUrl}?table=${i}`;
                              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tableQrUrl)}`;
                              
                              htmlContent += `
                                <div class="qr-item">
                                  <div class="restaurant-name">${formData.name}</div>
                                  <div class="table-number">MESA ${i}</div>
                                  <img src="${qrImageUrl}" alt="QR Mesa ${i}" class="qr-image" />
                                  <div class="instructions">
                                    Escanea con tu teléfono<br/>
                                    para ver el menú
                                  </div>
                                </div>
                              `;
                            }
                            
                            htmlContent += `
                                  </div>
                                </body>
                              </html>
                            `;
                            
                            printWindow.document.write(htmlContent);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }}
                      >
                        🖨️ Imprimir Todos los QR
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          const tableCount = formData.settings.table_orders?.table_numbers || 10;
                          const qrUrl = `${window.location.origin}/${formData.domain}`;
                          
                          // Create a zip-like experience by downloading multiple files
                          for (let i = 1; i <= tableCount; i++) {
                            setTimeout(() => {
                              const tableQrUrl = `${qrUrl}?table=${i}`;
                              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableQrUrl)}`;
                              
                              const link = document.createElement('a');
                              link.href = qrImageUrl;
                              link.download = `QR-Mesa-${i}-${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }, i * 500); // Delay each download by 500ms
                          }
                        }}
                      >
                        📥 Descargar Todos los QR
                      </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Instrucciones:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Cada mesa tendrá su propio código QR único</li>
                        <li>• Los clientes escanean el código para acceder al menú</li>
                        <li>• El número de mesa se detecta automáticamente</li>
                        <li>• Puedes imprimir los códigos QR individualmente</li>
                      </ul>
                    </div>
                  </div>
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