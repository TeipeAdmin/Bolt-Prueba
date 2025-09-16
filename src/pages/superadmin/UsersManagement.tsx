import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Shield, UserCheck, UserX, Filter, Building } from 'lucide-react';
import { User as UserType, Restaurant } from '../../types';
import { loadFromStorage, saveToStorage } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningUser, setAssigningUser] = useState<UserType | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userData = loadFromStorage('users') || [];
    const restaurantData = loadFromStorage('restaurants') || [];
    setUsers(userData);
    setRestaurants(restaurantData);
  };

  const getRestaurant = (userId: string) => {
    return restaurants.find(restaurant => restaurant.user_id === userId);
  };

  const getUnassignedRestaurants = () => {
    const assignedRestaurantIds = users
      .filter(user => user.role === 'restaurant')
      .map(user => getRestaurant(user.id)?.id)
      .filter(Boolean);
    
    return restaurants.filter(restaurant => !assignedRestaurantIds.includes(restaurant.id));
  };

  const handleAssignRestaurant = (user: UserType) => {
    setAssigningUser(user);
    setSelectedRestaurantId('');
    setShowAssignModal(true);
  };

  const saveRestaurantAssignment = () => {
    if (!assigningUser || !selectedRestaurantId) return;

    const updatedRestaurants = restaurants.map(restaurant =>
      restaurant.id === selectedRestaurantId
        ? { ...restaurant, user_id: assigningUser.id }
        : restaurant
    );

    const updatedUsers = users.map(user =>
      user.id === assigningUser.id
        ? { ...user, role: 'restaurant' as const }
        : user
    );

    saveToStorage('restaurants', updatedRestaurants);
    saveToStorage('users', updatedUsers);
    
    // Reload data to reflect changes
    loadData();
    
    setShowAssignModal(false);
    setAssigningUser(null);
    setSelectedRestaurantId('');
  };
  const updateUserRole = (userId: string, newRole: UserType['role']) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole }
        : user
    );
    
    setUsers(updatedUsers);
    saveToStorage('users', updatedUsers);
  };

  const toggleEmailVerification = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, email_verified: !user.email_verified }
        : user
    );
    
    setUsers(updatedUsers);
    saveToStorage('users', updatedUsers);
  };

  const deleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      const updatedRestaurants = restaurants.filter(restaurant => restaurant.user_id !== userId);
      
      setUsers(updatedUsers);
      setRestaurants(updatedRestaurants);
      saveToStorage('users', updatedUsers);
      saveToStorage('restaurants', updatedRestaurants);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && user.role === filter;
  });

  const getRoleBadge = (role: UserType['role']) => {
    switch (role) {
      case 'superadmin':
        return <Badge variant="error">Superadmin</Badge>;
      case 'restaurant':
        return <Badge variant="info">Restaurante</Badge>;
      default:
        return <Badge variant="gray">Desconocido</Badge>;
    }
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified 
      ? <Badge variant="success">Verificado</Badge>
      : <Badge variant="warning">Sin verificar</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por email..."
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
              <option value="all">Todos los roles</option>
              <option value="superadmin">Superadministradores</option>
              <option value="restaurant">Restaurantes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurante
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
              {filteredUsers.map((user) => {
                const restaurant = getRestaurant(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(user.email_verified)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {restaurant ? (
                        <div className="text-sm text-gray-900">{restaurant.name}</div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                        />
                        
                        {user.role === 'restaurant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Shield}
                            onClick={() => updateUserRole(user.id, 'superadmin')}
                            className="text-purple-600 hover:text-purple-700"
                            title="Promover a Superadmin"
                          />
                        )}
                        
                        {user.role === 'superadmin' && user.id !== 'super-1' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={User}
                            onClick={() => updateUserRole(user.id, 'restaurant')}
                            className="text-blue-600 hover:text-blue-700"
                            title="Cambiar a Restaurante"
                          />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={user.email_verified ? UserX : UserCheck}
                          onClick={() => toggleEmailVerification(user.id)}
                          className={user.email_verified ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                          title={user.email_verified ? "Marcar como no verificado" : "Marcar como verificado"}
                        />
                        
                        {!getRestaurant(user.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Building}
                            onClick={() => handleAssignRestaurant(user)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Asignar Restaurante"
                          />
                        )}
                        
                        {user.id !== 'super-1' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        title="Detalles del Usuario"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                {getRoleBadge(selectedUser.role)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado de Verificación</label>
                {getVerificationBadge(selectedUser.email_verified)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {getRestaurant(selectedUser.id) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurante Asociado</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{getRestaurant(selectedUser.id)?.name}</p>
                  <p className="text-sm text-gray-600">{getRestaurant(selectedUser.id)?.domain}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assign Restaurant Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssigningUser(null);
          setSelectedRestaurantId('');
        }}
        title="Asignar Restaurante"
        size="md"
      >
        {assigningUser && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Asignar restaurante al usuario: <strong>{assigningUser.email}</strong>
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Restaurante
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un restaurante...</option>
                {getUnassignedRestaurants().map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.domain})
                  </option>
                ))}
              </select>
              
              {getUnassignedRestaurants().length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No hay restaurantes disponibles para asignar
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAssignModal(false);
                  setAssigningUser(null);
                  setSelectedRestaurantId('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveRestaurantAssignment}
                disabled={!selectedRestaurantId}
              >
                Asignar Restaurante
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};