import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Calendar, ShoppingBag, Filter, Search, Star, Edit, ArrowUpDown, Trash2, Info, Download, CheckSquare, Square, Users, Upload } from 'lucide-react';
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
  const [importing, setImporting] = useState(false);
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
      order.restaurant_id === restaurant.id
    );

    // Group orders by customer phone (unique identifier) to avoid duplicates
    const customerMap = new Map<string, CustomerData>();

    restaurantOrders.forEach((order: Order) => {
      const customerKey = order.customer.phone; // Use phone as unique identifier
      
      if (customerMap.has(customerKey)) {
    const requiredHeaders = ['Nombre'];
        existing.totalOrders += 1;
        existing.totalSpent += order.status === 'delivered' ? order.total : 0;
        existing.lastOrderDate = order.created_at > existing.lastOrderDate ? order.created_at : existing.lastOrderDate;
        if (!existing.orderTypes.includes(order.order_type)) {
          existing.orderTypes.push(order.order_type);
      errors.push('El archivo debe contener al menos la columna "Nombre".');
        // Update customer info with most recent data (keep latest information)
        existing.name = order.customer.name;
        existing.email = order.customer.email || existing.email;
        existing.address = order.customer.address || existing.address;
        existing.delivery_instructions = order.customer.delivery_instructions || existing.delivery_instructions;
      } else {
        const isVip = vipCustomers.some((vip: any) => 
      // Only validate required field: Nombre
        );
        customerMap.set(customerKey, {
          id: order.customer.phone,
          name: order.customer.name,
      // Optional phone validation - only if provided
      if (row['Teléfono'] && row['Teléfono'].toString().trim() !== '') {
        if (!/^[\d+\-\s()]+$/.test(row['Teléfono'].toString().trim())) {
          rowErrors.push('Formato de teléfono inválido');
        }
          totalOrders: 1,
          totalSpent: order.status === 'delivered' ? order.total : 0,
      // Optional email validation - only if provided
      if (row['Email'] && row['Email'].toString().trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row['Email'].toString().trim())) {
          rowErrors.push('Formato de email inválido');
        }
      }
      
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
        const isVip = customer.isVip || customer.totalOrders >= 10;
        const isFrequent = customer.totalOrders >= 5 && !isVip;
        const isNew = customer.totalOrders < 3 && !isFrequent && !isVip;

        switch (filterBy) {
          case 'vip':
            return isVip;
          case 'frequent':
            return isFrequent;
          case 'new':
            return isNew;
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
      .map((c: any) => c.phone)
      .filter(Boolean); // Filter out empty phones
    if (!customer) return;

    // Update VIP customers in localStorage
    const vipCustomers = loadFromStorage('vipCustomers') || [];
    
      const phone = row['Teléfono'] ? row['Teléfono'].toString().trim() : '';
      // Remove from VIP list
      // Only check for duplicates if phone is provided
      if (phone && existingPhones.includes(phone)) {
        !(vip.restaurant_id === restaurant?.id && vip.phone === customer.phone)
      );
      saveToStorage('vipCustomers', updatedVipCustomers);
    } else {
        phone: phone,
        email: row['Email'] ? row['Email'].toString().trim() : '',
        restaurant_id: restaurant?.id,
        phone: customer.phone,
        is_vip: row['Es VIP'] ? ['sí', 'si', 'yes', 'true', '1'].includes(row['Es VIP'].toString().toLowerCase()) : false,
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

  const handleImportCSV = () => {
    setShowImportModal(true);
    setImportFile(null);
    setImportPreview([]);
    setImportErrors([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast(
        'error',
        'Formato de archivo inválido',
        'Por favor selecciona un archivo CSV válido.',
        4000
      );
      return;
    }

    setImportFile(file);
    parseCSVFile(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setImportErrors(['El archivo CSV debe contener al menos una fila de encabezados y una fila de datos.']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const expectedHeaders = [
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

      // Verificar que los encabezados sean correctos
      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        setImportErrors([
          `Faltan las siguientes columnas requeridas: ${missingHeaders.join(', ')}`,
          'Por favor usa el formato de exportación como referencia.'
        ]);
        return;
      }

      const preview: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
          errors.push(`Fila ${i + 1}: Número incorrecto de columnas`);
          continue;
        }

        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        // Validar datos requeridos
        if (!rowData['Nombre']?.trim()) {
          errors.push(`Fila ${i + 1}: El nombre es obligatorio`);
        }
        if (!rowData['Teléfono']?.trim()) {
          errors.push(`Fila ${i + 1}: El teléfono es obligatorio`);
        }
        if (rowData['Teléfono'] && !/^[\d+\-\s()]+$/.test(rowData['Teléfono'].trim())) {
          errors.push(`Fila ${i + 1}: El teléfono contiene caracteres inválidos`);
        }

        preview.push(rowData);
      }

      setImportPreview(preview);
      setImportErrors(errors);
    };

    reader.readAsText(file);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const executeImport = async () => {
    if (!importFile) return;

    setImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        let importedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length !== headers.length) {
            errors.push(`Fila ${i + 1}: Número incorrecto de columnas`);
            skippedCount++;
            continue;
          }

          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          // Validar datos requeridos
          if (!rowData['Nombre']?.trim() || !rowData['Teléfono']?.trim()) {
            errors.push(`Fila ${i + 1}: Faltan datos obligatorios (nombre o teléfono)`);
            skippedCount++;
            continue;
          }

          if (rowData['Teléfono'] && !/^[\d+\-\s()]+$/.test(rowData['Teléfono'].trim())) {
            errors.push(`Fila ${i + 1}: Teléfono con formato inválido`);
            skippedCount++;
            continue;
          }

          // Verificar si el cliente ya existe (por teléfono)
          const existingCustomer = customers.find(c => c.phone === rowData['Teléfono'].trim());
          if (existingCustomer) {
            skippedCount++;
            continue; // Skip existing customers
          }

          // Crear pedido ficticio para el cliente importado
          const allOrders = loadFromStorage('orders') || [];
          const newOrder: Order = {
            id: `imported-order-${Date.now()}-${i}`,
            restaurant_id: restaurant?.id || '',
            order_number: `IMP-${Date.now()}-${i}`,
            customer: {
              name: rowData['Nombre'].trim(),
              phone: rowData['Teléfono'].trim(),
              email: rowData['Email']?.trim() || '',
              address: rowData['Dirección']?.trim() || '',
              delivery_instructions: rowData['Referencias de Entrega']?.trim() || '',
            },
            items: [], // Empty items for imported customers
            order_type: 'pickup' as const,
            subtotal: parseFloat(rowData['Total Gastado']) || 0,
            total: parseFloat(rowData['Total Gastado']) || 0,
            status: 'delivered' as const,
            created_at: rowData['Último Pedido'] ? new Date(rowData['Último Pedido']).toISOString() : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          allOrders.push(newOrder);
          saveToStorage('orders', allOrders);

          // Manejar VIP status si está marcado
          if (rowData['Es VIP']?.toLowerCase() === 'sí' || rowData['Es VIP']?.toLowerCase() === 'yes') {
            const vipCustomers = loadFromStorage('vipCustomers') || [];
            vipCustomers.push({
              restaurant_id: restaurant?.id,
              phone: rowData['Teléfono'].trim(),
              name: rowData['Nombre'].trim(),
              created_at: new Date().toISOString(),
            });
            saveToStorage('vipCustomers', vipCustomers);
          }

          importedCount++;
        }

        // Recargar datos
        loadCustomersData();

        // Mostrar resultado
        if (importedCount > 0) {
          showToast(
            'success',
            'Importación Completada',
            `Se importaron ${importedCount} cliente${importedCount !== 1 ? 's' : ''} exitosamente.${skippedCount > 0 ? ` ${skippedCount} registro${skippedCount !== 1 ? 's' : ''} omitido${skippedCount !== 1 ? 's' : ''} (duplicados o con errores).` : ''}`,
            6000
          );
        } else {
          showToast(
            'warning',
            'Sin Importaciones',
            'No se pudo importar ningún cliente. Verifica el formato del archivo.',
            5000
          );
        }

        if (errors.length > 0 && errors.length <= 10) {
          console.log('Errores de importación:', errors);
        }

        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
        setImportErrors([]);
      };

      reader.readAsText(importFile);
    } catch (error) {
      console.error('Error importing CSV:', error);
      showToast(
        'error',
        'Error de Importación',
        'Hubo un problema al importar el archivo. Verifica el formato e intenta de nuevo.',
        5000
      );
    } finally {
      setImporting(false);
    }
  };

  const stats = {
    totalCustomers: customers.length,
    vipCustomers: customers.filter(c => c.isVip).length,
    frequentCustomers: customers.filter(c => c.totalOrders >= 5).length,
    averageSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
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
            icon={Upload}
            onClick={handleImportCSV}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Importar CSV
          </Button>
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
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            Filtros y Búsqueda
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalCustomers')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('vipCustomers')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.vipCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('frequentCustomers')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.frequentCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('averageSpent')}</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.averageSpent.toFixed(2)}</p>
            </div>
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
                <option value="frequent">Solo Frecuentes</option>
                <option value="new">Solo Nuevos</option>
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
                          <div><strong className="text-green-300">VIP:</strong> Asignado manualmente</div>
                          <div><strong className="text-blue-300">Nuevo:</strong> 1 pedido</div>
                          <div><strong className="text-gray-300">Regular:</strong> 2-4 pedidos</div>
                          <div><strong className="text-orange-300">Frecuente:</strong> 5+ pedidos</div>
                          <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-300">
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

      {/* Import CSV Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportPreview([]);
          setImportErrors([]);
        }}
        title="Importar Clientes desde CSV"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-800 font-medium mb-2">Instrucciones de Importación</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• El archivo debe estar en formato CSV</p>
              <p>• Usa el mismo formato que el archivo de exportación</p>
              <p>• Los campos obligatorios son: Nombre y Teléfono</p>
              <p>• Los clientes duplicados (mismo teléfono) serán omitidos</p>
              <p>• Se creará un pedido ficticio para cada cliente importado</p>
            </div>
          </div>

          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Archivo CSV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-900 mb-2">
                  Seleccionar archivo CSV
                </span>
                <span className="text-sm text-gray-600">
                  Haz clic aquí o arrastra tu archivo CSV
                </span>
              </label>
            </div>
            
            {importFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckSquare className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">{importFile.name}</span>
                  <span className="text-green-600 text-sm ml-2">
                    ({(importFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Errors */}
          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium mb-2">Errores Encontrados</h4>
              <div className="text-red-700 text-sm space-y-1 max-h-32 overflow-y-auto">
                {importErrors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {importPreview.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Vista Previa ({importPreview.length} de {importFile ? 'total' : '0'} filas)
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Nombre
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Teléfono
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Es VIP
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Gastado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importPreview.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row['Nombre'] || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row['Teléfono'] || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row['Email'] || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row['Es VIP'] || 'No'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row['Total Gastado'] || '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportPreview([]);
                setImportErrors([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={executeImport}
              disabled={!importFile || importErrors.length > 0 || importing}
              loading={importing}
              icon={Upload}
            >
              {importing ? 'Importando...' : 'Importar Clientes'}
            </Button>
          </div>
        </div>
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
    </div>
  );
};