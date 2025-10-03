import React, { useState, useEffect } from 'react';
import { User, CreditCard as Edit, Trash2, Shield, UserCheck, UserX, Filter, Building, UserPlus, Lock, Copy } from 'lucide-react';
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
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [assigningUser, setAssigningUser] = useState<UserType | null>(null);
  const [userForPasswordReset, setUserForPasswordReset] = useState<UserType | null>(null);
  const [provisionalPassword, setProvisionalPassword] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'email'>('newest');
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    role: 'restaurant_owner' as UserType['role'],
    restaurant_id: '',
  });

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
    const user = users.find(u => u.id === userId);
    if (!user?.restaurant_id) return null;
    return restaurants.find(restaurant => restaurant.id === user.restaurant_id);
  };

  const getUsersByRestaurant = (restaurantId: string) => {
    return users.filter(user => user.restaurant_id === restaurantId);
  };

  const handleAssignRestaurant = (user: UserType) => {
    setAssigningUser(user);
    setSelectedRestaurantId(user.restaurant_id || '');
    setShowAssignModal(true);
  };

  const saveRestaurantAssignment = () => {
    if (!assigningUser) return;

    // Allow empty selection to unassign restaurant
    const updatedUsers = users.map(user =>
      user.id === assigningUser.id
        ? {
            ...user,
            restaurant_id: selectedRestaurantId || undefined,
            updated_at: new Date().toISOString()
          }
        : user
    );

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

  const handleCreateUser = () => {
    if (!newUserForm.email || !newUserForm.password) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(user => user.email.toLowerCase() === newUserForm.email.toLowerCase());
    if (emailExists) {
      alert('Este email ya está registrado.');
      return;
    }

    const newUser: UserType = {
      id: `user-${Date.now()}`,
      email: newUserForm.email,
      password: newUserForm.password,
      role: newUserForm.role,
      restaurant_id: newUserForm.restaurant_id || undefined,
      email_verified: true,
      require_password_change: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    saveToStorage('users', updatedUsers);
    setUsers(updatedUsers);

    // Reset form and close modal
    setNewUserForm({
      email: '',
      password: '',
      role: 'restaurant_owner',
      restaurant_id: '',
    });
    setShowCreateUserModal(false);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setSelectedRestaurantId(user.restaurant_id || '');
    setShowEditModal(true);
  };

  const saveUserEdit = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? {
            ...user,
            restaurant_id: selectedRestaurantId || undefined,
            updated_at: new Date().toISOString()
          }
        : user
    );

    saveToStorage('users', updatedUsers);
    setUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    setSelectedRestaurantId('');
  };

  const generateProvisionalPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleResetPassword = (user: UserType) => {
    const newPassword = generateProvisionalPassword();
    setUserForPasswordReset(user);
    setProvisionalPassword(newPassword);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = () => {
    if (!userForPasswordReset || !provisionalPassword) return;

    const updatedUsers = users.map(user =>
      user.id === userForPasswordReset.id
        ? {
            ...user,
            password: provisionalPassword,
            require_password_change: true,
            updated_at: new Date().toISOString()
          }
        : user
    );

    saveToStorage('users', updatedUsers);
    setUsers(updatedUsers);
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setUserForPasswordReset(null);
    setProvisionalPassword('');
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by date range
      if (startDate || endDate) {
        const userDate = new Date(user.created_at);
        if (startDate && userDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (userDate > end) return false;
        }
      }

      if (filter === 'all') return matchesSearch;
      return matchesSearch && user.role === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.email.localeCompare(b.email);
      }
    });

  const getRoleBadge = (role: UserType['role']) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="error">Superadmin</Badge>;
      case 'restaurant_owner':
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
        <Button
          icon={UserPlus}
          onClick={() => setShowCreateUserModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Crear Usuario
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-4">
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
                <option value="super_admin">Superadministradores</option>
                <option value="restaurant_owner">Restaurantes</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'email')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
                <option value="email">Email A-Z</option>
              </select>
            </div>
            {(startDate || endDate || sortBy !== 'newest') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSortBy('newest');
                }}
              >
                Limpiar
              </Button>
            )}
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
                          onClick={() => handleEditUser(user)}
                          title="Editar asignación de restaurante"
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
                Gestionar restaurante del usuario: <strong>{assigningUser.email}</strong>
              </p>

              {assigningUser.restaurant_id && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Restaurante actual:</strong> {getRestaurant(assigningUser.id)?.name}
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Restaurante
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin restaurante asignado</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.domain})
                  </option>
                ))}
              </select>

              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> Múltiples usuarios pueden estar asignados al mismo restaurante y verán la misma información.
                </p>
              </div>
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

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => {
          setShowCreateUserModal(false);
          setNewUserForm({
            email: '',
            password: '',
            role: 'restaurant_owner',
          });
        }}
        title="Crear Nuevo Usuario"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Crea usuarios para administradores del sistema o dueños de restaurantes.
            </p>
          </div>

          <Input
            label="Email*"
            type="email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="usuario@ejemplo.com"
          />

          <Input
            label="Contraseña*"
            type="password"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuario*
            </label>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as UserType['role'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="restaurant_owner">Restaurante</option>
              <option value="super_admin">Superadministrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {newUserForm.role === 'super_admin'
                ? 'Tendrá acceso completo al panel de administración'
                : 'Podrá gestionar su restaurante'}
            </p>
          </div>

          {newUserForm.role === 'restaurant_owner' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurante (Opcional)
              </label>
              <select
                value={newUserForm.restaurant_id}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, restaurant_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin restaurante asignado</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Puedes asignar un restaurante ahora o después
              </p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Contraseña provisional:</strong> El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateUserModal(false);
                setNewUserForm({
                  email: '',
                  password: '',
                  role: 'restaurant_owner',
                  restaurant_id: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUserForm.email || !newUserForm.password}
              icon={UserPlus}
            >
              Crear Usuario
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
          setSelectedRestaurantId('');
        }}
        title="Editar Usuario"
        size="md"
      >
        {editingUser && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Usuario:</strong> {editingUser.email}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Rol:</strong> {editingUser.role === 'super_admin' ? 'Superadministrador' : 'Restaurante'}
              </p>
            </div>

            {editingUser.restaurant_id && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Restaurante actual:</strong> {getRestaurant(editingUser.id)?.name || 'Sin asignar'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar Restaurante
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin restaurante asignado</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.domain})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Selecciona un restaurante para asignar o deja en blanco para remover la asignación
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> Múltiples usuarios pueden estar asignados al mismo restaurante y compartirán el acceso a toda su información.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Restablecer Contraseña
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  Si el usuario olvidó su contraseña, puedes asignarle una contraseña provisional. El usuario deberá cambiarla al iniciar sesión.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Lock}
                  onClick={() => handleResetPassword(editingUser)}
                >
                  Generar Contraseña Provisional
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setSelectedRestaurantId('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={saveUserEdit}
                icon={Edit}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={closeResetPasswordModal}
        title="Contraseña Provisional Generada"
        size="md"
      >
        {userForPasswordReset && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Usuario:</strong> {userForPasswordReset.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Provisional
              </label>
              <div className="flex gap-2">
                <Input
                  value={provisionalPassword}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Copy}
                  onClick={() => {
                    navigator.clipboard.writeText(provisionalPassword);
                    alert('Contraseña copiada al portapapeles');
                  }}
                  title="Copiar contraseña"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Guarda esta contraseña en un lugar seguro o compártela con el usuario de forma segura.
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Esta contraseña es provisional y debe cambiarse</li>
                <li>• El usuario deberá cambiarla al iniciar sesión</li>
                <li>• No podrás recuperar esta contraseña después de cerrar este modal</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={closeResetPasswordModal}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  confirmResetPassword();
                  alert(`Contraseña provisional asignada a ${userForPasswordReset.email}\n\nContraseña: ${provisionalPassword}\n\nEl usuario deberá cambiarla al iniciar sesión.`);
                  closeResetPasswordModal();
                }}
                icon={Lock}
              >
                Confirmar y Aplicar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};