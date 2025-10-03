import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, MapPin, Calendar, ShoppingBag, Filter, Search, Star, CreditCard as Edit, ArrowUpDown, Trash2, Info, Download, CheckSquare, Square, Users, DollarSign, TrendingUp, UserCheck, UserPlus, Upload } from 'lucide-react';
import { Order, Customer, Subscription } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface CustomerData extends Customer {
  id: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orderTypes: string[];
  isVip: boolean;
}

export const CustomersManagement: React.FC = () => {
  const { restaurant } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'vip' | 'frequent' | 'regular' | 'new'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerData | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditAction, setBulkEditAction] = useState<'vip' | 'remove_vip' | 'delete'>('vip');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    delivery_instructions: '',
    isVip: false,
  });

  useEffect(() => {
    if (restaurant) {
      loadCustomersData();
    }
  }, [restaurant]);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, sortBy, sortDirection, filterBy, statusFilter]);

  const loadCustomersData = () => {
    if (!restaurant) return;

    const allOrders = loadFromStorage('orders') || [];
    const vipCustomers = loadFromStorage('vipCustomers') || [];
    const restaurantOrders = allOrders.filter((order: Order) =>
      order &&
      order.restaurant_id === restaurant.id &&
      order.order_number &&
      order.status &&
      order.items
    );

    // Group orders by customer phone (unique identifier) to avoid duplicates
    const customerMap = new Map<string, CustomerData>();

    restaurantOrders.forEach((order: Order) => {
      if (!order.customer || !order.customer.phone) return;

      const customerKey = order.customer.phone;

      if (customerMap.has(customerKey)) {
        const existing = customerMap.get(customerKey)!;
        existing.totalOrders += 1;
        existing.totalSpent += order.status === 'delivered' ? order.total : 0;
        existing.lastOrderDate = order.created_at > existing.lastOrderDate ? order.created_at : existing.lastOrderDate;
        if (!existing.orderTypes.includes(order.order_type)) {
          existing.orderTypes.push(order.order_type);
        }
        existing.name = order.customer.name || existing.name;
        existing.email = order.customer.email || existing.email;
        existing.address = order.customer.address || existing.address;
        existing.delivery_instructions = order.customer.delivery_instructions || existing.delivery_instructions;
      } else {
        const isVip = vipCustomers.some((vip: any) =>
          vip.restaurant_id === restaurant.id && vip.phone === order.customer.phone
        );
        customerMap.set(customerKey, {
          id: order.customer.phone,
          name: order.customer.name || 'N/A',
          phone: order.customer.phone,
          email: order.customer.email,
          address: order.customer.address,
          delivery_instructions: order.customer.delivery_instructions,
          totalOrders: 1,
          totalSpent: order.status === 'delivered' ? order.total : 0,
          lastOrderDate: order.created_at,
          orderTypes: [order.order_type],
          isVip: isVip,
        });
      }
    });

    setCustomers(Array.from(customerMap.values()));
  };

  const filterAndSortCustomers = () => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply segment filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(customer => {
        switch (filterBy) {
          case 'vip':
            return customer.isVip;
          case 'frequent':
            return customer.totalOrders >= 5;
          case 'regular':
            return customer.totalOrders >= 2 && customer.totalOrders <= 4;
          case 'new':
            return customer.totalOrders === 1;
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const daysSinceLastOrder = Math.ceil((new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
        const isActive = daysSinceLastOrder <= 30; // Active if ordered in last 30 days
        
        if (statusFilter === 'active') {
          return isActive;
        } else if (statusFilter === 'inactive') {
          return !isActive;
        }
        return true;
      });
    }

    // Sort customers
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'orders':
          comparison = a.totalOrders - b.totalOrders;
          break;
        case 'spent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'date':
          comparison = new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredCustomers(filtered);
  };

  const toggleVipStatus = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Update VIP customers in localStorage
    const vipCustomers = loadFromStorage('vipCustomers') || [];
    
    if (customer.isVip) {
      // Remove from VIP list
      const updatedVipCustomers = vipCustomers.filter((vip: any) => 
        !(vip.restaurant_id === restaurant?.id && vip.phone === customer.phone)
      );
      saveToStorage('vipCustomers', updatedVipCustomers);
    } else {
      // Add to VIP list
      const newVipCustomer = {
        restaurant_id: restaurant?.id,
        phone: customer.phone,
        name: customer.name,
        created_at: new Date().toISOString(),
      };
      saveToStorage('vipCustomers', [...vipCustomers, newVipCustomer]);
    }

    // Update local state
    setCustomers(prevCustomers =>
      prevCustomers.map(c =>
        c.id === customerId
          ? { ...c, isVip: !c.isVip }
          : c
      )
    );

    showToast(
      'success',
      customer.isVip ? 'Cliente VIP Removido' : 'Cliente VIP Agregado',
      customer.isVip 
        ? `${customer.name} ya no es un cliente VIP.`
        : `${customer.name} ahora es un cliente VIP.`,
      4000
    );
  };

  const toggleCustomerSelection = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const handleBulkEdit = () => {
    if (selectedCustomers.size === 0) {
      showToast('warning', 'Sin selección', 'Selecciona al menos un cliente para editar.', 4000);
      return;
    }
    setShowBulkEditModal(true);
  };

  const executeBulkEdit = () => {
    const selectedCustomersList = customers.filter(c => selectedCustomers.has(c.id));
    
    switch (bulkEditAction) {
      case 'vip':
        // Agregar VIP a todos los seleccionados
        const vipCustomers = loadFromStorage('vipCustomers') || [];
        const newVipCustomers = [...vipCustomers];
        
        selectedCustomersList.forEach(customer => {
          if (!customer.isVip) {
            newVipCustomers.push({
              restaurant_id: restaurant?.id,
              phone: customer.phone,
              name: customer.name,
              created_at: new Date().toISOString(),
            });
          }
        });
        
        saveToStorage('vipCustomers', newVipCustomers);
        
        // Update local state
        setCustomers(prevCustomers =>
          prevCustomers.map(c =>
            selectedCustomers.has(c.id)
              ? { ...c, isVip: true }
              : c
          )
        );
        
        showToast('success', 'VIP Asignado', `${selectedCustomers.size} cliente${selectedCustomers.size !== 1 ? 's' : ''} marcado${selectedCustomers.size !== 1 ? 's' : ''} como VIP.`, 4000);
        break;
        
      case 'remove_vip':
        // Remover VIP de todos los seleccionados
        const allVipCustomers = loadFromStorage('vipCustomers') || [];
        const updatedVipCustomers = allVipCustomers.filter((vip: any) => 
          !(vip.restaurant_id === restaurant?.id && selectedCustomersList.some(c => c.phone === vip.phone))
        );
        saveToStorage('vipCustomers', updatedVipCustomers);
        
        // Update local state
        setCustomers(prevCustomers =>
          prevCustomers.map(c =>
            selectedCustomers.has(c.id)
              ? { ...c, isVip: false }
              : c
          )
        );
        
        showToast('info', 'VIP Removido', `${selectedCustomers.size} cliente${selectedCustomers.size !== 1 ? 's' : ''} ya no ${selectedCustomers.size !== 1 ? 'son' : 'es'} VIP.`, 4000);
        break;
        
      case 'delete':
        // Eliminar todos los seleccionados
        if (confirm(`¿Estás seguro de que quieres eliminar ${selectedCustomers.size} cliente${selectedCustomers.size !== 1 ? 's' : ''}? Esta acción eliminará también todos sus pedidos y no se puede deshacer.`)) {
          selectedCustomersList.forEach(customer => {
            deleteCustomerData(customer);
          });
          
          showToast('info', 'Clientes Eliminados', `${selectedCustomers.size} cliente${selectedCustomers.size !== 1 ? 's' : ''} eliminado${selectedCustomers.size !== 1 ? 's' : ''} exitosamente.`, 5000);
        }
        break;
    }
    
    setSelectedCustomers(new Set());
    setShowBulkEditModal(false);
  };

  const handleEditCustomer = (customer: CustomerData) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      delivery_instructions: customer.delivery_instructions || '',
      isVip: customer.isVip,
    });
    setShowEditModal(true);
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer) return;

    // Update customers in localStorage
    const allOrders = loadFromStorage('orders') || [];
    const updatedOrders = allOrders.map((order: Order) => {
      if (order.customer.phone === editingCustomer.phone) {
        return {
          ...order,
          customer: {
            ...order.customer,
            name: editForm.name,
            phone: editForm.phone,
            email: editForm.email,
            address: editForm.address,
            delivery_instructions: editForm.delivery_instructions,
          }
        };
      }
      return order;
    });
    saveToStorage('orders', updatedOrders);

    // Update local state
    setCustomers(prevCustomers =>
      prevCustomers.map(customer =>
        customer.id === editingCustomer.id
          ? {
              ...customer,
              name: editForm.name,
              phone: editForm.phone,
              email: editForm.email,
              address: editForm.address,
              delivery_instructions: editForm.delivery_instructions,
              isVip: editForm.isVip,
            }
          : customer
      )
    );

    setShowEditModal(false);
    setEditingCustomer(null);
    
    showToast(
      'success',
      'Cliente Actualizado',
      'La información del cliente ha sido actualizada exitosamente.',
      4000
    );
  };

  const handleDeleteCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    
    deleteCustomerData(customerToDelete);
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const deleteCustomerData = (customer: CustomerData) => {
    // Remove all orders from this customer
    const allOrders = loadFromStorage('orders') || [];
    const updatedOrders = allOrders.filter((order: Order) => 
      order.customer.phone !== customer.phone
    );
    saveToStorage('orders', updatedOrders);

    // Remove from VIP customers if exists
    const vipCustomers = loadFromStorage('vipCustomers') || [];
    const updatedVipCustomers = vipCustomers.filter((vip: any) => 
      !(vip.restaurant_id === restaurant?.id && vip.phone === customer.phone)
    );
    saveToStorage('vipCustomers', updatedVipCustomers);

    // Update local state by reloading data
    loadCustomersData();
    
    showToast(
      'info',
      'Cliente Eliminado',
      `El cliente "${customer.name}" y todos sus pedidos han sido eliminados.`,
      5000
    );
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCustomer(null);
    setEditForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      delivery_instructions: '',
      isVip: false,
    });
  };

  const getOrderTypeBadge = (orderType: string) => {
    switch (orderType) {
      case 'delivery':
        return <Badge variant="info" size="sm">{t('delivery')}</Badge>;
      case 'pickup':
        return <Badge variant="gray" size="sm">{t('pickup')}</Badge>;
      case 'table':
        return <Badge variant="warning" size="sm">{t('mesa')}</Badge>;
      default:
        return <Badge variant="gray" size="sm">{orderType}</Badge>;
    }
  };

  const getCustomerSegment = (totalSpent: number, totalOrders: number) => {
    const segments = [];
    
    if (totalOrders === 1) {
      segments.push(<Badge key="new" variant="info">{t('newCustomer')}</Badge>);
    } else if (totalOrders >= 2 && totalOrders <= 4) {
      segments.push(<Badge key="regular" variant="gray">{t('regular')}</Badge>);
    } else if (totalOrders >= 5) {
      segments.push(<Badge key="frequent" variant="warning">{t('frequent')}</Badge>);
    } else {
      segments.push(<Badge key="default" variant="gray">{t('regular')}</Badge>);
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {segments}
      </div>
    );
  };

  const exportToCSV = () => {
    // Usar los clientes filtrados actuales
    const dataToExport = filteredCustomers;
    
    if (dataToExport.length === 0) {
      showToast(
        'warning',
        'Sin datos para exportar',
        'No hay clientes que coincidan con los filtros actuales.',
        4000
      );
      return;
    }

    // Definir las columnas del CSV
    const headers = [
      'Nombre',
      'Teléfono',
      'Email',
      'Dirección',
      'Total Pedidos',
      'Total Gastado',
      'Promedio por Pedido',
      'Tipos de Pedido',
      'Es VIP',
      'Segmento',
      'Último Pedido',
      'Referencias de Entrega'
    ];

    // Función para obtener el segmento como texto
    const getSegmentText = (totalOrders: number, isVip: boolean) => {
      const segments = [];
      
      if (isVip) segments.push('VIP');
      
      if (totalOrders === 1) {
        segments.push('Nuevo');
      } else if (totalOrders >= 2 && totalOrders <= 4) {
        segments.push('Regular');
      } else if (totalOrders >= 5) {
        segments.push('Frecuente');
      }
      
      return segments.join(', ');
    };

    // Convertir datos a formato CSV
    const csvData = dataToExport.map(customer => [
      customer.name,
      customer.phone,
      customer.email || '',
      customer.address || '',
      customer.totalOrders,
      customer.totalSpent.toFixed(2),
      (customer.totalSpent / customer.totalOrders).toFixed(2),
      customer.orderTypes.join(', '),
      customer.isVip ? 'Sí' : 'No',
      getSegmentText(customer.totalOrders, customer.isVip),
      new Date(customer.lastOrderDate).toLocaleDateString(),
      customer.delivery_instructions || ''
    ]);

    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          // Escapar comillas y envolver en comillas si contiene comas, saltos de línea o comillas
          typeof field === 'string' && (field.includes(',') || field.includes('\n') || field.includes('"'))
            ? `"${field.replace(/"/g, '""')}"`
            : field
        ).join(',')
      )
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generar nombre de archivo con fecha y filtros aplicados
      const today = new Date().toISOString().split('T')[0];
      let fileName = `clientes_${restaurant?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_${today}`;
      
      // Añadir información de filtros al nombre
      if (searchTerm) {
        fileName += `_busqueda_${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }
      if (filterBy !== 'all') {
        fileName += `_${filterBy}`;
      }
      if (statusFilter !== 'all') {
        fileName += `_${statusFilter}`;
      }
      
      link.setAttribute('download', `${fileName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    showToast(
      'success',
      'CSV Exportado',
      `Se han exportado ${dataToExport.length} cliente${dataToExport.length !== 1 ? 's' : ''} exitosamente.`,
      4000
    );
  };

  const downloadCSVTemplate = () => {
    const headers = [
      'Nombre',
      'Teléfono',
      'Email',
      'Dirección',
      'Referencias de Entrega',
      'Es VIP'
    ];

    const exampleRows = [
      [
        'Juan Pérez',
        '+573001234567',
        'juan.perez@email.com',
        'Calle 123 #45-67, Bogotá',
        'Casa de dos pisos, portón azul',
        'Sí'
      ],
      [
        'María González',
        '+573009876543',
        'maria.gonzalez@email.com',
        'Carrera 45 #12-34, Medellín',
        'Apartamento 301, edificio blanco',
        'No'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row =>
        row.map(field =>
          typeof field === 'string' && (field.includes(',') || field.includes('\n') || field.includes('"'))
            ? `"${field.replace(/"/g, '""')}"`
            : field
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'plantilla_clientes.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    showToast(
      'success',
      'Plantilla Descargada',
      'Usa esta plantilla como guía para importar clientes.',
      4000
    );
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showToast('error', 'Archivo inválido', 'Por favor selecciona un archivo CSV válido.', 4000);
      return;
    }

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };

    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      setImportErrors(['El archivo CSV está vacío o no tiene datos.']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const requiredHeaders = ['Nombre', 'Teléfono'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      setImportErrors([`Columnas requeridas faltantes: ${missingHeaders.join(', ')}`]);
      return;
    }

    const errors: string[] = [];
    const preview: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, ''));

      if (values.length !== headers.length) {
        errors.push(`Línea ${i + 1}: Número incorrecto de columnas (esperado ${headers.length}, obtenido ${values.length})`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      if (!row['Nombre'] || !row['Nombre'].trim()) {
        errors.push(`Línea ${i + 1}: El nombre es requerido`);
        continue;
      }

      if (!row['Teléfono'] || !row['Teléfono'].trim()) {
        errors.push(`Línea ${i + 1}: El teléfono es requerido`);
        continue;
      }

      const existingCustomer = customers.find(c => c.phone === row['Teléfono']);
      if (existingCustomer) {
        errors.push(`Línea ${i + 1}: El cliente con teléfono ${row['Teléfono']} ya existe`);
        continue;
      }

      preview.push({
        name: row['Nombre'],
        phone: row['Teléfono'],
        email: row['Email'] || '',
        address: row['Dirección'] || '',
        delivery_instructions: row['Referencias de Entrega'] || '',
        isVip: row['Es VIP']?.toLowerCase() === 'sí' || row['Es VIP']?.toLowerCase() === 'si' || row['Es VIP']?.toLowerCase() === 'yes',
        lineNumber: i + 1
      });
    }

    setImportErrors(errors);
    setImportPreview(preview);

    if (preview.length > 0) {
      setShowImportModal(true);
    } else {
      showToast('error', 'Sin datos válidos', 'No se encontraron datos válidos para importar.', 4000);
    }
  };

  const executeImport = () => {
    if (importPreview.length === 0) return;

    const allOrders = loadFromStorage('orders') || [];
    const vipCustomers = loadFromStorage('vipCustomers') || [];

    importPreview.forEach(customer => {
      const newOrder: Order = {
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_number: `IMP-${Date.now()}`,
        restaurant_id: restaurant?.id || '',
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          delivery_instructions: customer.delivery_instructions,
        },
        items: [],
        total: 0,
        status: 'delivered',
        order_type: 'delivery',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      allOrders.push(newOrder);

      if (customer.isVip) {
        vipCustomers.push({
          restaurant_id: restaurant?.id,
          phone: customer.phone,
          name: customer.name,
          created_at: new Date().toISOString(),
        });
      }
    });

    saveToStorage('orders', allOrders);
    saveToStorage('vipCustomers', vipCustomers);

    loadCustomersData();

    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    setImportErrors([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    showToast(
      'success',
      'Importación Exitosa',
      `Se importaron ${importPreview.length} cliente${importPreview.length !== 1 ? 's' : ''} exitosamente.`,
      4000
    );
  };

  const cancelImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    setImportErrors([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const stats = {
    totalCustomers: customers.length,
    vipCustomers: customers.filter(c => c.isVip).length,
    frequentCustomers: customers.filter(c => c.totalOrders >= 5).length,
    regularCustomers: customers.filter(c => c.totalOrders >= 2 && c.totalOrders <= 4).length,
    newCustomers: customers.filter(c => c.totalOrders === 1).length,
    activeCustomers: customers.filter(c => {
      const daysSinceLastOrder = Math.ceil((new Date().getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastOrder <= 30;
    }).length,
    inactiveCustomers: customers.filter(c => {
      const daysSinceLastOrder = Math.ceil((new Date().getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastOrder > 30;
    }).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
    topCustomerSpent: customers.length > 0 ? Math.max(...customers.map(c => c.totalSpent)) : 0,
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('customerManagement')}</h1>
        <div className="flex gap-3">
          {selectedCustomers.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Users}
              onClick={handleBulkEdit}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              Editar {selectedCustomers.size} seleccionado{selectedCustomers.size !== 1 ? 's' : ''}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={exportToCSV}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Importar CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            Filtros y Búsqueda
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900 mb-1">Total Clientes</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalCustomers}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-blue-200">
            <span className="text-xs text-blue-700 font-medium">Base de clientes</span>
            <span className="text-sm font-bold text-blue-800">
              {stats.newCustomers} nuevos
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-900 mb-1">Clientes VIP</p>
              <p className="text-3xl font-bold text-purple-900">{stats.vipCustomers}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-purple-200">
            <span className="text-xs text-purple-700 font-medium">Asignados manualmente</span>
            <span className="text-sm font-bold text-purple-800">
              {((stats.vipCustomers / stats.totalCustomers) * 100 || 0).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-900 mb-1">Frecuentes</p>
              <p className="text-3xl font-bold text-green-900">{stats.frequentCustomers}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-green-200">
            <span className="text-xs text-green-700 font-medium">5+ pedidos</span>
            <span className="text-sm font-bold text-green-800">
              {((stats.frequentCustomers / stats.totalCustomers) * 100 || 0).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-orange-900 mb-1">Gasto Promedio</p>
              <p className="text-3xl font-bold text-orange-900">${stats.averageSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-orange-200">
            <span className="text-xs text-orange-700 font-medium">Por cliente</span>
            <span className="text-sm font-bold text-green-700">
              ${stats.totalRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Filters and Search */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`${t('search')} clientes por nombre, teléfono o email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos (últimos 30 días)</option>
                <option value="inactive">Inactivos (+30 días)</option>
              </select>
            </div>
            
            {/* Segment Filter */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
              >
                <option value="all">Todos los segmentos</option>
                <option value="vip">Solo VIP</option>
                <option value="frequent">Solo Frecuentes (5+)</option>
                <option value="regular">Solo Regular (2-4)</option>
                <option value="new">Solo Nuevos (1)</option>
              </select>
            </div>
            
            {/* Sort Filter */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
              >
                <option value="name">Ordenar por {t('name')}</option>
                <option value="orders">Ordenar por {t('ordersCount')}</option>
                <option value="spent">Ordenar por {t('totalSpent')}</option>
                <option value="date">Ordenar por {t('date')}</option>
              </select>
            </div>
            
            {/* Sort Direction Arrow Button */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors flex items-center gap-1"
                title={sortDirection === 'asc' ? 'Cambiar a descendente' : 'Cambiar a ascendente'}
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {customers.length === 0 ? 'No registered customers' : 'No customers found'}
          </h3>
          <p className="text-gray-600">
            {customers.length === 0 
              ? 'Customers will appear here once they place orders.'
              : 'Try different search terms.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('ordersCount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('totalSpent')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orderTypes')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative group">
                    <div className="flex items-center relative">
                      {t('segment')}
                      <Info className="w-3 h-3 ml-1 text-gray-400" />
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-white text-gray-800 text-xs rounded-lg p-3 w-64 shadow-xl border border-gray-200 z-50">
                        <div className="space-y-1">
                          <div><strong className="text-green-600">VIP:</strong> Asignado manualmente</div>
                          <div><strong className="text-blue-600">Nuevo:</strong> 1 pedido</div>
                          <div><strong className="text-gray-600">Regular:</strong> 2-4 pedidos</div>
                          <div><strong className="text-orange-600">Frecuente:</strong> 5+ pedidos</div>
                          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            * Un cliente puede ser VIP y tener otro segmento
                          </div>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('lastOrder')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          {customer.address && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {customer.address.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.totalOrders}
                      </div>
                      <div className="text-sm text-gray-500">
                        orders
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${(customer.totalSpent / customer.totalOrders).toFixed(2)} avg
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {customer.orderTypes.map(type => (
                          <div key={type}>
                            {getOrderTypeBadge(type)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {customer.isVip && <Badge variant="success">VIP</Badge>}
                        {getCustomerSegment(customer.totalSpent, customer.totalOrders)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 mr-2"
                        title="Editar cliente"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                      </button>
                      <button
                        onClick={() => toggleVipStatus(customer.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          customer.isVip
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } mr-2`}
                        title={customer.isVip ? 'Quitar VIP' : 'Hacer VIP'}
                      >
                        <Star className={`w-3 h-3 mr-1 ${customer.isVip ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors bg-red-100 text-red-800 hover:bg-red-200"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Editar Cliente"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo*"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre del cliente"
            />
            <Input
              label="Teléfono*"
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="cliente@email.com"
          />
          
          <Input
            label="Dirección"
            value={editForm.address}
            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Dirección completa"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencias de Entrega
            </label>
            <textarea
              value={editForm.delivery_instructions}
              onChange={(e) => setEditForm(prev => ({ ...prev, delivery_instructions: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Referencias para encontrar la dirección..."
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editForm.isVip}
              onChange={(e) => setEditForm(prev => ({ ...prev, isVip: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Cliente VIP
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleCloseEditModal}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (editingCustomer) {
                  setCustomerToDelete(editingCustomer);
                  setShowDeleteModal(true);
                  handleCloseEditModal();
                }
              }}
            >
              Eliminar Cliente
            </Button>
            <Button
              onClick={handleSaveCustomer}
              disabled={!editForm.name.trim() || !editForm.phone.trim()}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        title="Confirmar Eliminación"
        size="md"
      >
        {customerToDelete && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar cliente "{customerToDelete.name}"?
              </h3>
              <p className="text-gray-600 mb-4">
                Esta acción eliminará permanentemente:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Toda la información del cliente</li>
                  <li>• {customerToDelete.totalOrders} pedido{customerToDelete.totalOrders !== 1 ? 's' : ''} asociado{customerToDelete.totalOrders !== 1 ? 's' : ''}</li>
                  <li>• Historial de compras (${customerToDelete.totalSpent.toFixed(2)})</li>
                  {customerToDelete.isVip && <li>• Estado VIP del cliente</li>}
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
                  setCustomerToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteCustomer}
                icon={Trash2}
              >
                Eliminar Cliente
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal
        isOpen={showBulkEditModal}
        onClose={() => {
          setShowBulkEditModal(false);
          setBulkEditAction('vip');
        }}
        title="Edición Masiva"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {selectedCustomers.size} cliente{selectedCustomers.size !== 1 ? 's' : ''} seleccionado{selectedCustomers.size !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona la acción a realizar:
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bulkAction"
                  value="vip"
                  checked={bulkEditAction === 'vip'}
                  onChange={(e) => setBulkEditAction(e.target.value as any)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Marcar como VIP</span>
                  <p className="text-xs text-gray-500">Agregar estado VIP a todos los clientes seleccionados</p>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bulkAction"
                  value="remove_vip"
                  checked={bulkEditAction === 'remove_vip'}
                  onChange={(e) => setBulkEditAction(e.target.value as any)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Remover VIP</span>
                  <p className="text-xs text-gray-500">Quitar estado VIP de todos los clientes seleccionados</p>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bulkAction"
                  value="delete"
                  checked={bulkEditAction === 'delete'}
                  onChange={(e) => setBulkEditAction(e.target.value as any)}
                  className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 mr-3"
                />
                <div>
                  <span className="text-sm font-medium text-red-900">Eliminar clientes</span>
                  <p className="text-xs text-red-500">⚠️ Eliminar permanentemente todos los clientes y sus pedidos</p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowBulkEditModal(false);
                setBulkEditAction('vip');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={executeBulkEdit}
              variant={bulkEditAction === 'delete' ? 'danger' : 'primary'}
              icon={bulkEditAction === 'delete' ? Trash2 : Users}
            >
              {bulkEditAction === 'vip' && 'Marcar como VIP'}
              {bulkEditAction === 'remove_vip' && 'Remover VIP'}
              {bulkEditAction === 'delete' && 'Eliminar Clientes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={cancelImport}
        title="Importar Clientes desde CSV"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Formato del archivo CSV:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Nombre</strong> (requerido): Nombre completo del cliente</li>
                  <li><strong>Teléfono</strong> (requerido): Número de teléfono único</li>
                  <li><strong>Email</strong> (opcional): Correo electrónico</li>
                  <li><strong>Dirección</strong> (opcional): Dirección completa</li>
                  <li><strong>Referencias de Entrega</strong> (opcional): Indicaciones adicionales</li>
                  <li><strong>Es VIP</strong> (opcional): "Sí" o "No"</li>
                </ul>
                <button
                  onClick={downloadCSVTemplate}
                  className="mt-3 text-xs font-medium text-blue-700 hover:text-blue-800 underline"
                >
                  Descargar plantilla de ejemplo
                </button>
              </div>
            </div>
          </div>

          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-2">Se encontraron {importErrors.length} error{importErrors.length !== 1 ? 'es' : ''}:</p>
                  <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {importErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {importPreview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Vista previa: {importPreview.length} cliente{importPreview.length !== 1 ? 's' : ''} válido{importPreview.length !== 1 ? 's' : ''}
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                <div className="space-y-3">
                  {importPreview.map((customer, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{customer.name}</span>
                            {customer.isVip && <Badge variant="success" size="sm">VIP</Badge>}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {customer.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">Línea {customer.lineNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={cancelImport}
            >
              Cancelar
            </Button>
            <Button
              onClick={executeImport}
              disabled={importPreview.length === 0}
              icon={Upload}
            >
              Importar {importPreview.length} Cliente{importPreview.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};