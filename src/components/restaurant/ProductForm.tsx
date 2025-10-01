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
  compare_at_price?: number;
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <label className="block text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          Imágenes del Producto
        </label>

        {/* Add Image from Device */}
        <div className="mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      if (file.size > 5 * 1024 * 1024) {
                        alert(`${file.name} es muy grande. Tamaño máximo: 5MB`);
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({
                          ...prev,
                          images: [...prev.images, reader.result as string]
                        }));
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden"
                  id="product-images"
                />
                <span className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm w-full justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir imágenes desde dispositivo
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">ℹ</span>
              <span>Sube imágenes de alta calidad de tu producto. Puedes seleccionar múltiples imágenes. Máximo 5MB por imagen.</span>
            </p>
          </div>
        </div>

        {/* Existing Images Grid */}
        {formData.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700 shadow-sm">
                    {index === 0 ? 'Principal' : `#${index + 1}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No hay imágenes agregadas</p>
            <p className="text-xs text-gray-400">Sube imágenes para mostrar tu producto</p>
          </div>
        )}
      </div>

      {/* Product Variations */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Variaciones y Precios *
          </label>
          <div className="flex items-center gap-4 text-sm">
            {variations.length > 1 && (
              <>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-gray-600">Desde:</span>
                  <span className="font-bold text-green-700">${getMinPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-gray-600">Hasta:</span>
                  <span className="font-bold text-green-700">${getMaxPrice().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
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
            <div key={variation.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-11">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Precio *</label>
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

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Precio Comparativo</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      value={variation.compare_at_price || ''}
                      onChange={(e) => handleVariationChange(index, 'compare_at_price', parseFloat(e.target.value) || undefined)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Precio antes del descuento</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                  <Input
                    type="text"
                    value={variation.sku || ''}
                    onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                    placeholder="SKU-001"
                  />
                </div>
              </div>

              {variation.compare_at_price && variation.compare_at_price > variation.price && (
                <div className="mt-3 pl-11 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                    {Math.round(((variation.compare_at_price - variation.price) / variation.compare_at_price) * 100)}% OFF
                  </span>
                  <span className="text-gray-600">
                    Ahorro: <span className="font-medium text-green-600">${(variation.compare_at_price - variation.price).toFixed(2)}</span>
                  </span>
                </div>
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