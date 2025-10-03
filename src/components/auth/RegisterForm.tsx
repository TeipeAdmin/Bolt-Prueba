import React, { useState } from 'react';
import { Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    ownerName: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const { t } = useLanguage();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = `Restaurant name is ${t('required')}`;
    }

    if (!formData.email.trim()) {
      newErrors.email = `Email is ${t('required')}`;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = `Password is ${t('required')}`;
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDontMatch');
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register({
        restaurantName: formData.restaurantName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        ownerName: formData.ownerName,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setErrors({ general: result.error || 'Error al registrar' });
      }
    } catch (err) {
      setErrors({ general: 'Error inesperado' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('registrationSuccessful')}</h2>
          <p className="text-gray-600 mb-6">
            {t('accountPendingApproval')}
          </p>
          <Button onClick={onSwitchToLogin} className="w-full">
            {t('backToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('registerTitle')}</h2>
          <p className="text-gray-600 mt-2">{t('registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="restaurantName"
              label={`${t('restaurantName')}*`}
              value={formData.restaurantName}
              onChange={handleChange}
              error={errors.restaurantName}
              placeholder="My Restaurant"
            />

            <Input
              name="ownerName"
              label={t('ownerName')}
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="John Doe"
            />

            <Input
              name="email"
              type="email"
              label="Email de Contacto*"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="contact@myrestaurant.com"
            />

            <Input
              name="phone"
              label={t('phone')}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <Input
            name="address"
            label="Dirección del Restaurante"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main Street, City"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="password"
              type="password"
              label={`${t('password')}*`}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Minimum 6 characters"
            />

            <Input
              name="confirmPassword"
              type="password"
              label={`${t('confirmPassword')}*`}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
            />
          </div>

          <div className="flex items-start">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
              {t('acceptTerms')}{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                términos y condiciones
              </a>{' '}
              del servicio
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-600 text-sm">{errors.acceptTerms}</p>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Crear Cuenta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};