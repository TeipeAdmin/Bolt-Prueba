import React, { useState, useEffect } from 'react';
import { Save, Globe, Clock, Truck, QrCode, Palette, Bell, MapPin, HelpCircle, Send, Eye, Calendar, Mail, Phone, Building, Store, Megaphone, Upload, Image as ImageIcon, FileText, DollarSign, Star } from 'lucide-react';
import { colombianDepartments, colombianCitiesByDepartment, validateNIT, formatNIT } from '../../utils/colombianCities';
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

    // Inicializar los campos de contacto con los datos del restaurante
    if (restaurant) {
      setSupportForm(prev => ({
        ...prev,
        contactEmail: restaurant.email || '',
        contactPhone: restaurant.phone || ''
      }));
    }
  }, [restaurant]);

  useEffect(() => {
    if (restaurant) {
      const defaultTheme = {
        primary_color: '#dc2626',
        secondary_color: '#f3f4f6',
        menu_background_color: '#ffffff',
        card_background_color: '#f9fafb',
        primary_text_color: '#111827',
        secondary_text_color: '#6b7280',
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
        button_style: 'rounded' as const,
      };

      setFormData({
        ...restaurant,
        settings: {
          ...restaurant.settings,
          theme: {
            ...defaultTheme,
            ...restaurant.settings.theme,
            font_sizes: {
              ...defaultTheme.font_sizes,
              ...(restaurant.settings.theme.font_sizes || {}),
            },
            font_weights: {
              ...defaultTheme.font_weights,
              ...(restaurant.settings.theme.font_weights || {}),
            },
          },
          promo: restaurant.settings.promo || {
            enabled: false,
            banner_image: '',
            promo_text: '',
            cta_text: 'Ver Ofertas',
            cta_link: '',
          },
          billing: restaurant.settings.billing || {
            nombreComercial: restaurant.name || '',
            razonSocial: '',
            nit: '',
            direccion: restaurant.address || '',
            departamento: 'Cundinamarca',
            ciudad: 'Bogotá D.C.',
            telefono: restaurant.phone || '',
            correo: restaurant.email || '',
            regimenTributario: 'simple' as const,
            responsableIVA: false,
            tieneResolucionDIAN: false,
            numeroResolucionDIAN: '',
            fechaResolucion: '',
            rangoNumeracionDesde: undefined,
            rangoNumeracionHasta: undefined,
            aplicaPropina: true,
            mostrarLogoEnTicket: false,
            logoTicket: '',
            mensajeFinalTicket: '',
          },
        },
      });
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
    { id: 'promo', name: 'Promocional', icon: Megaphone },
    { id: 'theme', name: 'Tema', icon: Palette },
    { id: 'billing', name: 'Facturación', icon: FileText },
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
            <div className="space-y-8">
              {/* Logo Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-white overflow-hidden flex items-center justify-center">
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Sin logo</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Logo del Restaurante</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Sube el logo de tu restaurante para que aparezca en tu menú público y en el panel de administración.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  showToast('error', 'Archivo muy grande', 'El tamaño máximo es 5MB', 3000);
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateFormData('logo', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="logo-upload"
                          />
                          <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
                            <Building className="w-4 h-4 mr-2" />
                            {formData.logo ? 'Cambiar Logo' : 'Seleccionar Logo'}
                          </span>
                        </label>

                        {formData.logo && (
                          <button
                            onClick={() => updateFormData('logo', '')}
                            className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 transition-all"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/50 p-3 rounded-lg">
                        <span className="text-blue-500 mt-0.5">ℹ</span>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Recomendaciones:</p>
                          <ul className="space-y-0.5">
                            <li>• Formatos: JPG, PNG o GIF</li>
                            <li>• Tamaño recomendado: 200x200px (mínimo)</li>
                            <li>• Tamaño máximo del archivo: 5MB</li>
                            <li>• Usa fondo transparente para mejor resultado</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restaurant Info Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('restaurantInfo')}</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={`${t('restaurantName')}*`}
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                    <Input
                      label={t('email')}
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t('phone')}
                      value={formData.phone || ''}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Input
                      label={t('address')}
                      value={formData.address || ''}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="123 Main Street, Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('description')}
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Describe tu restaurante, tu especialidad, ambiente, horarios especiales, etc..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Esta descripción aparecerá en tu menú público
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Menu Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="flex-1 w-[80%]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Menú Público</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Comparte este enlace con tus clientes para que puedan ver tu menú y realizar pedidos
                    </p>

                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">Tu URL personalizada:</p>
                          <p className="text-sm font-mono text-gray-900 truncate">
                            {window.location.origin}/{formData.domain}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/${formData.domain}`);
                              showToast('success', 'Copiado', 'URL copiada al portapapeles', 2000);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            Copiar
                          </button>

                          <a
                            href={`${window.location.origin}/${formData.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Menú
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('businessHours')}</h3>
                  <p className="text-sm text-gray-600">Configura los horarios de atención de tu restaurante</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Tiempo de Preparación
                </h4>
                <div className="space-y-3">
                  <Input
                    label="Tiempo estimado de preparación"
                    value={formData.settings.preparation_time || '30-45 minutos'}
                    onChange={(e) => updateFormData('settings.preparation_time', e.target.value)}
                    placeholder="Ej: 30-45 minutos"
                  />
                  <p className="text-xs text-gray-500">
                    Este es el tiempo que se mostrará a los clientes como estimación de preparación de sus pedidos
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Horarios de Atención
                </h4>
                <div className="space-y-3">
                  {Object.entries(formData.settings.business_hours).map(([day, hours]) => (
                    <div key={day} className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-300 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-3 md:w-40">
                          <input
                            type="checkbox"
                            checked={hours.is_open}
                            onChange={(e) => updateFormData(`settings.business_hours.${day}.is_open`, e.target.checked)}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            id={`${day}-checkbox`}
                          />
                          <label htmlFor={`${day}-checkbox`} className="text-sm font-semibold text-gray-900 capitalize cursor-pointer">
                            {t(day)}
                          </label>
                        </div>

                        {hours.is_open ? (
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Apertura</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => updateFormData(`settings.business_hours.${day}.open`, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div className="text-gray-400 mt-5">—</div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Cierre</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => updateFormData(`settings.business_hours.${day}.close`, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <Badge variant="gray">Cerrado</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Información importante:</p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Los horarios se muestran en tu menú público</li>
                      <li>Los clientes verán si estás abierto o cerrado</li>
                      <li>Puedes configurar diferentes horarios para cada día</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Redes Sociales</h3>
                  <p className="text-sm text-gray-600">
                    Conecta tus redes sociales para aparecer en tu menú público
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Facebook</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={formData.settings.social_media?.facebook || ''}
                        onChange={(e) => updateFormData('settings.social_media.facebook', e.target.value)}
                        placeholder="https://facebook.com/tu-restaurante"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={formData.settings.social_media?.instagram || ''}
                        onChange={(e) => updateFormData('settings.social_media.instagram', e.target.value)}
                        placeholder="https://instagram.com/tu-restaurante"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Twitter / X</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={formData.settings.social_media?.twitter || ''}
                        onChange={(e) => updateFormData('settings.social_media.twitter', e.target.value)}
                        placeholder="https://twitter.com/tu-restaurante"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <input
                        type="tel"
                        value={formData.settings.social_media?.whatsapp || ''}
                        onChange={(e) => updateFormData('settings.social_media.whatsapp', e.target.value)}
                        placeholder="+1234567890"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">TikTok</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-6.95a8.16 8.16 0 004.65 1.46v-3.4a4.84 4.84 0 01-1.2-.5z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={formData.settings.social_media?.tiktok || ''}
                        onChange={(e) => updateFormData('settings.social_media.tiktok', e.target.value)}
                        placeholder="https://tiktok.com/@tu-restaurante"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={formData.settings.social_media?.website || ''}
                        onChange={(e) => updateFormData('settings.social_media.website', e.target.value)}
                        placeholder="https://tu-restaurante.com"
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Globe className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-800 font-medium">Sobre las redes sociales:</p>
                    <ul className="text-xs text-purple-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Los enlaces aparecerán en el footer de tu menú público</li>
                      <li>Asegúrate de usar URLs completas (https://...)</li>
                      <li>Para WhatsApp, usa el formato internacional (+código país + número)</li>
                      <li>Los iconos se mostrarán automáticamente según la red social</li>
                    </ul>
                  </div>
                </div>
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
                            cost: 0
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
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Personalización de Tema
                </h3>
                <p className="text-sm text-gray-600">
                  Configura los colores, tipografía y estilos de tu menú público
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Paleta de Colores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color Primario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.settings.theme.primary_color}
                        onChange={(e) => updateFormData('settings.theme.primary_color', e.target.value)}
                        className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.settings.theme.primary_color}
                          onChange={(e) => updateFormData('settings.theme.primary_color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Botones principales</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color Secundario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.settings.theme.secondary_color}
                        onChange={(e) => updateFormData('settings.theme.secondary_color', e.target.value)}
                        className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.settings.theme.secondary_color}
                          onChange={(e) => updateFormData('settings.theme.secondary_color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Botones secundarios</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color del Fondo del Menú
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.settings.theme.menu_background_color}
                        onChange={(e) => updateFormData('settings.theme.menu_background_color', e.target.value)}
                        className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.settings.theme.menu_background_color}
                          onChange={(e) => updateFormData('settings.theme.menu_background_color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Fondo principal del menú</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color de las Tarjetas y Fondo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.settings.theme.card_background_color}
                        onChange={(e) => updateFormData('settings.theme.card_background_color', e.target.value)}
                        className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.settings.theme.card_background_color}
                          onChange={(e) => updateFormData('settings.theme.card_background_color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tarjetas de productos</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color Texto Primario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.settings.theme.primary_text_color}
                        onChange={(e) => updateFormData('settings.theme.primary_text_color', e.target.value)}
                        className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.settings.theme.primary_text_color}
                          onChange={(e) => updateFormData('settings.theme.primary_text_color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Títulos y textos principales</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Color Texto Secundario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.settings.theme.secondary_text_color}
                        onChange={(e) => updateFormData('settings.theme.secondary_text_color', e.target.value)}
                        className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.settings.theme.secondary_text_color}
                          onChange={(e) => updateFormData('settings.theme.secondary_text_color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">Descripciones y subtítulos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Tipografía</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Fuente Principal
                    </label>
                    <select
                      value={formData.settings.theme.primary_font}
                      onChange={(e) => updateFormData('settings.theme.primary_font', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Raleway">Raleway</option>
                    </select>
                    <p className="text-xs text-gray-500">Para texto de contenido</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Fuente Secundaria
                    </label>
                    <select
                      value={formData.settings.theme.secondary_font}
                      onChange={(e) => updateFormData('settings.theme.secondary_font', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Merriweather">Merriweather</option>
                    </select>
                    <p className="text-xs text-gray-500">Para títulos y destacados</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Tamaños de Fuente (en píxeles)</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Títulos</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={parseInt(formData.settings.theme.font_sizes.title) || 32}
                          onChange={(e) => updateFormData('settings.theme.font_sizes.title', `${e.target.value}px`)}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
                          placeholder="32"
                          min="8"
                          max="128"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Subtítulos</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={parseInt(formData.settings.theme.font_sizes.subtitle) || 24}
                          onChange={(e) => updateFormData('settings.theme.font_sizes.subtitle', `${e.target.value}px`)}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
                          placeholder="24"
                          min="8"
                          max="96"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Normal</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={parseInt(formData.settings.theme.font_sizes.normal) || 16}
                          onChange={(e) => updateFormData('settings.theme.font_sizes.normal', `${e.target.value}px`)}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
                          placeholder="16"
                          min="8"
                          max="64"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Pequeño</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={parseInt(formData.settings.theme.font_sizes.small) || 14}
                          onChange={(e) => updateFormData('settings.theme.font_sizes.small', `${e.target.value}px`)}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
                          placeholder="14"
                          min="8"
                          max="32"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Pesos de Fuente</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Light</label>
                      <input
                        type="number"
                        value={formData.settings.theme.font_weights.light}
                        onChange={(e) => updateFormData('settings.theme.font_weights.light', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="100"
                        max="900"
                        step="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Regular</label>
                      <input
                        type="number"
                        value={formData.settings.theme.font_weights.regular}
                        onChange={(e) => updateFormData('settings.theme.font_weights.regular', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="100"
                        max="900"
                        step="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Medium</label>
                      <input
                        type="number"
                        value={formData.settings.theme.font_weights.medium}
                        onChange={(e) => updateFormData('settings.theme.font_weights.medium', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="100"
                        max="900"
                        step="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Bold</label>
                      <input
                        type="number"
                        value={formData.settings.theme.font_weights.bold}
                        onChange={(e) => updateFormData('settings.theme.font_weights.bold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="100"
                        max="900"
                        step="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Elementos de Interfaz</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Estilo de Botones
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateFormData('settings.theme.button_style', 'rounded')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.settings.theme.button_style === 'rounded'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="w-full h-10 bg-blue-500 rounded-lg mb-2"></div>
                        <p className="text-sm font-medium text-center">Redondeados</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData('settings.theme.button_style', 'square')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.settings.theme.button_style === 'square'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="w-full h-10 bg-blue-500 mb-2"></div>
                        <p className="text-sm font-medium text-center">Rectos</p>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Menú
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => updateFormData('settings.ui_settings.layout_type', 'list')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          formData.settings.ui_settings.layout_type === 'list'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="space-y-1 mb-2">
                          <div className="w-full h-2 bg-gray-400 rounded"></div>
                          <div className="w-full h-2 bg-gray-400 rounded"></div>
                          <div className="w-full h-2 bg-gray-400 rounded"></div>
                        </div>
                        <p className="text-xs font-medium text-center">Lista</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData('settings.ui_settings.layout_type', 'grid')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          formData.settings.ui_settings.layout_type === 'grid'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-1 mb-2">
                          <div className="w-full h-3 bg-gray-400 rounded"></div>
                          <div className="w-full h-3 bg-gray-400 rounded"></div>
                          <div className="w-full h-3 bg-gray-400 rounded"></div>
                          <div className="w-full h-3 bg-gray-400 rounded"></div>
                        </div>
                        <p className="text-xs font-medium text-center">Grid</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData('settings.ui_settings.layout_type', 'editorial')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          formData.settings.ui_settings.layout_type === 'editorial'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="space-y-1 mb-2">
                          <div className="w-full h-4 bg-gray-400 rounded"></div>
                          <div className="w-2/3 h-2 bg-gray-300 rounded"></div>
                        </div>
                        <p className="text-xs font-medium text-center">Editorial</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Palette className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Sobre la personalización:</p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Los cambios se aplicarán automáticamente en tu menú público</li>
                      <li>Puedes previsualizar los cambios guardando la configuración</li>
                      <li>Asegúrate de que los colores tengan buen contraste para legibilidad</li>
                      <li>Los tamaños de fuente aceptan valores CSS (px, rem, em)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configuración de Facturación</h3>
                  <p className="text-sm text-gray-600">
                    Información legal y fiscal para la generación de tickets de pedido válidos en Colombia
                  </p>
                </div>
              </div>

              {/* Información del Restaurante */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  Información del Restaurante
                </h4>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre Comercial *
                      </label>
                      <input
                        type="text"
                        value={formData.settings.billing?.nombreComercial || ''}
                        onChange={(e) => updateFormData('settings.billing.nombreComercial', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Restaurante Orlando"
                        required
                      />
                      <p className="text-xs text-gray-500">El nombre que aparecerá en los tickets</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Razón Social
                      </label>
                      <input
                        type="text"
                        value={formData.settings.billing?.razonSocial || ''}
                        onChange={(e) => updateFormData('settings.billing.razonSocial', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Orlando SAS"
                      />
                      <p className="text-xs text-gray-500">Opcional - Nombre legal de la empresa</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        NIT *
                      </label>
                      <input
                        type="text"
                        value={formData.settings.billing?.nit || ''}
                        onChange={(e) => {
                          const formatted = formatNIT(e.target.value);
                          updateFormData('settings.billing.nit', formatted);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          formData.settings.billing?.nit && !validateNIT(formData.settings.billing.nit)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="900123456-7"
                        maxLength={11}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        {formData.settings.billing?.nit && !validateNIT(formData.settings.billing.nit)
                          ? '❌ Formato inválido. Use: 123456789-0'
                          : 'Formato: 123456789-0'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Departamento *
                      </label>
                      <select
                        value={formData.settings.billing?.departamento || 'Cundinamarca'}
                        onChange={(e) => {
                          const newDept = e.target.value;
                          updateFormData('settings.billing.departamento', newDept);
                          const cities = colombianCitiesByDepartment[newDept];
                          if (cities && cities.length > 0) {
                            updateFormData('settings.billing.ciudad', cities[0]);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        {colombianDepartments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Ciudad *
                      </label>
                      <select
                        value={formData.settings.billing?.ciudad || ''}
                        onChange={(e) => updateFormData('settings.billing.ciudad', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        {formData.settings.billing?.departamento &&
                          colombianCitiesByDepartment[formData.settings.billing.departamento]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-gray-500">
                        Selecciona primero el departamento
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={formData.settings.billing?.direccion || ''}
                      onChange={(e) => updateFormData('settings.billing.direccion', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Calle 123 #45-67"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.settings.billing?.telefono || ''}
                        onChange={(e) => updateFormData('settings.billing.telefono', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={formData.settings.billing?.correo || ''}
                        onChange={(e) => updateFormData('settings.billing.correo', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="contacto@restaurante.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Fiscal */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Información Fiscal
                </h4>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Régimen Tributario *
                      </label>
                      <select
                        value={formData.settings.billing?.regimenTributario || 'simple'}
                        onChange={(e) => updateFormData('settings.billing.regimenTributario', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="simple">Régimen Simple</option>
                        <option value="comun">Régimen Común</option>
                        <option value="no_responsable_iva">No responsable de IVA</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        ¿Responsable de IVA? *
                      </label>
                      <div className="flex items-center gap-6 h-12">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="responsableIVA"
                            checked={formData.settings.billing?.responsableIVA === true}
                            onChange={() => updateFormData('settings.billing.responsableIVA', true)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Sí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="responsableIVA"
                            checked={formData.settings.billing?.responsableIVA === false}
                            onChange={() => updateFormData('settings.billing.responsableIVA', false)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ¿Tiene Resolución DIAN? *
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tieneResolucionDIAN"
                          checked={formData.settings.billing?.tieneResolucionDIAN === true}
                          onChange={() => updateFormData('settings.billing.tieneResolucionDIAN', true)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Sí</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tieneResolucionDIAN"
                          checked={formData.settings.billing?.tieneResolucionDIAN === false}
                          onChange={() => updateFormData('settings.billing.tieneResolucionDIAN', false)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  {formData.settings.billing?.tieneResolucionDIAN && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-4">
                      <h5 className="text-sm font-semibold text-gray-900">Datos de la Resolución DIAN</h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Número de Resolución *
                          </label>
                          <input
                            type="text"
                            value={formData.settings.billing?.numeroResolucionDIAN || ''}
                            onChange={(e) => updateFormData('settings.billing.numeroResolucionDIAN', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="18760000001"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Fecha de Resolución *
                          </label>
                          <input
                            type="date"
                            value={formData.settings.billing?.fechaResolucion || ''}
                            onChange={(e) => updateFormData('settings.billing.fechaResolucion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Rango de Numeración - Desde *
                          </label>
                          <input
                            type="number"
                            value={formData.settings.billing?.rangoNumeracionDesde || ''}
                            onChange={(e) => updateFormData('settings.billing.rangoNumeracionDesde', parseInt(e.target.value) || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="1000"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Rango de Numeración - Hasta *
                          </label>
                          <input
                            type="number"
                            value={formData.settings.billing?.rangoNumeracionHasta || ''}
                            onChange={(e) => updateFormData('settings.billing.rangoNumeracionHasta', parseInt(e.target.value) || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10000"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Propina */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Configuración de Propina
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Aplicar propina sugerida? *
                      </label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="aplicaPropina"
                            checked={formData.settings.billing?.aplicaPropina === true}
                            onChange={() => updateFormData('settings.billing.aplicaPropina', true)}
                            className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                          />
                          <span className="text-sm text-gray-700">Sí (10% del subtotal)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="aplicaPropina"
                            checked={formData.settings.billing?.aplicaPropina === false}
                            onChange={() => updateFormData('settings.billing.aplicaPropina', false)}
                            className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                          />
                          <span className="text-sm text-gray-700">No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.settings.billing?.aplicaPropina && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm text-gray-600">
                        La propina sugerida se calculará automáticamente como el 10% del subtotal y se mostrará al final del ticket. El cliente puede decidir si desea incluirla o no.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personalización del Ticket */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Personalización del Ticket
                </h4>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      ¿Mostrar logo en el ticket?
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mostrarLogoEnTicket"
                          checked={formData.settings.billing?.mostrarLogoEnTicket === true}
                          onChange={() => updateFormData('settings.billing.mostrarLogoEnTicket', true)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Sí</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mostrarLogoEnTicket"
                          checked={formData.settings.billing?.mostrarLogoEnTicket === false}
                          onChange={() => updateFormData('settings.billing.mostrarLogoEnTicket', false)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  {formData.settings.billing?.mostrarLogoEnTicket && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Logo para el ticket
                      </label>

                      {formData.settings.billing?.logoTicket && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <img
                            src={formData.settings.billing.logoTicket}
                            alt="Logo del ticket"
                            className="w-16 h-16 object-contain rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Logo actual</p>
                            <p className="text-xs text-gray-500">Click para cambiar</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateFormData('settings.billing.logoTicket', '')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}

                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 1024 * 1024) {
                                showToast('error', 'Archivo muy grande', 'El tamaño máximo es 1MB', 3000);
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateFormData('settings.billing.logoTicket', reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm w-full justify-center">
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.settings.billing?.logoTicket ? 'Cambiar logo' : 'Subir logo'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500">
                        PNG o JPG. Máximo 1MB. Se recomienda 200x200px
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mensaje final del ticket (opcional)
                    </label>
                    <textarea
                      value={formData.settings.billing?.mensajeFinalTicket || ''}
                      onChange={(e) => updateFormData('settings.billing.mensajeFinalTicket', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      placeholder="¡Gracias por tu visita! Esperamos verte pronto."
                    />
                    <p className="text-xs text-gray-500">
                      Este mensaje aparecerá al final de cada ticket
                    </p>
                  </div>
                </div>
              </div>

              {/* Información importante */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">Sobre la configuración de facturación:</p>
                    <ul className="text-xs text-green-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Estos datos se utilizarán para generar tickets de pedido legalmente válidos en Colombia</li>
                      <li>Si eres responsable de IVA, el IVA se calculará y mostrará en cada ticket</li>
                      <li>La resolución DIAN es requerida para facturación electrónica</li>
                      <li>La propina es opcional y aparecerá como sugerencia al cliente</li>
                      <li>Asegúrate de mantener esta información actualizada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promo' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-orange-600" />
                  Configuración Promocional
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configura la imagen promocional y los productos destacados en tu menú público
                </p>
              </div>

              {/* Vertical Promo Image */}
              <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-5 h-5 text-orange-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen Promocional Vertical
                  </label>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Sube una imagen que aparecerá al hacer clic en el botón de promociones en el menú público
                </p>
                <div className="space-y-2">
                  {formData.settings.promo?.vertical_promo_image && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <img
                        src={formData.settings.promo.vertical_promo_image}
                        alt="Promo Vertical"
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Imagen promocional actual</p>
                        <p className="text-xs text-gray-500">Se mostrará al hacer clic en el botón de promoción</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateFormData('settings.promo.vertical_promo_image', '')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('error', 'Archivo muy grande', 'El tamaño máximo es 5MB', 3000);
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateFormData('settings.promo.vertical_promo_image', reader.result as string);
                            updateFormData('settings.promo.enabled', true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm w-full justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir imagen promocional vertical
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">
                    Recomendado: 600x900px (formato vertical). Máximo 5MB. Formatos: JPG, PNG, WebP
                  </p>
                </div>
              </div>

              {/* Featured Products Selector */}
              <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Productos Destacados (Máximo 5)
                  </label>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Selecciona hasta 5 productos para mostrar en el carrusel de destacados
                </p>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  {(() => {
                    const allProducts = loadFromStorage('products', []);
                    const restaurantProducts = allProducts.filter((p: any) =>
                      p.restaurant_id === restaurant?.id && p.status === 'active'
                    );
                    const selectedIds = formData.settings.promo?.featured_product_ids || [];

                    return (
                      <div className="space-y-2">
                        {restaurantProducts.map((product: any) => {
                          const isSelected = selectedIds.includes(product.id);
                          const canSelect = selectedIds.length < 5 || isSelected;

                          return (
                            <label
                              key={product.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-50 border-orange-300'
                                  : canSelect
                                  ? 'bg-white border-gray-200 hover:border-gray-300'
                                  : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!canSelect}
                                onChange={(e) => {
                                  let newIds = [...selectedIds];
                                  if (e.target.checked) {
                                    if (newIds.length < 5) {
                                      newIds.push(product.id);
                                    }
                                  } else {
                                    newIds = newIds.filter(id => id !== product.id);
                                  }
                                  updateFormData('settings.promo.featured_product_ids', newIds);
                                }}
                                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                              />
                              {product.images[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              </div>
                              {isSelected && (
                                <Badge variant="success">Destacado</Badge>
                              )}
                            </label>
                          );
                        })}
                        {restaurantProducts.length === 0 && (
                          <p className="text-center text-gray-500 text-sm py-4">
                            No hay productos disponibles. Crea productos primero.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-600">
                  {formData.settings.promo?.featured_product_ids?.length || 0} de 5 productos seleccionados
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Megaphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Consejos para promociones:</p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>La imagen promocional vertical aparecerá al hacer clic en el botón de regalo</li>
                      <li>Los productos destacados aparecerán en un carrusel en la parte superior del menú</li>
                      <li>Usa imágenes atractivas y de alta calidad de tus productos destacados</li>
                      <li>Selecciona tus mejores productos o los que tengan promociones especiales</li>
                    </ul>
                  </div>
                </div>
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