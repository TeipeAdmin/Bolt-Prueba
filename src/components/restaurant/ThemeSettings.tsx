import React from 'react';
import { Palette } from 'lucide-react';
import { Restaurant } from '../../types';

interface ThemeSettingsProps {
  formData: Restaurant;
  updateFormData: (path: string, value: any) => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Personalización de Tema
        </h3>
        <p className="text-sm text-gray-600">
          Configura los colores, tipografía y estilos de tu menú público
        </p>
      </div>

      {/* Color Palette */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Paleta de Colores</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Color Primario
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.settings.theme.primary_color}
                onChange={(e) => updateFormData('settings.theme.primary_color', e.target.value)}
                className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.settings.theme.primary_color}
                  onChange={(e) => updateFormData('settings.theme.primary_color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Botones principales, navegación</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Color Secundario
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.settings.theme.secondary_color}
                onChange={(e) => updateFormData('settings.theme.secondary_color', e.target.value)}
                className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.settings.theme.secondary_color}
                  onChange={(e) => updateFormData('settings.theme.secondary_color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Fondos, tarjetas</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Color de Acento
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.settings.theme.accent_color}
                onChange={(e) => updateFormData('settings.theme.accent_color', e.target.value)}
                className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.settings.theme.accent_color}
                  onChange={(e) => updateFormData('settings.theme.accent_color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Precios, badges, estados</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Color de Texto
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.settings.theme.text_color}
                onChange={(e) => updateFormData('settings.theme.text_color', e.target.value)}
                className="w-14 h-14 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.settings.theme.text_color}
                  onChange={(e) => updateFormData('settings.theme.text_color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Textos principales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Tipografía</h4>

        {/* Font Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Fuente Principal
            </label>
            <select
              value={formData.settings.theme.primary_font}
              onChange={(e) => updateFormData('settings.theme.primary_font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Raleway">Raleway</option>
            </select>
            <p className="text-xs text-gray-500">Para texto de contenido</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Fuente Secundaria
            </label>
            <select
              value={formData.settings.theme.secondary_font}
              onChange={(e) => updateFormData('settings.theme.secondary_font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Merriweather">Merriweather</option>
            </select>
            <p className="text-xs text-gray-500">Para títulos y destacados</p>
          </div>
        </div>

        {/* Font Sizes */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Tamaños de Fuente</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Títulos</label>
              <input
                type="text"
                value={formData.settings.theme.font_sizes.title}
                onChange={(e) => updateFormData('settings.theme.font_sizes.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="2rem"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Subtítulos</label>
              <input
                type="text"
                value={formData.settings.theme.font_sizes.subtitle}
                onChange={(e) => updateFormData('settings.theme.font_sizes.subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="1.5rem"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Normal</label>
              <input
                type="text"
                value={formData.settings.theme.font_sizes.normal}
                onChange={(e) => updateFormData('settings.theme.font_sizes.normal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="1rem"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Pequeño</label>
              <input
                type="text"
                value={formData.settings.theme.font_sizes.small}
                onChange={(e) => updateFormData('settings.theme.font_sizes.small', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0.875rem"
              />
            </div>
          </div>
        </div>

        {/* Font Weights */}
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-3">Pesos de Fuente</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Light</label>
              <input
                type="number"
                value={formData.settings.theme.font_weights.light}
                onChange={(e) => updateFormData('settings.theme.font_weights.light', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="100"
                max="900"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Regular</label>
              <input
                type="number"
                value={formData.settings.theme.font_weights.regular}
                onChange={(e) => updateFormData('settings.theme.font_weights.regular', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="100"
                max="900"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Medium</label>
              <input
                type="number"
                value={formData.settings.theme.font_weights.medium}
                onChange={(e) => updateFormData('settings.theme.font_weights.medium', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="100"
                max="900"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Bold</label>
              <input
                type="number"
                value={formData.settings.theme.font_weights.bold}
                onChange={(e) => updateFormData('settings.theme.font_weights.bold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="100"
                max="900"
                step="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* UI Elements */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Elementos de Interfaz</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Button Style */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Estilo de Botones
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateFormData('settings.theme.button_style', 'rounded')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.settings.theme.button_style === 'rounded'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="w-full h-10 bg-blue-500 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-center">Redondeados</p>
              </button>
              <button
                type="button"
                onClick={() => updateFormData('settings.theme.button_style', 'square')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.settings.theme.button_style === 'square'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="w-full h-10 bg-blue-500 mb-2"></div>
                <p className="text-sm font-medium text-center">Rectos</p>
              </button>
            </div>
          </div>

          {/* Menu Layout */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Menú
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateFormData('settings.ui_settings.layout_type', 'list')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  formData.settings.ui_settings.layout_type === 'list'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="space-y-1 mb-2">
                  <div className="w-full h-2 bg-gray-400 rounded"></div>
                  <div className="w-full h-2 bg-gray-400 rounded"></div>
                  <div className="w-full h-2 bg-gray-400 rounded"></div>
                </div>
                <p className="text-xs font-medium text-center">Lista</p>
              </button>
              <button
                type="button"
                onClick={() => updateFormData('settings.ui_settings.layout_type', 'grid')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  formData.settings.ui_settings.layout_type === 'grid'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <div className="w-full h-3 bg-gray-400 rounded"></div>
                  <div className="w-full h-3 bg-gray-400 rounded"></div>
                  <div className="w-full h-3 bg-gray-400 rounded"></div>
                  <div className="w-full h-3 bg-gray-400 rounded"></div>
                </div>
                <p className="text-xs font-medium text-center">Grid</p>
              </button>
              <button
                type="button"
                onClick={() => updateFormData('settings.ui_settings.layout_type', 'editorial')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  formData.settings.ui_settings.layout_type === 'editorial'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="space-y-1 mb-2">
                  <div className="w-full h-4 bg-gray-400 rounded"></div>
                  <div className="w-2/3 h-2 bg-gray-300 rounded"></div>
                </div>
                <p className="text-xs font-medium text-center">Editorial</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Palette className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Sobre la personalización:</p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Los cambios se aplicarán automáticamente en tu menú público</li>
              <li>Puedes previsualizar los cambios guardando la configuración</li>
              <li>Asegúrate de que los colores tengan buen contraste para legibilidad</li>
              <li>Los tamaños de fuente aceptan valores CSS (px, rem, em)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
