import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onPasswordChanged: (newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onPasswordChanged,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = () => {
    setError('');

    if (newPassword.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    onPasswordChanged(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title={t('changePasswordRequired')}
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>{t('provisionalPasswordDetected')}</strong>
          </p>
          <p className="text-sm text-amber-700 mt-2">
            {t('securityPasswordChange')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <Input
            label={`${t('newPassword')}*`}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('minimumCharacters')}
          />
        </div>

        <div>
          <Input
            label={`${t('confirmNewPassword')}*`}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('writePasswordAgain')}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!newPassword || !confirmPassword}
            icon={Lock}
          >
            {t('changePassword')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
