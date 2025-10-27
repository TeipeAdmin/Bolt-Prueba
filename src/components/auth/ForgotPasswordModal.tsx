import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onSubmitRequest(email);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 4000);
      } else {
        setError(result.error || 'Error al enviar la solicitud');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recuperar Contraseña">
      {success ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            ¡Solicitud Enviada!
          </h3>
          <p className="text-gray-600 mb-6 text-base leading-relaxed">
            Hemos recibido tu solicitud de recuperación de contraseña.
          </p>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              Nuestro equipo se contactará contigo al email <strong className="text-orange-600">{email}</strong> para ayudarte a recuperar el acceso a tu cuenta.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start space-x-4 p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>
                Ingresa tu dirección de email y nos pondremos en contacto contigo para ayudarte a recuperar el acceso a tu cuenta.
              </p>
            </div>
          </div>

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Enviar Solicitud
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
