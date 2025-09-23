import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Search } from 'lucide-react';
import { Category, Subscription } from '../../types';
import { loadFromStorage, saveToStorage, availablePlans } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

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
  });

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
    });
    setShowModal(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm(`${t('confirmDelete')} this category? ${t('actionCannotBeUndone')}`)) {
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
    }
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
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-gray-400" />
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('order')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {category.order_position}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveCategory(category.id, 'up')}
                            disabled={index === 0 || searchTerm !== ''}
                            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                            title={searchTerm !== '' ? 'Clear search to reorder' : 'Move up'}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveCategory(category.id, 'down')}
                            disabled={index === filteredCategories.length - 1 || searchTerm !== ''}
                            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                            title={searchTerm !== '' ? 'Clear search to reorder' : 'Move down'}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.icon && (
                          <span className="text-lg mr-3">{category.icon}</span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={category.active ? 'success' : 'gray'}>
                        {category.active ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEdit(category)}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={category.active ? EyeOff : Eye}
                          onClick={() => toggleActive(category.id)}
                          className={category.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
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

      {/* Category Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCategory ? `${t('edit')} ${t('category')}` : t('newCategory')}
        size="md"
      >
        <div className="space-y-6">
          <Input
            label={`${t('categoryName')}*`}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g: Pizzas, Drinks, Desserts"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional category description..."
            />
          </div>

          <Input
            label={t('categoryIcon')}
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="🍕 🥤 🍰"
            helperText="You can use emojis to represent the category"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              {editingCategory ? t('update') : t('create')} {t('category')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};