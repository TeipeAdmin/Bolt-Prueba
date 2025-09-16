import React from 'react';
import { LogOut, User, Settings, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onNavigateToSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToSettings }) => {
  const { user, restaurant, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1 min-w-0">
            {restaurant?.logo && (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-8 w-8 rounded-full object-cover mr-3 flex-shrink-0"
              />
            )}
            {!restaurant?.logo && user?.role === 'restaurant_owner' && (
              <Store className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0" />
            )}
            <h1 className="text-xl font-semibold text-gray-900 truncate min-w-0">
              {user?.role === 'super_admin' ? t('superAdminPanel') : restaurant?.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="truncate max-w-48">{user?.email}</span>
            </div>
            
            {user?.role === 'restaurant_owner' && (
              <Button
                variant="ghost"
                size="sm"
                icon={Settings}
                onClick={onNavigateToSettings}
                title={t('settings')}
              />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={logout}
              title={t('logout')}
            />
          </div>
        </div>
      </div>
    </header>
  );
};