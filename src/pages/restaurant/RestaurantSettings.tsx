import React, { useState, useEffect } from 'react';
import { Save, Globe, Clock, Truck, QrCode, Palette, Bell, MapPin, HelpCircle, Send, Eye, Calendar, Mail, Phone, Building } from 'lucide-react';
import { Restaurant } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const RestaurantSettings: React.FC = () => {
  const { restaurant, user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    priority: 'medium',
    category: 'general',
    message: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);

  useEffect(() => {
    // Cargar tickets existentes
    const existingTickets = loadFromStorage('supportTickets', []);
    setSupportTickets(existingTickets);
  }, []);

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

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);

    try {
      // Crear el ticket de soporte
      const newTicket = {
        id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        restaurantId: restaurant?.id,
        restaurantName: restaurant?.name,
        subject: supportForm.subject,
        category: supportForm.category,
        priority: supportForm.priority,
        message: supportForm.message,
        contactEmail: supportForm.contactEmail,
        contactPhone: supportForm.contactPhone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Guardar en localStorage
      const existingTickets = loadFromStorage('supportTickets', []);
      saveToStorage('supportTickets', [...existingTickets, newTicket]);

      // En un entorno real, aquí se enviaría al backend:
      // const response = await fetch('/api/support-tickets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTicket)
      // });

      console.log('Ticket de soporte creado:', newTicket);
      console.log('Email que se enviaría a admin@digitalfenixpro.com:', {
        to: 'admin@digitalfenixpro.com',
        subject: `[SOPORTE] ${supportForm.subject} - ${restaurant?.name}`,
        body: `
NUEVO TICKET DE SOPORTE

INFORMACIÓN DEL RESTAURANTE:
- Nombre: ${restaurant?.name}
- Email: ${restaurant?.email}
- Dominio: ${restaurant?.domain}
- ID: ${restaurant?.id}

INFORMACIÓN DEL TICKET:
- ID: ${newTicket.id}
- Asunto: ${supportForm.subject}
- Categoría: ${supportForm.category}
- Prioridad: ${supportForm.priority}
- Email de contacto: ${supportForm.contactEmail}
- Teléfono de contacto: ${supportForm.contactPhone}

MENSAJE:
${supportForm.message}

---
Enviado desde el panel de administración
Fecha: ${new Date().toLocaleString()}
        `.trim()
      });

      setSupportSuccess(true);
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setSupportForm({
          subject: '',
          priority: 'medium',
          category: 'general',
          message: '',
          contactEmail: restaurant?.email || '',
          contactPhone: restaurant?.phone || ''
        });
        setSupportSuccess(false);
      }, 3000);
      
      // Actualizar la lista de tickets
      setSupportTickets(prev => [...prev, newTicket]);

    } catch (error) {
      console.error('Error sending support request:', error);
      showToast(
        'error',
        'Error',
        'Hubo un problema al enviar la solicitud de soporte.',
        4000
      );
    } finally {
      setSupportLoading(false);
    }
  };

  const handleViewTicketDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowTicketDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="info">En Progreso</Badge>;
      case 'resolved':
        return <Badge variant="success">Resuelto</Badge>;
      case 'closed':
        return <Badge variant="gray">Cerrado</Badge>;
      default:
        return <Badge variant="gray">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgente</Badge>;
      case 'high':
        return <Badge variant="warning">Alta</Badge>;
      case 'medium':
        return <Badge variant="info">Media</Badge>;
      case 'low':
        return <Badge variant="gray">Baja</Badge>;
      default:
        return <Badge variant="gray">Media</Badge>;
    }
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      general: 'Consulta General',
      technical: 'Problema Técnico',
      billing: 'Facturación',
      feature: 'Solicitud de Función',
      account: 'Cuenta y Configuración',
      other: 'Otro'
    };
    return categories[category] || category;
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'hours', name: 'Horarios', icon: Clock },
    { id: 'social', name: 'Redes Sociales', icon: Globe },
    { id: 'delivery', name: 'Delivery', icon: Truck },
    { id: 'tables', name: 'Pedidos en Mesa', icon: QrCode },
    { id: 'theme', name: 'Tema', icon: Palette },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'support', name: 'Soporte', icon: HelpCircle },
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
                          <div className="w-32">
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
                            variant="outline"
                            onClick={() => {
                              const newTiers = [...(formData.settings.delivery.pricing_tiers || [])];
                              newTiers.splice(index, 1);
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
                    {formData.logo && (
                      <div className="mt-2">
                        <img
                          src={formData.logo}
                          alt="Logo preview"
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                      onChange={(e) => updateFormData('settings.table_orders.table_numbers', parseInt(e.target.value) || 10)}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Códigos QR de Mesas</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Los códigos QR permiten a los clientes acceder directamente al menú desde su mesa.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Array.from({ length: formData.settings.table_orders?.table_numbers || 10 }, (_, i) => {
                        const tableNum = i + 1;
                        const qrUrl = `${window.location.origin}/${formData.domain}?table=${tableNum}`;
                        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
                        
                        return (
                          <div key={tableNum} className="border border-gray-200 rounded-lg p-4 text-center bg-white min-h-[320px] flex flex-col">
                            <div className="flex items-center justify-center mb-2">
                              <QrCode className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-800">
                                Mesa {tableNum}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center justify-center mb-4">
                              <img 
                                src={qrImageUrl} 
                                alt={`QR Mesa ${tableNum}`}
                                className="w-48 h-48 object-contain"
                              />
                            </div>
                            <div className="mt-auto">
                              <p className="text-sm font-medium text-gray-900 mb-3">Mesa {tableNum}</p>
                              <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs py-2 px-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  const qrUrl = `${window.location.origin}/${formData.domain}?table=${tableNum}`;
                                  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
                                  
                                  const printWindow = window.open('', '_blank');
                                  if (printWindow) {
                                    printWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>QR Mesa ${tableNum}</title>
                                          <style>
                                            body { 
                                              margin: 0;
                                              padding: 0;
                                              display: flex;
                                              justify-content: center;
                                              align-items: center;
                                              min-height: 100vh;
                                              background: white;
                                            }
                                            .qr-image {
                                              max-width: 100%;
                                              max-height: 100%;
                                              width: 400px;
                                              height: 400px;
                                            }
                                            @media print {
                                              body { 
                                                margin: 0;
                                                padding: 0;
                                              }
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          <img src="${qrImageUrl}" alt="QR Mesa ${tableNum}" class="qr-image" />
                                        </body>
                                      </html>
                                    `);
                                    printWindow.document.close();
                                    
                                    printWindow.onload = () => {
                                      setTimeout(() => {
                                        printWindow.print();
                                      }, 500);
                                    };
                                  }
                                }}
                              >
                                Imprimir
                              </Button>
                              <Button
                                size="sm"
                                className="w-full text-xs py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white border-0"
                                onClick={() => {
                                  const qrUrl = `${window.location.origin}/${formData.domain}?table=${tableNum}`;
                                  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
                                  
                                  fetch(qrImageUrl)
                                    .then(response => response.blob())
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `QR-Mesa-${tableNum}-${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    })
                                    .catch(error => {
                                      console.error('Error downloading QR:', error);
                                      const link = document.createElement('a');
                                      link.href = qrImageUrl;
                                      link.download = `QR-Mesa-${tableNum}-${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    });
                                }}
                              >
                                Descargar
                              </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Instrucciones:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Cada mesa tendrá su propio código QR único</li>
                        <li>• Los clientes escanean el código para acceder al menú</li>
                        <li>• El número de mesa se detecta automáticamente</li>
                        <li>• Puedes imprimir y descargar cada código QR individualmente</li>
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

          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Centro de Soporte</h3>
                <p className="text-gray-600">
                  ¿Necesitas ayuda? Completa el formulario y nuestro equipo te contactará pronto.
                </p>
              </div>

              {supportSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="text-green-800 font-medium">¡Solicitud enviada!</h4>
                      <p className="text-green-700 text-sm">
                        Tu solicitud de soporte ha sido enviada. Te contactaremos pronto.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSupportSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe brevemente tu consulta"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={supportForm.category}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">Consulta General</option>
                      <option value="technical">Problema Técnico</option>
                      <option value="billing">Facturación</option>
                      <option value="feature">Solicitud de Función</option>
                      <option value="account">Cuenta y Configuración</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      value={supportForm.priority}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Baja - No es urgente</option>
                      <option value="medium">Media - Respuesta en 24-48h</option>
                      <option value="high">Alta - Respuesta en 2-8h</option>
                      <option value="urgent">Urgente - Respuesta inmediata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contacto *
                    </label>
                    <input
                      type="email"
                      value={supportForm.contactEmail}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={supportForm.contactPhone}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Problema o Consulta *
                  </label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe detalladamente tu consulta o problema. Incluye pasos para reproducir el problema si es técnico."
                    required
                  />
                </div>

                {/* Historial de tickets */}
                {supportTickets.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-gray-800 font-medium mb-3">Tickets enviados recientemente:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {supportTickets
                        .filter(ticket => ticket.restaurantId === restaurant?.id)
                        .slice(-5)
                        .reverse()
                        .map(ticket => (
                          <div key={ticket.id} className="bg-white p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">
                                {ticket.subject}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {getPriorityBadge(ticket.priority)}
                                {getStatusBadge(ticket.status)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {new Date(ticket.createdAt).toLocaleDateString()} • {getCategoryName(ticket.category)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Eye}
                                onClick={() => handleViewTicketDetails(ticket)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSupportForm({
                      subject: '',
                      priority: 'medium',
                      category: 'general',
                      message: '',
                      contactEmail: restaurant?.email || '',
                      contactPhone: restaurant?.phone || ''
                    })}
                  >
                    Limpiar Formulario
                  </Button>
                  <Button
                    type="submit"
                    loading={supportLoading}
                    icon={Send}
                    disabled={!supportForm.subject.trim() || !supportForm.message.trim() || !supportForm.contactEmail.trim()}
                  >
                    Enviar Solicitud
                  </Button>
                </div>
              </form>

              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h4 className="text-gray-900 font-medium mb-3">Otros canales de soporte:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 Email directo: <a href="mailto:admin@digitalfenixpro.com" className="text-blue-600 hover:text-blue-700">admin@digitalfenixpro.com</a></p>
                  <p>⏰ Horario de atención: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                  <p>🕐 Tiempo de respuesta típico: 2-24 horas según prioridad</p>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Nota:</strong> Los tickets se almacenan localmente y se envían automáticamente a nuestro sistema de soporte. 
                    Recibirás una respuesta en el email de contacto proporcionado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal for Restaurant */}
      <Modal
        isOpen={showTicketDetailModal}
        onClose={() => {
          setShowTicketDetailModal(false);
          setSelectedTicket(null);
        }}
        title="Detalles del Ticket"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h3>
                <div className="flex gap-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Ticket ID: {selectedTicket.id} • {new Date(selectedTicket.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Ticket Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Información del Ticket</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Categoría:</span> {getCategoryName(selectedTicket.category)}
                  </div>
                  <div>
                    <span className="text-gray-600">Prioridad:</span> {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Información de Contacto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedTicket.contactEmail}</span>
                  </div>
                  {selectedTicket.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{selectedTicket.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Tu Mensaje</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
            </div>

            {/* Admin Response */}
            {selectedTicket.response ? (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Respuesta del Equipo de Soporte</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{selectedTicket.response}</p>
                  {selectedTicket.responseDate && (
                    <div className="text-xs text-green-600 mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Respondido el: {new Date(selectedTicket.responseDate).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <HelpCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Esperando Respuesta</h4>
                    <p className="text-yellow-700 text-sm">
                      Tu ticket está siendo revisado por nuestro equipo. Te contactaremos pronto.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes (if any) */}
            {selectedTicket.adminNotes && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Notas Adicionales</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.adminNotes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowTicketDetailModal(false);
                  setSelectedTicket(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};