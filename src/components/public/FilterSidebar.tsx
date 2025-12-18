import React from 'react';
import { X, Filter as FilterIcon } from 'lucide-react';
import { Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  dietaryRestrictions: string[];
  spiceLevel: number[];
  searchQuery: string;
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest';
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  categories: Category[];
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
}

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetariano' },
  { value: 'vegan', label: 'Vegano' },
  { value: 'gluten-free', label: 'Sin Gluten' },
  { value: 'lactose-free', label: 'Sin Lactosa' },
  { value: 'organic', label: 'Orgánico' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' }
];

const SPICE_LEVELS = [
  { value: 1, label: 'Suave', color: 'text-yellow-400' },
  { value: 2, label: 'Medio', color: 'text-orange-500' },
  { value: 3, label: 'Picante', color: 'text-red-600' }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  categories,
  onFilterChange,
  onClearFilters
}) => {
  const { t } = useLanguage();

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange('categories', newCategories);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const newRestrictions = filters.dietaryRestrictions.includes(restriction)
      ? filters.dietaryRestrictions.filter(r => r !== restriction)
      : [...filters.dietaryRestrictions, restriction];
    onFilterChange('dietaryRestrictions', newRestrictions);
  };

  const toggleSpiceLevel = (level: number) => {
    const newLevels = filters.spiceLevel.includes(level)
      ? filters.spiceLevel.filter(l => l !== level)
      : [...filters.spiceLevel, level];
    onFilterChange('spiceLevel', newLevels);
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.dietaryRestrictions.length +
    filters.spiceLevel.length;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">{t('categories')}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map(category => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-2 text-gray-700">
                    {category.icon && <span>{category.icon}</span>}
                    <span>{category.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('marketplacePriceRange')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {t('marketplaceMinPrice')}: ${filters.priceRange[0].toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    onFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {t('marketplaceMaxPrice')}: ${filters.priceRange[1].toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    onFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('marketplaceDietaryRestrictions')}</h3>
            <div className="space-y-2">
              {DIETARY_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.dietaryRestrictions.includes(option.value)}
                    onChange={() => toggleDietaryRestriction(option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('marketplaceSpiceLevel')}</h3>
            <div className="space-y-2">
              {SPICE_LEVELS.map(level => (
                <label
                  key={level.value}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.spiceLevel.includes(level.value)}
                    onChange={() => toggleSpiceLevel(level.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`font-medium ${level.color}`}>{level.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClearFilters}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t('marketplaceClearFilters')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t('marketplaceApplyFilters')}
          </button>
        </div>
      </div>
    </>
  );
};
