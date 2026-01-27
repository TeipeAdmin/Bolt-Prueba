import React, { useState } from 'react';
import { Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { TermsAndConditions } from './TermsAndConditions';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '+57 ',
    address: '',
    ownerName: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const { register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = t('restaurantNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDontMatch');
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t('mustAcceptTerms');
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
        setErrors({ general: result.error || t('registerError') });
      }
    } catch (err) {
      setErrors({ general: t('unexpectedError') });
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

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoogleLogin = async () => {
    setErrors({});
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setErrors({ general: result.error || 'Error al iniciar sesión con Google' });
        setLoading(false);
      }
    } catch (err) {
      setErrors({ general: 'Error inesperado' });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('registrationSuccessful')}</h2>
          <p className="text-gray-600 mb-8">
            {t('accountPendingApproval')}
          </p>
          <Button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            size="lg"
          >
            {t('backToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('registerTitle')}</h2>
          <p className="text-gray-600">{t('registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="restaurantName"
              label={`${t('restaurantName')}*`}
              value={formData.restaurantName}
              onChange={handleChange}
              error={errors.restaurantName}
              placeholder={t('restaurantNamePlaceholder')}
            />

            <Input
              name="ownerName"
              label={t('ownerName')}
              value={formData.ownerName}
              onChange={handleChange}
              placeholder={t('ownerNamePlaceholder')}
            />

            <Input
              name="email"
              type="email"
              label={`${t('contactEmail')}*`}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder={t('contactEmailPlaceholder')}
            />

            <Input
              name="phone"
              label={t('phone')}
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('phonePlaceholder')}
            />
          </div>

          <Input
            name="address"
            label={t('restaurantAddress')}
            value={formData.address}
            onChange={handleChange}
            placeholder={t('addressPlaceholder')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                name="password"
                type="password"
                label={`${t('password')}*`}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Mínimo 8 caracteres"
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y no ser común
              </p>
            </div>

            <Input
              name="confirmPassword"
              type="password"
              label={`${t('confirmPassword')}*`}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder={t('repeatPassword')}
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {t('termsAndConditions')}
              </button>{' '}
              {t('ofService')}
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
            className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-600 hover:to-red-700"
            size="lg"
          >
            {t('createAccount')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('backToLogin')}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title={t('termsModalTitle')}
        size="xl"
      >
        <TermsAndConditions onAccept={() => {
          setFormData(prev => ({ ...prev, acceptTerms: true }));
          setShowTermsModal(false);
          if (errors.acceptTerms) {
            setErrors(prev => ({ ...prev, acceptTerms: '' }));
          }
        }} />
      </Modal>
    </div>
  );
};
