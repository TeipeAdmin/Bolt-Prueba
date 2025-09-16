import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Upload, Image as ImageIcon, DollarSign } from 'lucide-react';
import { Category, Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;
  onSave: (productData: any) => void;
  onCancel: () => void;
}

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  sku?: string;
}

interface ProductIngredient {
  id: string;
  name: string;
  optional: boolean;
  extra_cost?: number;
}
export const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  product,
  onSave,
  onCancel
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    status: 'active' as const,
    sku: '',
    images: [] as string[]
  });
  const [variations, setVariations] = useState<ProductVariation[]>([
    { id: '1', name: 'Default', price: 0 }
  ]);
  const [ingredients, setIngredients] = useState<ProductIngredient[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        status: product.status,
        sku: product.sku || '',
        images: product.images || []
      });
      setVariations(product.variations.length > 0 ? product.variations : [
        { id: '1', name: 'Default', price: 0 }
      ]);
      setIngredients(product.ingredients || []);
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariationChange = (index: number, field: string, value: any) => {
    setVariations(prev => prev.map((variation, i) => 
      i === index ? { ...variation, [field]: value } : variation
    ));
  };

  const addVariation = () => {
    setVariations(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', price: 0 }
    ]);
  };

  const removeVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    setIngredients(prev => prev.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    ));
  };

  const addIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', optional: false, extra_cost: 0 }
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };
  const handleImageAdd = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category_id || variations.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const productData = {
      ...formData,
      variations: variations.filter(v => v.name.trim() && v.price >= 0),
      ingredients: ingredients.filter(ing => ing.name.trim())
    };

    onSave(productData);
  };

  const getMinPrice = () => {
    const validVariations = variations.filter(v => v.price > 0);
    return validVariations.length > 0 ? Math.min(...validVariations.map(v => v.price)) : 0;
  };

  const getMaxPrice = () => {
    const validVariations = variations.filter(v => v.price > 0);
    return validVariations.length > 0 ? Math.max(...validVariations.map(v => v.price)) : 0;
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('productName')} *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')} *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter product description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <Input
            type="text"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder="Product SKU"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">{t('active')}</option>
            <option value="out_of_stock">{t('outOfStock')}</option>
            <option value="archived">{t('archived')}</option>
          </select>
        </div>
      </div>

      {/* Product Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del Producto
        </label>
        
        {/* Add New Image */}
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleImageAdd}
              disabled={!newImageUrl.trim()}
              icon={Plus}
            >
              Agregar Imagen
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Agrega la URL de una imagen para tu producto. Recomendamos imágenes de alta calidad.
          </p>
        </div>
        
        {/* Existing Images */}
        <div className="space-y-2">
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Imagen {index + 1}</p>
                <p className="text-xs text-gray-500 truncate">{image}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => handleImageRemove(index)}
                className="text-red-600 hover:text-red-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Variations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Variaciones y Precios *
          </label>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {variations.length > 1 && (
              <>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Desde: ${getMinPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Hasta: ${getMaxPrice().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="mb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={addVariation}
          >
            Agregar Variación
          </Button>
        </div>
        
        <div className="space-y-3">
          {variations.map((variation, index) => (
            <div key={variation.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={variation.name}
                  onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                  placeholder="Nombre de la variación (ej: Pequeño, Mediano, Grande)"
                />
              </div>
              <div className="w-36">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={variation.price}
                  onChange={(e) => handleVariationChange(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  min="0"
                  step="0.01"
                    className="pl-8"
                />
                </div>
              </div>
              <div className="w-32">
                <Input
                  type="text"
                  value={variation.sku || ''}
                  onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                  placeholder="SKU"
                />
              </div>
              {variations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeVariation(index)}
                  className="text-red-600 hover:text-red-700"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Product Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Ingredientes
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={addIngredient}
          >
            Agregar Ingrediente
          </Button>
        </div>
        
        {ingredients.length > 0 && (
          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="Nombre del ingrediente"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ingredient.optional}
                    onChange={(e) => handleIngredientChange(index, 'optional', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Opcional</span>
                </div>
                {ingredient.optional && (
                  <div className="w-32">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        value={ingredient.extra_cost || 0}
                        onChange={(e) => handleIngredientChange(index, 'extra_cost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="pl-8"
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeIngredient(index)}
                  className="text-red-600 hover:text-red-700"
                />
              </div>
            ))}
          </div>
        )}
        
        {ingredients.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-sm">No hay ingredientes agregados</p>
            <p className="text-gray-400 text-xs mt-1">Los ingredientes son opcionales y permiten personalizar el producto</p>
          </div>
        )}
      </div>
      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          icon={X}
          onClick={onCancel}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          icon={Save}
        >
          {product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
};