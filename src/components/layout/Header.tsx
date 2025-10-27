import React from 'react';
import { LogOut, User, Settings, Store, ChefHat } from 'lucide-react';
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
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {user?.role === 'super_admin' && (
              <div className="flex items-center gap-3">
                <img
                  src="/PLATYO FAVICON BLANCO.svg"
                  alt="Platyo"
                  className="w-10 h-10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-white truncate">Platyo</h1>
                  <p className="text-xs text-slate-400 truncate">Panel de Administración</p>
                </div>
              </div>
            )}
            {restaurant?.logo && user?.role !== 'super_admin' && (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-10 w-10 rounded-xl object-cover flex-shrink-0 shadow-md"
              />
            )}
            {!restaurant?.logo && user?.role === 'restaurant_owner' && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Store className="h-6 w-6 text-white" />
              </div>
            )}
            {user?.role !== 'super_admin' && (
              <h1 className="text-xl font-semibold text-white truncate min-w-0">
                {restaurant?.name}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-200 truncate max-w-48">{user?.email}</span>
            </div>

            {user?.role === 'restaurant_owner' && (
              <Button
                variant="ghost"
                size="sm"
                icon={Settings}
                onClick={onNavigateToSettings}
                title={t('settings')}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={logout}
              title={t('logout')}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            />
          </div>
        </div>
      </div>
    </header>
  );
};