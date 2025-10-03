import React, { useState } from 'react';
import { Mail, Check, Key, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string; code?: string }>;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onResetPassword,
}) => {
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onResetPassword(email, '', '');
      if (result.success && result.code) {
        setGeneratedCode(result.code);
        setStep('code');
      } else {
        setError(result.error || 'Error al generar el código');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const result = await onResetPassword(email, code, newPassword);
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(result.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recuperar Contraseña">
      {step === 'success' ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¡Contraseña Restablecida!
          </h3>
          <p className="text-gray-600">
            Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
      ) : step === 'email' ? (
        <form onSubmit={handleRequestCode} className="space-y-6">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              Ingresa tu dirección de email para recibir un código de recuperación.
            </p>
          </div>

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Enviar Código
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Key className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="mb-2">Se ha enviado un código a <strong>{email}</strong></p>
              <p className="font-mono bg-white px-3 py-2 rounded border border-green-300">
                Tu código es: <strong className="text-green-700">{generatedCode}</strong>
              </p>
            </div>
          </div>

          <Input
            type="text"
            label="Código de Recuperación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa el código"
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Cambiar Contraseña
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
