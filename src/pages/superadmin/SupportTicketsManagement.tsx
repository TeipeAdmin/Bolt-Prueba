import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Clock, AlertTriangle, CheckCircle, Eye, Trash2, Filter, Search, Mail, Phone, Calendar, User, Building, Key } from 'lucide-react';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { SupportTicket } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const SupportTicketsManagement: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [responseText, setResponseText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const loadTickets = () => {
    const supportTickets = loadFromStorage('supportTickets', []);
    setTickets(supportTickets);
  };

  const filterTickets = () => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.type === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredTickets(filtered);
  };

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: newStatus, updated_at: new Date().toISOString() }
        : ticket
    );
    setTickets(updatedTickets);
    saveToStorage('supportTickets', updatedTickets);
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleRespondToTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponseText('');
    setAdminNotes(ticket.notes || '');
    setShowResponseModal(true);
  };

  const saveResponse = () => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map(ticket =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            notes: adminNotes,
            status: 'resolved' as const,
            resolved_at: new Date().toISOString(),
            resolved_by: 'super_admin',
            updated_at: new Date().toISOString()
          }
        : ticket
    );

    setTickets(updatedTickets);
    saveToStorage('supportTickets', updatedTickets);
    setShowResponseModal(false);
    setSelectedTicket(null);
    setResponseText('');
    setAdminNotes('');
  };

  const deleteTicket = (ticketId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.')) {
      const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId);
      setTickets(updatedTickets);
      saveToStorage('supportTickets', updatedTickets);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning">Abierto</Badge>;
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
      case 'high':
        return <Badge variant="error">Alta</Badge>;
      case 'medium':
        return <Badge variant="warning">Media</Badge>;
      case 'low':
        return <Badge variant="gray">Baja</Badge>;
      default:
        return <Badge variant="gray">Media</Badge>;
    }
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      password_reset: 'Recuperación de Contraseña',
      technical: 'Problema Técnico',
      billing: 'Facturación',
      general: 'Consulta General'
    };
    return categories[category] || category;
  };

  const getRestaurantName = (restaurantId?: string) => {
    if (!restaurantId) return 'N/A';
    const restaurants = loadFromStorage('restaurants', []);
    const restaurant = restaurants.find((r: any) => r.id === restaurantId);
    return restaurant?.name || 'N/A';
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    high: tickets.filter(t => t.priority === 'high').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Tickets de Soporte</h1>
        <div className="text-sm text-gray-500">
          {filteredTickets.length} de {tickets.length} tickets
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abiertos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Progreso</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resueltos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Prioridad Alta</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.high}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por asunto, restaurante, email o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resueltos</option>
              <option value="closed">Cerrados</option>
            </select>
          </div>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="password_reset">Recuperación de Contraseña</option>
            <option value="technical">Problema Técnico</option>
            <option value="billing">Facturación</option>
            <option value="general">Consulta General</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {tickets.length === 0 ? 'No hay tickets de soporte' : 'No se encontraron tickets'}
          </h3>
          <p className="text-gray-600">
            {tickets.length === 0 
              ? 'Los tickets de soporte aparecerán aquí cuando los restaurantes envíen consultas.'
              : 'Intenta con diferentes términos de búsqueda o filtros.'
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
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        {ticket.type === 'password_reset' && (
                          <Key className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs">
                            {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {ticket.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{getRestaurantName(ticket.restaurant_id)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {ticket.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCategoryName(ticket.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleViewTicket(ticket)}
                          title="Ver detalles"
                        />

                        {ticket.status === 'open' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                            className="text-blue-600 hover:text-blue-700"
                            title="Marcar en progreso"
                          >
                            Tomar
                          </Button>
                        )}

                        {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRespondToTicket(ticket)}
                            className="text-green-600 hover:text-green-700"
                            title="Responder"
                          >
                            Resolver
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => deleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
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
                Ticket ID: {selectedTicket.id} • {new Date(selectedTicket.created_at).toLocaleString()}
              </div>
            </div>

            {/* Restaurant and Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Información del Restaurante</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{getRestaurantName(selectedTicket.restaurant_id)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span> {getCategoryName(selectedTicket.type)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Información de Contacto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{selectedTicket.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Descripción</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedTicket.notes && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Notas del Administrador</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">{selectedTicket.notes}</p>
                  {selectedTicket.resolved_at && (
                    <div className="text-xs text-yellow-600 mt-2">
                      Resuelto el: {new Date(selectedTicket.resolved_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {selectedTicket.status === 'open' && (
                <Button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'in_progress');
                    setShowDetailModal(false);
                  }}
                  variant="outline"
                >
                  Marcar en Progreso
                </Button>
              )}

              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRespondToTicket(selectedTicket);
                  }}
                >
                  Resolver
                </Button>
              )}

              {selectedTicket.status === 'resolved' && (
                <Button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'closed');
                    setShowDetailModal(false);
                  }}
                  variant="outline"
                >
                  Cerrar Ticket
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedTicket(null);
          setResponseText('');
          setAdminNotes('');
        }}
        title="Responder Ticket"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{selectedTicket.subject}</h3>
              <p className="text-sm text-gray-600">
                {getRestaurantName(selectedTicket.restaurant_id)} • {selectedTicket.email}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-800 font-medium mb-2">Descripción del ticket:</h4>
              <div className="text-blue-700 text-sm">
                <p className="bg-white p-3 rounded border text-gray-700">
                  {selectedTicket.description}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de Resolución
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe cómo se resolvió el ticket y cualquier acción tomada..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedTicket(null);
                  setResponseText('');
                  setAdminNotes('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveResponse}
              >
                Marcar como Resuelto
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};