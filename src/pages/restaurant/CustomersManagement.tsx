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
        const existing = customerMap.get(customerKey)!;
        existing.totalOrders += 1;
        existing.totalSpent += order.status === 'delivered' ? order.total : 0;
        existing.lastOrderDate = order.created_at > existing.lastOrderDate ? order.created_at : existing.lastOrderDate;
        if (!existing.orderTypes.includes(order.order_type)) {
          existing.orderTypes.push(order.order_type);
        }
        // Update customer info with most recent data (keep latest information)
        existing.name = order.customer.name;
        existing.email = order.customer.email || existing.email;
        existing.address = order.customer.address || existing.address;
        existing.delivery_instructions = order.customer.delivery_instructions || existing.delivery_instructions;
      } else {
        const isVip = vipCustomers.some((vip: any) => 
          vip.restaurant_id === restaurant.id && vip.phone === order.customer.phone
        );
        customerMap.set(customerKey, {
          id: order.customer.phone,
          name: order.customer.name,
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

      // Check required headers - only Nombre is required
      const requiredHeaders = ['Nombre'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        setImportErrors([
          `Faltan las siguientes columnas requeridas: ${missingHeaders.join(', ')}`,
          'Solo se requiere la columna "Nombre". Los demás campos son opcionales.'
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

        // Only name is required
        if (!rowData['Nombre']?.trim()) {
          errors.push(`Fila ${i + 1}: Nombre es obligatorio`);
        }
        
        // Optional phone validation - only if provided
        if (rowData['Teléfono'] && rowData['Teléfono'].trim() && !/^[\d+\-\s()]+$/.test(rowData['Teléfono'].trim())) {
          errors.push(`Fila ${i + 1}: Formato de teléfono inválido`);
        }
        
        // Optional email validation - only if provided
        if (rowData['Email'] && rowData['Email'].trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData['Email'].trim())) {
          errors.push(`Fila ${i + 1}: Formato de email inválido`);
        }
        
        // Check for duplicates (only if phone is provided)
        if (rowData['Teléfono'] && rowData['Teléfono'].trim()) {
          const existingCustomer = customers.find(c => c.phone === rowData['Teléfono'].trim());
          if (existingCustomer) {
            errors.push(`Fila ${i + 1}: Ya existe un cliente con el teléfono ${rowData['Teléfono']}`);
          }
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

          // Only name is required
          if (!rowData['Nombre']?.trim()) {
            errors.push(`Fila ${i + 1}: Faltan datos obligatorios (nombre)`);
            skippedCount++;
            continue;
          }

          // Optional phone validation - only if provided
          if (rowData['Teléfono'] && rowData['Teléfono'].trim() && !/^[\d+\-\s()]+$/.test(rowData['Teléfono'].trim())) {
            errors.push(`Fila ${i + 1}: Teléfono con formato inválido`);
            skippedCount++;
            continue;
          }

          // Verificar si el cliente ya existe (por teléfono, solo si se proporciona)
          if (rowData['Teléfono'] && rowData['Teléfono'].trim()) {
            const existingCustomer = customers.find(c => c.phone === rowData['Teléfono'].trim());
            if (existingCustomer) {
              skippedCount++;
              continue; // Skip existing customers
            }
          }

          // Crear pedido ficticio para el cliente importado
          const allOrders = loadFromStorage('orders') || [];
          const newOrder: Order = {
            id: `imported-order-${Date.now()}-${i}`,
            restaurant_id: restaurant?.id || '',
            order_number: `IMP-${Date.now()}-${i}`,
            customer: {
              name: rowData['Nombre'].trim(),
              phone: rowData['Teléfono']?.trim() || '',
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
          if (rowData['Es VIP'] ? ['sí', 'si', 'yes', 'true', '1'].includes(rowData['Es VIP'].toLowerCase().trim()) : false) {
            const vipCustomers = loadFromStorage('vipCustomers') || [];
            vipCustomers.push({
              restaurant_id: restaurant?.id,
              phone: rowData['Teléfono']?.trim() || '',
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
                <option value="spent">Ordenar por {t('