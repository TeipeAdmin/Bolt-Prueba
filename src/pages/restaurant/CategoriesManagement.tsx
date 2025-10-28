import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff,ArrowUp, ArrowDown, Search, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { Category, Subscription } from '../../types';
import { loadFromStorage, saveToStorage, availablePlans } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const CategoriesManagement: React.FC = () => {
  const { restaurant } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; categoryId: string; categoryName: string }>({
    show: false,
    categoryId: '',
    categoryName: ''
  });
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (restaurant) {
      loadCategories();
      loadSubscription();
    }
  }, [restaurant]);

  const loadSubscription = () => {
    const subscriptions = loadFromStorage('subscriptions', []);
    const subscription = subscriptions.find((sub: Subscription) => 
      sub.restaurant_id === restaurant?.id && sub.status === 'active'
    );
    setCurrentSubscription(subscription || null);
  };

  const loadCategories = () => {
    if (!restaurant) return;

    const allCategories = loadFromStorage('categories') || [];
    const restaurantCategories = allCategories.filter((cat: Category) => 
      cat.restaurant_id === restaurant.id
    );

    // Sort by order position
    restaurantCategories.sort((a: Category, b: Category) => a.order_position - b.order_position);
    setCategories(restaurantCategories);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = () => {
    if (!restaurant || !formData.name.trim()) return;

    // Check category limit for new categories
    if (!editingCategory && currentSubscription) {
      const currentPlan = availablePlans.find(p => p.id === currentSubscription.plan_type);
      if (currentPlan && currentPlan.features.max_categories !== -1) {
        if (categories.length >= currentPlan.features.max_categories) {
          showToast(
            'warning',
            t('categoryLimitReached'),
            `${t('upTo')} ${currentPlan.features.max_categories} ${t('addMoreCategories')} ${currentPlan.name}. ${t('upgradeSubscription')} ${t('addMoreCategories')}`,
            8000
          );
          return;
        }
      }
    }

    const allCategories = loadFromStorage('categories') || [];
    
    if (editingCategory) {
      // Update existing category
      const updatedCategories = allCategories.map((cat: Category) =>
        cat.id === editingCategory.id
          ? { ...cat, ...formData }
          : cat
      );
      saveToStorage('categories', updatedCategories);
    } else {
      // Create new category
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        restaurant_id: restaurant.id,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        order_position: categories.length + 1,
        active: true,
        created_at: new Date().toISOString(),
      };
      saveToStorage('categories', [...allCategories, newCategory]);
    }

    loadCategories();
    handleCloseModal();
    
    showToast(
      'success',
      editingCategory ? t('categoryUpdated') : t('categoryCreated'),
      editingCategory 
        ? 'The category has been updated successfully.'
        : 'The new category has been added to your menu.',
      4000
    );
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = (categoryId: string) => {
    const allCategories = loadFromStorage('categories') || [];
    const updatedCategories = allCategories.filter((cat: Category) => cat.id !== categoryId);
    saveToStorage('categories', updatedCategories);
    loadCategories();

    showToast(
      'info',
      t('categoryDeleted'),
      'The category has been removed from your menu.',
      4000
    );
  };

  const openDeleteConfirm = (category: Category) => {
    setDeleteConfirm({
      show: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const toggleActive = (categoryId: string) => {
    const allCategories = loadFromStorage('categories') || [];
    const category = allCategories.find((cat: Category) => cat.id === categoryId);
    if (!category) return;
    
    const updatedCategories = allCategories.map((cat: Category) =>
      cat.id === categoryId
        ? { ...cat, active: !cat.active }
        : cat
    );
    saveToStorage('categories', updatedCategories);
    loadCategories();
    
    showToast(
      'info',
      !category.active ? t('categoryActivated') : t('categoryDeactivated'),
      !category.active 
        ? 'The category has been activated and now appears in your public menu.'
        : 'The category has been deactivated and no longer appears in your public menu.',
      4000
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
    });
  };

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(cat => cat.id === categoryId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newCategories = [...categories];
    [newCategories[currentIndex], newCategories[newIndex]] = [newCategories[newIndex], newCategories[currentIndex]];

    // Update order positions
    const allCategories = loadFromStorage('categories') || [];
    const updatedCategories = allCategories.map((cat: Category) => {
      const newCat = newCategories.find(nc => nc.id === cat.id);
      if (newCat) {
        return { ...cat, order_position: newCategories.indexOf(newCat) + 1 };
      }
      return cat;
    });

    saveToStorage('categories', updatedCategories);
    loadCategories();
  };

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();

    if (!draggedCategory || draggedCategory.id === targetCategory.id) {
      setDraggedCategory(null);
      return;
    }

    const draggedIndex = categories.findIndex(cat => cat.id === draggedCategory.id);
    const targetIndex = categories.findIndex(cat => cat.id === targetCategory.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCategories = [...categories];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, draggedCategory);

    // Update order positions
    const allCategories = loadFromStorage('categories') || [];
    const updatedCategories = allCategories.map((cat: Category) => {
      const newCat = newCategories.find(nc => nc.id === cat.id);
      if (newCat) {
        return { ...cat, order_position: newCategories.indexOf(newCat) + 1 };
      }
      return cat;
    });

    saveToStorage('categories', updatedCategories);
    loadCategories();
    setDraggedCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('categoryManagement')}</h1>
        <Button
          icon={Plus}
          onClick={() => setShowModal(true)}
        >
          {t('newCategory')}
        </Button>
      </div>

      {/* Stats and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-900">{categories.filter(c => c.active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivas</p>
              <p className="text-2xl font-bold text-gray-900">{categories.filter(c => !c.active).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('search')} categories...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {searchTerm === '' && categories.length > 1 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
            <GripVertical className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p>
              <strong className="text-blue-700">Tip:</strong> Arrastra y suelta las categorías para reordenarlas
            </p>
          </div>
        )}
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {categories.length === 0 ? t('noCategoriesCreated') : 'No categories found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {categories.length === 0 ? t('createFirstCategory') : 'Try different search terms.'}
          </p>
          {categories.length === 0 && (
            <Button
              icon={Plus}
              onClick={() => setShowModal(true)}
            >
              {t('create')} {t('newCategory')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              draggable={searchTerm === ''}
              onDragStart={(e) => handleDragStart(e, category)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all overflow-hidden ${
                searchTerm === '' ? 'cursor-move' : ''
              } ${
                draggedCategory?.id === category.id
                  ? 'opacity-50 scale-95 border-blue-400'
                  : 'border-gray-200 hover:shadow-md hover:border-blue-300'
              }`}
            >
              {/* Category Image/Icon Header */}
              <div className="relative h-60 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : category.icon ? (
                  <span className="text-5xl">{category.icon}</span>
                ) : (
                  <FolderOpen className="w-12 h-12 text-gray-300" />
                )}

                {/* Order Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                  <GripVertical className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">#{category.order_position}</span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant={category.active ? 'success' : 'gray'}>
                    {category.active ? t('active') : t('inactive')}
                  </Badge>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {category.description || 'Sin descripción'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Creada: {new Date(category.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
<button
  onClick={() => moveCategory(category.id, 'up')}
  disabled={index === 0 || searchTerm !== ''}
  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
  title={searchTerm !== '' ? 'Clear search to reorder' : 'Move up'}
>
  <ArrowUp className="w-4 h-4" />
</button>
                  <button
                    onClick={() => moveCategory(category.id, 'down')}
                    disabled={index === filteredCategories.length - 1 || searchTerm !== ''}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={searchTerm !== '' ? 'Clear search to reorder' : 'Move down'}
                  >
                    ↓
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Pencil}
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={category.active ? EyeOff : Eye}
                    onClick={() => toggleActive(category.id)}
                    className={`flex-1 ${category.active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => openDeleteConfirm(category)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCategory ? `${t('edit')} ${t('category')}` : t('newCategory')}
        size="lg"
      >
        <div className="space-y-5">
          {/* Form Section */}
          <div className="space-y-4">
            <Input
              label={`${t('categoryName')}*`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ej: Pizzas, Bebidas, Postres"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Agrega una descripción para ayudar a tus clientes..."
              />
            </div>
          </div>

          {/* Visual Options Section */}
          <div className="bg-gray-50 rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              Apariencia de la Categoría
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Icono (Emoji)
                </label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🍕 🥤 🍰"
                />
                <p className="text-xs text-gray-500">
                  Usa un emoji para identificar rápidamente
                </p>
              </div>

              {/* Image Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imagen de Portada
                </label>
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Category"
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
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
                            setFormData(prev => ({ ...prev, image: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs">Subir imagen</span>
                    </div>
                  </label>
                )}
                <p className="text-xs text-gray-500">
                  Recomendado: 600x600px (máx. 5MB)
                </p>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              * Campos requeridos
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleCloseModal}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name.trim()}
              >
                {editingCategory ? t('update') : t('create')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, categoryId: '', categoryName: '' })}
        onConfirm={() => handleDelete(deleteConfirm.categoryId)}
        title="¿Eliminar categoría?"
        message="Esta acción eliminará permanentemente la categoría de tu menú. Todos los productos asociados a esta categoría quedarán sin categoría asignada."
        confirmText="Eliminar categoría"
        cancelText="Cancelar"
        variant="danger"
        itemName={deleteConfirm.categoryName}
      />
    </div>
  );
};